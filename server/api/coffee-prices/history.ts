import { defineEventHandler, createError, getQuery } from 'h3'
import { getServerSession } from '#auth'
import prisma from '@@/lib/prisma'
import type { PrecoCafeDTO } from '~/types/api'

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const query = getQuery(event)
    const period = query.period as string || 'year' // Default to year

    let startDate: Date | undefined
    const now = new Date()

    if (period === 'month') {
      // Filter by last month
      startDate = new Date()
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === 'year') {
      // Filter by last year
      startDate = new Date()
      startDate.setFullYear(now.getFullYear() - 1)
    } else {
      // Filter by week
      startDate = new Date()
      startDate.setDate(now.getDate() - 7)
    }

    const history = await prisma.precoCafeHistorico.findMany({
      where: startDate ? {
        data: {
          gte: startDate
        }
      } : undefined,
      orderBy: { data: 'asc' }
    })

    // Map to DTO
    const data: PrecoCafeDTO[] = history.map(h => ({
      id: h.id,
      data: h.data,
      precoRobusta: h.precoRobusta,
      precoArabica: h.precoArabica,
      fonte: h.fonte
    }))

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching coffee price history:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch history' })
  }
})