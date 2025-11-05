import prisma from '@@/lib/prisma'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const transacoes = await prisma.transacao.findMany({
      where: { status: 'CONCLUIDA' },
      include: { produtor: true }
    })

    const freq: Record<string, number> = {}
    for (const t of transacoes) {
      const nome = t.produtor?.name || `Produtor ${t.produtorId}`
      freq[nome] = (freq[nome] || 0) + 1
    }

    const resultado = Object.entries(freq).map(([produtor, vendas]) => ({
      produtor,
      vendas
    }))

    return resultado
  } catch (error) {
    console.error('Erro ao calcular frequência de vendas:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao calcular frequência de vendas' })
  }
})
