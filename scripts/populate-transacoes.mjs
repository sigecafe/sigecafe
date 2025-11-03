import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurações
const NUM_TRANSACOES = 500; // Ajuste conforme necessário
const MESES_HISTORICO = 24; // 2 anos de histórico

// Variedades e seus preços base (R$ por saca)
const VARIEDADES = {
  'Arábica': { min: 1200, max: 1800, peso: 0.5 },
  'Robusta': { min: 800, max: 1200, peso: 0.35 },
  'Conilon': { min: 700, max: 1000, peso: 0.15 }
};

// Status e suas probabilidades
const STATUS = [
  { value: 'CONCLUIDA', peso: 0.7 },
  { value: 'PENDENTE', peso: 0.2 },
  { value: 'CANCELADA', peso: 0.1 }
];

// Função para gerar data aleatória nos últimos N meses
function gerarDataAleatoria() {
  const hoje = new Date();
  const diasAtras = Math.floor(Math.random() * (MESES_HISTORICO * 30));
  const data = new Date(hoje);
  data.setDate(data.getDate() - diasAtras);
  return data;
}

// Função para escolher item baseado em peso
function escolherPonderado(items) {
  const total = items.reduce((sum, item) => sum + item.peso, 0);
  let random = Math.random() * total;
  
  for (const item of items) {
    random -= item.peso;
    if (random <= 0) return item;
  }
  return items[0];
}

// Função para gerar preço com variação sazonal
function gerarPreco(variedade, data) {
  const config = VARIEDADES[variedade];
  const mes = data.getMonth();
  
  // Variação sazonal (safra entre maio-setembro tem preços menores)
  const fatorSazonal = (mes >= 4 && mes <= 8) ? 0.9 : 1.1;
  
  // Preço base + variação aleatória + sazonalidade
  const precoBase = config.min + Math.random() * (config.max - config.min);
  const variacao = (Math.random() - 0.5) * 0.2; // ±10%
  
  return Math.round(precoBase * fatorSazonal * (1 + variacao) * 100) / 100;
}

// Função para gerar quantidade (sacas)
function gerarQuantidade() {
  // Distribuição mais realista: mais transações pequenas, algumas grandes
  const rand = Math.random();
  if (rand < 0.5) return Math.floor(Math.random() * 30) + 5; // 5-35 sacas (50%)
  if (rand < 0.8) return Math.floor(Math.random() * 70) + 30; // 30-100 sacas (30%)
  if (rand < 0.95) return Math.floor(Math.random() * 150) + 100; // 100-250 sacas (15%)
  return Math.floor(Math.random() * 500) + 250; // 250-750 sacas (5%)
}

// Observações variadas
const OBSERVACOES = [
  'Safra {ano}',
  'Qualidade premium',
  'Café especial',
  'Grão tipo 2',
  'Grão tipo 3',
  'Grão tipo 4',
  'Certificação orgânica',
  'Café do Cerrado',
  'Café da Montanha',
  'Primeira colheita',
  'Segunda colheita',
  'Entrega imediata',
  'Entrega programada',
  null,
  null // Mais chance de não ter observação
];

async function main() {
  console.log('🚀 Iniciando população do banco de dados...\n');

  // Buscar usuários existentes
  const produtores = await prisma.usuario.findMany({
    where: { type: 'PRODUTOR' }
  });

  const compradores = await prisma.usuario.findMany({
    where: { type: 'COMPRADOR' }
  });

  if (produtores.length === 0 || compradores.length === 0) {
    console.error('❌ Erro: É necessário ter pelo menos 1 produtor e 1 comprador cadastrados!');
    process.exit(1);
  }

  console.log(`✅ Encontrados ${produtores.length} produtores e ${compradores.length} compradores\n`);

  // Limpar transações antigas (opcional - comente se quiser manter)
  console.log('🗑️  Limpando transações antigas...');
  await prisma.transacao.deleteMany({});
  console.log('✅ Transações antigas removidas\n');

  // Gerar transações
  console.log(`📊 Gerando ${NUM_TRANSACOES} transações...\n`);
  
  const transacoes = [];
  const variedadesKeys = Object.keys(VARIEDADES);
  
  for (let i = 0; i < NUM_TRANSACOES; i++) {
    const data = gerarDataAleatoria();
    const variedade = escolherPonderado(
      variedadesKeys.map(v => ({ value: v, peso: VARIEDADES[v].peso }))
    ).value;
    
    const precoUnitario = gerarPreco(variedade, data);
    const quantidade = gerarQuantidade();
    const status = escolherPonderado(STATUS).value;
    const produtor = produtores[Math.floor(Math.random() * produtores.length)];
    const comprador = compradores[Math.floor(Math.random() * compradores.length)];
    
    const observacao = OBSERVACOES[Math.floor(Math.random() * OBSERVACOES.length)];
    const observacoes = observacao ? observacao.replace('{ano}', data.getFullYear().toString()) : null;

    transacoes.push({
      data,
      quantidade,
      precoUnitario,
      status,
      variedade,
      observacoes,
      compradorId: comprador.id,
      produtorId: produtor.id
    });

    // Progresso
    if ((i + 1) % 50 === 0) {
      console.log(`   Geradas ${i + 1}/${NUM_TRANSACOES} transações...`);
    }
  }

  // Inserir em lote
  console.log('\n💾 Inserindo transações no banco...');
  await prisma.transacao.createMany({
    data: transacoes
  });

  console.log(`✅ ${NUM_TRANSACOES} transações inseridas com sucesso!\n`);

  // Estatísticas
  console.log('📈 Estatísticas:');
  
  const stats = {
    total: transacoes.length,
    porVariedade: {},
    porStatus: {},
    volumeTotal: transacoes.reduce((sum, t) => sum + t.quantidade, 0),
    valorTotal: transacoes.reduce((sum, t) => sum + (t.quantidade * t.precoUnitario), 0)
  };

  transacoes.forEach(t => {
    stats.porVariedade[t.variedade] = (stats.porVariedade[t.variedade] || 0) + 1;
    stats.porStatus[t.status] = (stats.porStatus[t.status] || 0) + 1;
  });

  console.log(`   Total de transações: ${stats.total}`);
  console.log(`   Volume total: ${stats.volumeTotal.toLocaleString('pt-BR')} sacas`);
  console.log(`   Valor total: R$ ${stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  console.log(`   Valor médio por saca: R$ ${(stats.valorTotal / stats.volumeTotal).toFixed(2)}`);
  console.log('\n   Por variedade:');
  Object.entries(stats.porVariedade).forEach(([v, count]) => {
    console.log(`      ${v}: ${count} (${((count/stats.total)*100).toFixed(1)}%)`);
  });
  console.log('\n   Por status:');
  Object.entries(stats.porStatus).forEach(([s, count]) => {
    console.log(`      ${s}: ${count} (${((count/stats.total)*100).toFixed(1)}%)`);
  });

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
