# SigeCafé

Bem-vindo ao SigeCafé, uma plataforma de gestão inovadora que revoluciona a comunicação e negócios entre cafeicultores e cooperativas de exportação. Nossa solução oferece um ecossistema digital completo que integra gestão de vendas e comunicação.

Desenvolvida com tecnologias modernas e focada na experiência do usuário, nossa plataforma permite que cafeicultores e cooperativas gerenciem eficientemente suas operações diárias enquanto mantêm todos os envolvidos constantemente informados.

### Principais Diferenciais

- **Comunicação Instantânea**: Integração nativa com WhatsApp para notificações automáticas e personalizáveis
- **Multi-perfil**: Interfaces específicas para cooperativas, produtores e compradores
- **Gestão Completa**: Controle de transações, preços, associados e relatórios
- **Análise de Dados**: Dashboards interativos com métricas e indicadores de desempenho
- **Segurança**: Autenticação robusta e controle granular de permissões
- **Experiência Adaptativa**: Interface responsiva com suporte a temas claro/escuro

### Para Quem é Destinado

- **Cooperativas**: Otimize processos administrativos e comerciais
- **Produtores**: Gerencie suas vendas e acompanhe preços do mercado
- **Compradores**: Tenha acesso a uma plataforma organizada para suas compras
- **Gestores**: Monitore indicadores e tome decisões baseadas em dados

## Visão Geral

Este projeto utiliza uma arquitetura robusta baseada em:
- **Frontend**: Nuxt.js 4 com TailwindCSS
- **Backend**: Node.js com Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Notificações**: API WPPConnect para WhatsApp
- **UI Components**: UI-Thing e Radix Vue
- **Autenticação**: Auth.js com refresh token
- **Testes**: Vitest e Playwright

## Funcionalidades Principais

- **Sistema de Notificações**
  - Envio automático via WhatsApp
  - Notificações de transações e preços
  - Sistema de reenvio para mensagens falhas
  - Personalização de preferências de notificação

- **Portal de Acesso**
  - Dashboard personalizado por perfil de usuário
  - Sistema de autenticação seguro
  - Controle de acesso baseado em funções (RBAC)
  - Interface adaptativa (modo claro/escuro)

- **Gestão de Transações**
  - Registro e acompanhamento de vendas
  - Controle de preços
  - Gestão de associados
  - Análise de desempenho

- **Área do Produtor e Comprador**
  - Visualização do histórico de transações
  - Histórico de notificações
  - Comunicação direta com a cooperativa
  - Acompanhamento de preços do mercado

## Pré-requisitos

- Git
- Node.js v20 (via NVM)
- PostgreSQL
- NPM ou PNPM

## Configuração do Ambiente

1. **Configuração do Git**

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

### Adicionando Chave SSH ao GitHub

Para uma colaboração mais segura e sem a necessidade de autenticação frequente, adicione uma chave SSH ao seu perfil no GitHub:

1. **Criar uma Chave SSH**:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"
   ```
   Siga as instruções no terminal para salvar a chave no local padrão e, opcionalmente, defina uma senha para maior segurança.

2. **Copiar a Chave Pública** para a área de transferência:
   ```bash
   cat ~/.ssh/id_rsa.pub | clip
   ```
   - No macOS: `pbcopy < ~/.ssh/id_rsa.pub`
   - No Linux: Instale `xclip` ou `xsel` para copiar para a área de transferência.

3. **Adicionar a Chave ao GitHub**:
   - Acesse [GitHub SSH and GPG keys](https://github.com/settings/keys)
   - Clique em "New SSH Key", nomeie sua chave e cole o conteúdo no campo apropriado.
   - Confirme a adição clicando em "Add SSH Key".

### Clonando e Configurando o Repositório

Obtenha uma cópia local do código-fonte e prepare seu ambiente de desenvolvimento:

```bash
git clone git@github.com:mauriciobellon/sigecafe.git
cd sigecafe
git checkout -b feature/<seuNome>
```

### Configurando o Node.js e Instalando Dependências

Utilize o NVM para instalar e usar a versão apropriada do Node.js:

```bash
nvm install 20
nvm use 20
npm install
```

## Scripts Disponíveis

### Desenvolvimento
- `npm run dev` - Inicia o servidor de desenvolvimento com hot-reload
- `npm run build` - Compila o projeto para produção
- `npm run preview` - Inicia o servidor de preview da build
- `npm run generate` - Gera uma versão estática do site

### Banco de Dados
- `npm run db` - Executa a sequência completa de setup do banco (down, up, migrate, seed)
- `npm run db:up` - Cria o banco de dados
- `npm run db:down` - Remove o banco de dados
- `npm run db:migrate` - Executa as migrações do Prisma
- `npm run db:seed` - Popula o banco com dados iniciais
- `npm run db:reset` - Reseta o banco de dados (força o reset)
- `npm run db:studio` - Abre o Prisma Studio para gerenciamento visual do banco

### Testes
- `npm run test` - Executa os testes do projeto
- `npm run install-playwright` - Instala o Playwright com dependências do Chromium

### Utilitários
- `npm run env` - Cria os arquivos de ambiente necessários
- `npm run kill` - Mata processos do servidor em execução
- `npm run all` - Executa instalação, build e preview em sequência
- `npm run postinstall` - Script executado automaticamente após npm install (prepara Nuxt, env e banco)


## Estrutura de Testes

- **Testes Unitários**: Componentes, utils e validações
- **Testes de Integração**: APIs e fluxos de dados
- **Testes E2E**: Fluxos completos de usuário
- **Testes de Performance**: Carga e estresse

## Deploy

O projeto está configurado para deploy na plataforma Coolify, oferecendo:
- Suporte a aplicações full-stack
- Banco de dados PostgreSQL integrado
- CLI simplificada para deploy
- Certificados SSL automáticos

## Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Diretrizes de Contribuição

- Mantenha o código limpo e documentado
- Siga os padrões de commit do projeto
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário

## Licença

Este projeto está licenciado sob a [GNU General Public License v3.0](LICENSE).
