import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurações
const DIAS_HISTORICO = 730; // 2 anos de dados diários

// Preços base iniciais (há 2 anos)
const PRECOS_BASE = {
  arabica: 1400,
  robusta: 950
};

// Função para gerar variação de preço realista
function gerarVariacao(precoAtual, mes, dia) {
  // Tendência de longo prazo (leve alta ao longo do tempo)
  const tendencia = 1 + (Math.random() * 0.0002);
  
  // Sazonalidade (safra entre maio-setembro)
  let sazonalidade = 1;
  if (mes >= 4 && mes <= 8) {
    sazonalidade = 0.95; // Preços menores na safra
  } else if (mes >= 0 && mes <= 2) {
    sazonalidade = 1.08; // Preços maiores na entressafra
  }
  
  // Volatilidade diária (±2%)
  const volatilidade = 1 + ((Math.random() - 0.5) * 0.04);
  
  // Eventos aleatórios (5% de chance de variação maior)
  let evento = 1;
  if (Math.random() < 0.05) {
    evento = 1 + ((Math.random() - 0.5) * 0.15); // ±7.5%
  }
  
  return precoAtual * tendencia * sazonalidade * volatilidade * evento;
}

async function main() {
  console.log('🚀 Iniciando população de preços históricos...\n');

  // Limpar preços antigos (opcional)
  console.log('🗑️  Limpando preços históricos antigos...');
  await prisma.precoCafeHistorico.deleteMany({});
  console.log('✅ Preços antigos removidos\n');

  console.log(`📊 Gerando ${DIAS_HISTORICO} dias de histórico de preços...\n`);

  const precos = [];
  let precoArabica = PRECOS_BASE.arabica;
  let precoRobusta = PRECOS_BASE.robusta;

  const hoje = new Date();
  
  for (let i = DIAS_HISTORICO; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    
    // Pular finais de semana (mercado fechado)
    const diaSemana = data.getDay();
    if (diaSemana === 0 || diaSemana === 6) continue;
    
    const mes = data.getMonth();
    const dia = data.getDate();
    
    // Gerar novos preços baseados nos anteriores
    precoArabica = gerarVariacao(precoArabica, mes, dia);
    precoRobusta = gerarVariacao(precoRobusta, mes, dia);
    
    // Manter correlação entre Arábica e Robusta
    const correlacao = 0.7;
    const variacaoArabica = (precoArabica / PRECOS_BASE.arabica) - 1;
    precoRobusta = PRECOS_BASE.robusta * (1 + (variacaoArabica * correlacao));
    
    precos.push({
      data,
      precoArabica: Math.round(precoArabica * 100) / 100,
      precoRobusta: Math.round(precoRobusta * 100) / 100,
      fonte: 'CEPEA/ESALQ'
    });

    // Progresso
    if (precos.length % 50 === 0) {
      console.log(`   Gerados ${precos.length} registros...`);
    }
  }

  // Inserir em lote
  console.log('\n💾 Inserindo preços no banco...');
  await prisma.precoCafeHistorico.createMany({
    data: precos
  });

  console.log(`✅ ${precos.length} registros de preços inseridos com sucesso!\n`);

  // Estatísticas
  const ultimoPreco = precos[precos.length - 1];
  const primeiroPreco = precos[0];
  
  const variacaoArabica = ((ultimoPreco.precoArabica - primeiroPreco.precoArabica) / primeiroPreco.precoArabica) * 100;
  const variacaoRobusta = ((ultimoPreco.precoRobusta - primeiroPreco.precoRobusta) / primeiroPreco.precoRobusta) * 100;
  
  const maxArabica = Math.max(...precos.map(p => p.precoArabica));
  const minArabica = Math.min(...precos.map(p => p.precoArabica));
  const maxRobusta = Math.max(...precos.map(p => p.precoRobusta));
  const minRobusta = Math.min(...precos.map(p => p.precoRobusta));

  console.log('📈 Estatísticas:');
  console.log(`\n   Arábica:`);
  console.log(`      Preço inicial: R$ ${primeiroPreco.precoArabica.toFixed(2)}`);
  console.log(`      Preço atual: R$ ${ultimoPreco.precoArabica.toFixed(2)}`);
  console.log(`      Variação: ${variacaoArabica > 0 ? '+' : ''}${variacaoArabica.toFixed(2)}%`);
  console.log(`      Máximo: R$ ${maxArabica.toFixed(2)}`);
  console.log(`      Mínimo: R$ ${minArabica.toFixed(2)}`);
  
  console.log(`\n   Robusta:`);
  console.log(`      Preço inicial: R$ ${primeiroPreco.precoRobusta.toFixed(2)}`);
  console.log(`      Preço atual: R$ ${ultimoPreco.precoRobusta.toFixed(2)}`);
  console.log(`      Variação: ${variacaoRobusta > 0 ? '+' : ''}${variacaoRobusta.toFixed(2)}%`);
  console.log(`      Máximo: R$ ${maxRobusta.toFixed(2)}`);
  console.log(`      Mínimo: R$ ${minRobusta.toFixed(2)}`);

  console.log('\n🎉 Processo concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
