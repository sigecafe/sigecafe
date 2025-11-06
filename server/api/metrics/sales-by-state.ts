import { defineEventHandler, createError } from 'h3';
import { getServerSession } from '#auth';
import prisma from '@@/lib/prisma';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    // Buscar vendas agrupadas por estado do produtor
    const vendas = await prisma.transacao.findMany({
      where: {
        status: 'CONCLUIDA'
      },
      include: {
        produtor: {
          include: {
            estado: true
          }
        }
      }
    });

    // Agrupar por estado e calcular total
    const vendasPorEstado = vendas.reduce((acc: any, transacao) => {
      const estado = transacao.produtor.estado?.sigla || 'Outros';
      const valorTotal = transacao.quantidade * transacao.precoUnitario;
      
      if (!acc[estado]) {
        acc[estado] = 0;
      }
      acc[estado] += valorTotal;
      
      return acc;
    }, {});

    // Converter para array e ordenar
    const resultado = Object.entries(vendasPorEstado)
      .map(([estado, totalVendas]) => ({
        estado,
        totalVendas: Number(totalVendas)
      }))
      .sort((a, b) => b.totalVendas - a.totalVendas);

    return resultado;
  } catch (error) {
    console.error('Erro ao buscar vendas por estado:', error);
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar dados' });
  }
});
