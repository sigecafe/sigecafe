import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configurações
const NUM_PRODUTORES = 20;
const NUM_COMPRADORES = 15;

// Nomes realistas
const NOMES = [
  'José', 'Maria', 'João', 'Ana', 'Pedro', 'Carla', 'Paulo', 'Juliana',
  'Carlos', 'Fernanda', 'Lucas', 'Mariana', 'Rafael', 'Patricia', 'Bruno',
  'Camila', 'Felipe', 'Amanda', 'Rodrigo', 'Beatriz', 'Marcos', 'Larissa',
  'Diego', 'Gabriela', 'Thiago', 'Renata', 'Gustavo', 'Daniela', 'Leonardo',
  'Vanessa', 'Ricardo', 'Cristina', 'Anderson', 'Tatiana', 'Marcelo', 'Aline'
];

const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso',
  'Correia', 'Dias', 'Fernandes', 'Freitas', 'Monteiro', 'Mendes', 'Moreira'
];

const CIDADES_ES = [
  'Ibatiba', 'Iúna', 'Alegre', 'Guaçuí', 'Cachoeiro de Itapemirim',
  'Castelo', 'Venda Nova do Imigrante', 'Afonso Cláudio', 'Brejetuba'
];

const CIDADES_MG = [
  'Patrocínio', 'Monte Carmelo', 'Araguari', 'Uberlândia', 'Araxá',
  'Patos de Minas', 'Carmo do Paranaíba', 'Campos Altos', 'Guimarânia'
];

// Função para gerar nome completo
function gerarNome() {
  const nome = NOMES[Math.floor(Math.random() * NOMES.length)];
  const sobrenome1 = SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)];
  const sobrenome2 = SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)];
  return `${nome} ${sobrenome1} ${sobrenome2}`;
}

// Função para gerar email
function gerarEmail(nome, tipo) {
  const nomeEmail = nome.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '.');
  const dominio = tipo === 'PRODUTOR' ? 'fazenda.com' : 'comercio.com';
  const random = Math.floor(Math.random() * 999);
  return `${nomeEmail}${random}@${dominio}`;
}

// Função para gerar CPF fictício
function gerarCPF() {
  const num = () => Math.floor(Math.random() * 10);
  return `${num()}${num()}${num()}.${num()}${num()}${num()}.${num()}${num()}${num()}-${num()}${num()}`;
}

// Função para gerar celular
function gerarCelular() {
  const ddd = Math.floor(Math.random() * 20) + 11; // DDD 11-30
  const numero = Math.floor(Math.random() * 900000000) + 100000000;
  return `${ddd}9${numero}`;
}

// Função para gerar endereço
function gerarEndereco(tipo) {
  if (tipo === 'PRODUTOR') {
    const fazendas = ['Boa Vista', 'Santa Clara', 'São José', 'Esperança', 'Primavera'];
    const fazenda = fazendas[Math.floor(Math.random() * fazendas.length)];
    const km = Math.floor(Math.random() * 50) + 1;
    return `Fazenda ${fazenda}, km ${km}`;
  } else {
    const ruas = ['Rua do Comércio', 'Av. Principal', 'Rua das Flores', 'Av. Central', 'Rua São João'];
    const rua = ruas[Math.floor(Math.random() * ruas.length)];
    const numero = Math.floor(Math.random() * 2000) + 1;
    return `${rua}, ${numero}`;
  }
}

// Função para escolher cidade e estado
function escolherLocalizacao() {
  const usarES = Math.random() < 0.5;
  if (usarES) {
    return {
      cidade: CIDADES_ES[Math.floor(Math.random() * CIDADES_ES.length)],
      estadoId: 7 // Espírito Santo
    };
  } else {
    return {
      cidade: CIDADES_MG[Math.floor(Math.random() * CIDADES_MG.length)],
      estadoId: 12 // Minas Gerais
    };
  }
}

async function main() {
  console.log('🚀 Iniciando população de usuários...\n');

  // Hash da senha padrão
  const passwordHash = await bcrypt.hash('password', 10);

  // Buscar cooperativas
  const cooperativas = await prisma.cooperativa.findMany();
  
  if (cooperativas.length === 0) {
    console.error('❌ Erro: É necessário ter pelo menos 1 cooperativa cadastrada!');
    console.log('💡 Execute: npm run db:seed');
    process.exit(1);
  }

  console.log(`✅ Encontradas ${cooperativas.length} cooperativas\n`);

  // Gerar Produtores
  console.log(`👨‍🌾 Gerando ${NUM_PRODUTORES} produtores...`);
  const produtores = [];
  
  for (let i = 0; i < NUM_PRODUTORES; i++) {
    const nome = gerarNome();
    const { cidade, estadoId } = escolherLocalizacao();
    const cooperativaId = cooperativas[Math.floor(Math.random() * cooperativas.length)].id;
    
    produtores.push({
      name: nome,
      email: gerarEmail(nome, 'PRODUTOR'),
      password: passwordHash,
      celular: gerarCelular(),
      type: 'PRODUTOR',
      documento: gerarCPF(),
      endereco: gerarEndereco('PRODUTOR'),
      cidade,
      estadoId,
      cooperativaId,
      theme: ['light', 'dark', 'system'][Math.floor(Math.random() * 3)],
      fontSize: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)]
    });
  }

  await prisma.usuario.createMany({
    data: produtores,
    skipDuplicates: true
  });
  console.log(`✅ ${NUM_PRODUTORES} produtores criados\n`);

  // Gerar Compradores
  console.log(`🏢 Gerando ${NUM_COMPRADORES} compradores...`);
  const compradores = [];
  
  for (let i = 0; i < NUM_COMPRADORES; i++) {
    const nome = gerarNome();
    const { cidade, estadoId } = escolherLocalizacao();
    const cooperativaId = cooperativas[Math.floor(Math.random() * cooperativas.length)].id;
    
    compradores.push({
      name: nome,
      email: gerarEmail(nome, 'COMPRADOR'),
      password: passwordHash,
      celular: gerarCelular(),
      type: 'COMPRADOR',
      documento: gerarCPF(),
      endereco: gerarEndereco('COMPRADOR'),
      cidade,
      estadoId,
      cooperativaId,
      theme: ['light', 'dark', 'system'][Math.floor(Math.random() * 3)],
      fontSize: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)]
    });
  }

  await prisma.usuario.createMany({
    data: compradores,
    skipDuplicates: true
  });
  console.log(`✅ ${NUM_COMPRADORES} compradores criados\n`);

  // Estatísticas finais
  const totalProdutores = await prisma.usuario.count({ where: { type: 'PRODUTOR' } });
  const totalCompradores = await prisma.usuario.count({ where: { type: 'COMPRADOR' } });

  console.log('📊 Estatísticas finais:');
  console.log(`   Total de produtores: ${totalProdutores}`);
  console.log(`   Total de compradores: ${totalCompradores}`);
  console.log(`   Total de usuários: ${totalProdutores + totalCompradores}`);

  console.log('\n🎉 Processo concluído com sucesso!');
  console.log('\n💡 Agora você pode rodar:');
  console.log('   npm run db:populate-all');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

