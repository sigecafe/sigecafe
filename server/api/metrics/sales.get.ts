import prisma from '@@/lib/prisma'
import { getServerSession } from '#auth'

const parseISO = (dateString: string) => new Date(dateString)

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const transacoes = await prisma.transacao.findMany({
      where: { status: 'CONCLUIDA' }
    })

    if (!transacoes.length) {
      return { totalMensal: [], mediaMensal: [] }
    }

    const agrupado: Record<string, typeof transacoes> = {}
    for (const t of transacoes) {
      const data = parseISO(String(t.data))
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      if (!agrupado[chave]) agrupado[chave] = []
      agrupado[chave].push(t)
    }

    const totalMensal = []
    const mediaMensal = []

    for (const [mes, transacoesMes] of Object.entries(agrupado)) {
      const total = transacoesMes.reduce((acc, t) => acc + t.quantidade * t.precoUnitario, 0)
      const media =
        transacoesMes.reduce((acc, t) => acc + t.precoUnitario, 0) / transacoesMes.length

      totalMensal.push({ mes, total })
      mediaMensal.push({ mes, media })
    }

    return { totalMensal, mediaMensal }
  } catch (error) {
    console.error('Erro ao calcular métricas mensais:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao calcular métricas mensais' })
  }
})
