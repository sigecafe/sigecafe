import { getServerSession } from '#auth'
import { getQuery } from 'h3'
import * as cheerio from 'cheerio'
import { ofetch } from 'ofetch'
import prisma from '@@/lib/prisma'
import puppeteer from 'puppeteer'

const CEPEA_URL = 'https://www.cepea.org.br/br/indicador/cafe.aspx'

// Define interface for the PrecoCafeHistorico model
interface PrecoCafeHistorico {
  id: number
  data: Date
  precoRobusta: number | null
  precoArabica: number | null
  fonte: string | null
  createdAt: Date
}

export default defineEventHandler(async (event) => {
  // Validate authentication
  const session = await getServerSession(event)
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Você precisa estar autenticado para acessar esta funcionalidade'
    })
  }

  try {
    if (event.method === 'GET') {
      // Determine if cache should be bypassed via ?force=true
      const query = getQuery(event)
      const forceFetch = query.force === 'true' || query.force === true
      // console.log(`[coffee-prices] GET request received; forceFetch=${forceFetch}`)

      // Return recent cached price if not forcing a new fetch
      if (!forceFetch) {
        const lastDay = new Date()
        // console.log(`[coffee-prices] Checking cache for data since ${lastDay.toISOString()}`)
        lastDay.setDate(lastDay.getDate() - 1)
        const recentPrices = await prisma.$queryRaw<PrecoCafeHistorico[]>`
          SELECT * FROM "PrecoCafeHistorico"
          WHERE "data" >= ${lastDay}
          ORDER BY "data" DESC
          LIMIT 1
        `
        // console.log('[coffee-prices] recentPrices from DB:', recentPrices)
        if (recentPrices && recentPrices.length > 0) {
        const price = recentPrices[0]!
          // console.log('[coffee-prices] Returning cached prices:', price)
          return {
            success: true,
            data: {
              arabica: price.precoArabica,
              robusta: price.precoRobusta,
              date: price.data
            }
          }
        }
      }

      // No cache hit or forcing new fetch: fetch latest prices from external source
      // console.log('[coffee-prices] No cached data or forceFetch; calling fetchLatestPrices()')
      const prices = await fetchLatestPrices()
      // console.log('[coffee-prices] fetchLatestPrices returned:', prices)
      const { arabica, robusta, date, isFallback } = prices

      // Persist to database only if fetch was successful (not fallback)
      if (!isFallback && arabica != null && robusta != null) {
        // console.log(`[coffee-prices] Persisting new prices to DB: arabica=${arabica}, robusta=${robusta}`)
        await prisma.$executeRaw`
          INSERT INTO "PrecoCafeHistorico" ("data", "precoArabica", "precoRobusta", "fonte")
          VALUES (${date}, ${arabica}, ${robusta}, 'CEPEA/ESALQ')
        `
      }

      return {
        success: true,
        data: { arabica, robusta, date }
      }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Método não permitido'
    })
  } catch (error) {
    console.error('Error fetching coffee prices:', error)
    return {
      success: false,
      message: 'Erro ao buscar preços do café'
    }
  }
})

// Function to fetch prices from external source with headless browser first, then HTTP fallback
async function fetchLatestPrices() {
  // console.log('[fetchLatestPrices] Starting price fetch via Puppeteer')
  // Attempt headless browser scraper first
  try {
    // console.log('[fetchLatestPrices] Launching Puppeteer')
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    })
    const page = await browser.newPage()
    // mimic typical browser environment
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                            '(KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36')
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7' })
    await page.goto(CEPEA_URL, { waitUntil: 'networkidle0', timeout: 60000 })
    // console.log('[fetchLatestPrices] Puppeteer page loaded')

    // Extract table data in browser context
    const data = await page.evaluate(() => {
      const result: Record<string, string> = {}
      // Arábica table
      // @ts-ignore - Running in browser context via Puppeteer
      const arabicaTable = document.querySelector('#imagenet-indicador1')
      if (arabicaTable) {
        const row = arabicaTable.querySelector('tbody tr')
        const cells = row?.querySelectorAll('td') ?? []
        result.arabicaText = cells[1]?.textContent?.trim() ?? ''
      }
      // Robusta table (second .imagenet-table)
      // @ts-ignore - Running in browser context via Puppeteer
      const tables = document.querySelectorAll('table.imagenet-table')
      if (tables.length >= 2) {
        const robustaTable = tables[1]!
        const row = robustaTable.querySelector('tbody tr')
        const cells = row?.querySelectorAll('td') ?? []
        result.robustaText = cells[1]?.textContent?.trim() ?? ''
      }
      return result
    })
    await browser.close()
    // console.log('[fetchLatestPrices] Puppeteer evaluation data:', data)

    // Parse values and detect fallback
    let arabicaPrice = 0, robustaPrice = 0, isFallback = false
    if (data.arabicaText) {
      arabicaPrice = parseFloat(data.arabicaText
        .replace('R$', '').replace(/\./g, '').replace(',', '.').trim())
    } else {
      isFallback = true
    }
    if (data.robustaText) {
      robustaPrice = parseFloat(data.robustaText
        .replace('R$', '').replace(/\./g, '').replace(',', '.').trim())
    } else {
      isFallback = true
    }
    const result = { arabica: arabicaPrice, robusta: robustaPrice, date: new Date(), isFallback }
    // console.log('[fetchLatestPrices] Puppeteer parsed result:', result)
    return result
  } catch (err) {
    console.error('[fetchLatestPrices] Puppeteer scrape failed:', err)
    // console.log('[fetchLatestPrices] Falling back to HTTP+Cheerio fetch')
  }

  // HTTP+Cheerio fallback
  try {
    // console.log('[fetchLatestPrices] Sending HTTP request to CEPEA')
    const response = await ofetch(CEPEA_URL, {
      responseType: 'text',
      retry: 3,
      timeout: 10000,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    })
    // console.log('[fetchLatestPrices] HTTP request successful; response length =', response.length)
    const $ = cheerio.load(response)
    // console.log('[fetchLatestPrices] HTML loaded into Cheerio')

    let isFallback = false, arabicaPrice = 0, robustaPrice = 0
    const arabicaElement = $('#imagenet-indicador-cafe .imagenet-center td.text:contains("Arábica")').next()
    // console.log('[fetchLatestPrices] arabicaElement found:', arabicaElement.length)
    if (arabicaElement.length) {
      const txt = arabicaElement.text().trim()
      // console.log('[fetchLatestPrices] Raw arabica text:', txt)
      arabicaPrice = parseFloat(txt.replace('R$', '').replace('.', '').replace(',', '.').trim())
    } else {
      isFallback = true
    }
    // console.log('[fetchLatestPrices] Parsed arabicaPrice =', arabicaPrice)

    const robustaElement = $('#imagenet-indicador-cafe .imagenet-center td.text:contains("Robusta")').next()
    // console.log('[fetchLatestPrices] robustaElement found:', robustaElement.length)
    if (robustaElement.length) {
      const txt = robustaElement.text().trim()
      // console.log('[fetchLatestPrices] Raw robusta text:', txt)
      robustaPrice = parseFloat(txt.replace('R$', '').replace('.', '').replace(',', '.').trim())
    } else {
      isFallback = true
    }
    // console.log('[fetchLatestPrices] Parsed robustaPrice =', robustaPrice)

    const fallbackResult = { arabica: arabicaPrice, robusta: robustaPrice, date: new Date(), isFallback }
    // console.log('[fetchLatestPrices] Returning fallback Cheerio result:', fallbackResult)
    return fallbackResult
  } catch (error) {
    console.error('[fetchLatestPrices] HTTP+Cheerio fetch failed:', error)
    const fallback = { arabica: 2560.75, robusta: 1678.9, date: new Date(), isFallback: true }
    // console.log('[fetchLatestPrices] Returning final fallback:', fallback)
    return fallback
  }
}