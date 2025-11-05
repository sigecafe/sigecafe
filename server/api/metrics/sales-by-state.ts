import prisma from '@@/lib/prisma'

export default defineEventHandler(async () => {
  try {
    const transacoesRaw = await prisma.transacao.findMany({
      where: { status: 'CONCLUIDA' },
      select: {
        quantidade: true,
        precoUnitario: true,
        produtorId: true,
        produtor: {
          select: {
            id: true,
            estado: { select: { sigla: true } },
            cooperativaId: true 
          }
        }
      }
    })

    const transacoes = transacoesRaw.map(t => ({
      quantidade: Number(t.quantidade),
      precoUnitario: Number(t.precoUnitario),
      estado: t.produtor?.estado?.sigla ?? null
    }))

    const vendasPorEstado: Record<string, number> = {}
    for (const t of transacoes) {
      if (!t.estado) continue
      const total = t.quantidade * t.precoUnitario
      vendasPorEstado[t.estado] = (vendasPorEstado[t.estado] || 0) + total
    }

    const resultado = Object.entries(vendasPorEstado).map(([sigla, total]) => ({
      estado: sigla,
      totalVendas: Number(total.toFixed(2))
    }))

    return JSON.parse(JSON.stringify(resultado))
  } catch (error) {
    console.error('Erro ao gerar dados de vendas por estado:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao gerar dados de vendas por estado'
    })
  }
})
