# 🚀 Deploy no Railway

## 📋 Configuração Completa

### 1. **Criar Conta no Railway**

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Crie um novo projeto

### 2. **Conectar Repositório**

1. No Railway, clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha o repositório `sigecafe`
4. Railway vai detectar o `Dockerfile` automaticamente

### 3. **Configurar Banco de Dados (Supabase)**

1. No Railway, clique em "New" → "Database" → "PostgreSQL"
2. Ou use o Supabase (recomendado)
3. Copie a connection string

### 4. **Variáveis de Ambiente**

No Railway, vá em **Settings → Variables** e adicione:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[SENHA]@[HOST]:5432/[DATABASE]

# Auth
AUTH_SECRET=sua-chave-secreta-super-longa-e-segura

# App URL (atualize depois do deploy)
BASE_URL=https://seu-app.up.railway.app

# Session
SESSION_REFRESH_SECONDS=10
SESSION_MAX_AGE_SECONDS=600

# Node
NODE_ENV=production
```

### 5. **Gerar AUTH_SECRET**

```bash
openssl rand -base64 32
```

### 6. **Deploy Automático**

O Railway vai:
1. Detectar o `Dockerfile`
2. Fazer build da aplicação
3. Executar `prisma migrate deploy`
4. Iniciar a aplicação

### 7. **Verificar Logs**

No Railway → Deployments → Logs para verificar se tudo está funcionando

## 🎯 **Vantagens do Railway**

- ✅ **Sem timeout** de função
- ✅ **Mais memória** (até 8 GB no starter)
- ✅ **Simples** de usar
- ✅ **Deploy automático** do GitHub
- ✅ **Logs em tempo real**
- ✅ **Plano gratuito** generoso (pode precisar upgrade depois)

## 🚀 **Comandos Úteis**

```bash
# Ver logs
railway logs

# Conectar ao shell
railway shell

# Abrir dashboard
railway open
```

## 💰 **Preços**

- **Hobby**: $5/mês com $5 creditos grátis
- **Starter**: $10/mês com mais recursos
- Plano gratuito: $5 de crédito (sem cartão)

## ✨ **Próximos Passos**

1. Configure as variáveis de ambiente
2. O Railway vai fazer deploy automaticamente
3. Aguarde o build completar (~5-10 min)
4. Teste a aplicação!

