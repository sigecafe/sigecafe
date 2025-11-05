import prisma from '@@/lib/prisma'
import { getServerSession } from '#auth'
import { subMonths } from 'date-fns'

export default defineEventHandler(async (event) => {
  try {
    const session = await getServerSession(event)

    // Para dev: se não tiver sessão, retorna mock
    if (!session) {
      console.warn('Sem sessão, retornando dados mock para dev')
      return JSON.parse(
        JSON.stringify([
          { mes: '2024-10', precoMedioProdutor: 0, precoArabica: 1518, precoRobusta: 1436.14 },
          { mes: '2024-11', precoMedioProdutor: 0, precoArabica: 1791.02, precoRobusta: 1582.01 },
          { mes: '2024-12', precoMedioProdutor: 0, precoArabica: 2154.89, precoRobusta: 1785.4 },
          { mes: '2025-01', precoMedioProdutor: 0, precoArabica: 2332.87, precoRobusta: 1977.68 },
          { mes: '2025-02', precoMedioProdutor: 0, precoArabica: 2627.79, precoRobusta: 2050.09 },
          { mes: '2025-03', precoMedioProdutor: 0, precoArabica: 2545.44, precoRobusta: 1998.56 },
          { mes: '2025-04', precoMedioProdutor: 1585.5, precoArabica: 2522.07, precoRobusta: 1680.66 },
          { mes: '2025-05', precoMedioProdutor: 0, precoArabica: 2569.14, precoRobusta: 1653.24 },
          { mes: '2025-09', precoMedioProdutor: 0, precoArabica: 2277.03, precoRobusta: 1358.45 },
          { mes: '2025-10', precoMedioProdutor: 0, precoArabica: 2289.68, precoRobusta: 1401.63 },
        ])
      )
    }

    const hoje = new Date()
    const inicioPeriodo = subMonths(hoje, 12)

    const safeAvg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

    // Preço médio do produtor
    const transacoes = await prisma.transacao.findMany({
      where: { status: 'CONCLUIDA', data: { gte: inicioPeriodo } },
      select: { data: true, precoUnitario: true },
    })

    const agrupadoProdutor: Record<string, number[]> = {}
    for (const t of transacoes) {
      const data = new Date(t.data)
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      if (!agrupadoProdutor[chave]) agrupadoProdutor[chave] = []
      agrupadoProdutor[chave].push(t.precoUnitario)
    }

    const mediaProdutor = Object.entries(agrupadoProdutor).map(([mes, valores]) => ({
      mes,
      precoMedioProdutor: Number(safeAvg(valores).toFixed(2)),
    }))

    // Preço CEPEA Arabica e Robusta
    const cepea = await prisma.precoCafeHistorico.findMany({
      where: { data: { gte: inicioPeriodo } },
      select: { data: true, precoArabica: true, precoRobusta: true },
    })

    const agrupadoCepea: Record<string, { arabica: number[]; robusta: number[] }> = {}
    for (const c of cepea) {
      const data = new Date(c.data)
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      if (!agrupadoCepea[chave]) agrupadoCepea[chave] = { arabica: [], robusta: [] }
      if (c.precoArabica != null) agrupadoCepea[chave].arabica.push(c.precoArabica)
      if (c.precoRobusta != null) agrupadoCepea[chave].robusta.push(c.precoRobusta)
    }

    const mediaCepea = Object.entries(agrupadoCepea).map(([mes, valores]) => ({
      mes,
      precoArabica: Number(safeAvg(valores.arabica).toFixed(2)),
      precoRobusta: Number(safeAvg(valores.robusta).toFixed(2)),
    }))

    // Junta os dois conjuntos por mês
    const meses = Array.from(
      new Set([...mediaProdutor.map(m => m.mes), ...mediaCepea.map(m => m.mes)])
    ).sort()

    const resultado = meses.map(mes => {
      const p = mediaProdutor.find(m => m.mes === mes)?.precoMedioProdutor ?? 0
      const c = mediaCepea.find(m => m.mes === mes)
      return {
        mes,
        precoMedioProdutor: p,
        precoArabica: c?.precoArabica ?? 0,
        precoRobusta: c?.precoRobusta ?? 0,
      }
    })

    // Plain object seguro
    return JSON.parse(JSON.stringify(resultado))
  } catch (error) {
    console.error('Erro ao gerar comparação de preços:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao gerar comparação de preços' })
  }
})
