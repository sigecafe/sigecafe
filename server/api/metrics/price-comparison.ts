import { defineEventHandler, createError } from 'h3';
import { getServerSession } from '#auth';
import prisma from '@@/lib/prisma';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    // Data de 12 meses atrás
    const dozesMesesAtras = new Date();
    dozesMesesAtras.setMonth(dozesMesesAtras.getMonth() - 12);

    // Buscar transações dos últimos 12 meses
    const transacoes = await prisma.transacao.findMany({
      where: {
        data: {
          gte: dozesMesesAtras
        },
        status: 'CONCLUIDA'
      },
      orderBy: {
        data: 'asc'
      }
    });

    // Buscar preços históricos da CEPEA dos últimos 12 meses
    const precosCEPEA = await prisma.precoCafeHistorico.findMany({
      where: {
        data: {
          gte: dozesMesesAtras
        }
      },
      orderBy: {
        data: 'asc'
      }
    });

    // Agrupar transações por mês e calcular média
    const transacoesPorMes = transacoes.reduce((acc: any, transacao) => {
      const mes = new Date(transacao.data).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!acc[mes]) {
        acc[mes] = { total: 0, count: 0 };
      }
      acc[mes].total += transacao.precoUnitario;
      acc[mes].count++;
      
      return acc;
    }, {});

    // Agrupar preços CEPEA por mês e calcular média
    const precosCEPEAPorMes = precosCEPEA.reduce((acc: any, preco) => {
      const mes = new Date(preco.data).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!acc[mes]) {
        acc[mes] = { 
          arabica: { total: 0, count: 0 }, 
          robusta: { total: 0, count: 0 } 
        };
      }
      
      if (preco.precoArabica) {
        acc[mes].arabica.total += preco.precoArabica;
        acc[mes].arabica.count++;
      }
      
      if (preco.precoRobusta) {
        acc[mes].robusta.total += preco.precoRobusta;
        acc[mes].robusta.count++;
      }
      
      return acc;
    }, {});

    // Combinar dados e calcular médias
    const meses = new Set([
      ...Object.keys(transacoesPorMes),
      ...Object.keys(precosCEPEAPorMes)
    ]);

    const resultado = Array.from(meses).map(mes => {
      const transacao = transacoesPorMes[mes];
      const cepea = precosCEPEAPorMes[mes];
      
      return {
        mes,
        precoMedioProdutor: transacao 
          ? Number((transacao.total / transacao.count).toFixed(2))
          : 0,
        precoArabica: cepea?.arabica.count 
          ? Number((cepea.arabica.total / cepea.arabica.count).toFixed(2))
          : 0,
        precoRobusta: cepea?.robusta.count 
          ? Number((cepea.robusta.total / cepea.robusta.count).toFixed(2))
          : 0
      };
    }).sort((a, b) => {
      // Ordenar por data
      const [mesA, anoA] = a.mes.split(' ');
      const [mesB, anoB] = b.mes.split(' ');
      
      const mesesMap: any = {
        'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
      };
      
      if (anoA !== anoB) {
        return parseInt(anoA) - parseInt(anoB);
      }
      return mesesMap[mesA.toLowerCase()] - mesesMap[mesB.toLowerCase()];
    });

    return resultado;
  } catch (error) {
    console.error('Erro ao buscar comparação de preços:', error);
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar dados' });
  }
});

