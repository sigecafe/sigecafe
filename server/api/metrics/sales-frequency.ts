import { defineEventHandler, createError } from 'h3';
import { getServerSession } from '#auth';
import prisma from '@@/lib/prisma';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    // Data de 1 ano atrás
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

    // Buscar transações do último ano
    const transacoes = await prisma.transacao.findMany({
      where: {
        data: {
          gte: umAnoAtras
        }
      },
      include: {
        produtor: {
          select: {
            name: true
          }
        }
      }
    });

    // Agrupar por produtor e contar vendas
    const vendasPorProdutor = transacoes.reduce((acc: any, transacao) => {
      const produtor = transacao.produtor.name;
      
      if (!acc[produtor]) {
        acc[produtor] = 0;
      }
      acc[produtor]++;
      
      return acc;
    }, {});

    // Converter para array e ordenar (top 10)
    const resultado = Object.entries(vendasPorProdutor)
      .map(([produtor, vendas]) => ({
        produtor,
        vendas: Number(vendas)
      }))
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 10); // Top 10 produtores

    return resultado;
  } catch (error) {
    console.error('Erro ao buscar frequência de vendas:', error);
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar dados' });
  }
});

