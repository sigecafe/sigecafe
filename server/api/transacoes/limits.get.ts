import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // Buscar valores mínimos e máximos
    const result = await prisma.transacao.aggregate({
      _min: {
        quantidade: true,
        precoUnitario: true,
        data: true
      },
      _max: {
        quantidade: true,
        precoUnitario: true,
        data: true
      }
    });

    // Buscar todas as transações para calcular os valores mínimos e máximos
    const transacoes = await prisma.transacao.findMany({
      select: {
        quantidade: true,
        precoUnitario: true
      }
    });

    // Calcular valorTotal para cada transação
    const valores = transacoes.map(t => t.quantidade * t.precoUnitario);

    // Encontrar o valor mínimo e máximo
    const minValue = valores.length ? Math.min(...valores) : 0;
    const maxValue = valores.length ? Math.max(...valores) : 0;

    return {
      minValue,
      maxValue,
      minDate: result._min.data || new Date(),
      maxDate: result._max.data || new Date()
    };
  } catch (error) {
    console.error('Erro ao buscar limites:', error);
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar limites'
    });
  }
});