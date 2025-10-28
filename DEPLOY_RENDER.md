# 🚀 Deploy no Render.com

## 📋 Configuração Completa

### 1. **Criar Conta no Render**

1. Acesse [render.com](https://render.com)
2. Faça login com GitHub
3. Selecione "New" → "Web Service"

### 2. **Conectar Repositório**

1. Selecione "Build and deploy from a Git repository"
2. Conecte seu repositório GitHub
3. Escolha `sigecafe` → `main` branch

### 3. **Configurações do Deploy**

**Name:** `sigecafe`

**Environment:** `Docker`

**Region:** `São Paulo, Brazil` (ou mais próximo de você)

**Branch:** `main`

**Root Directory:** (deixe vazio)

### 4. **Build & Deploy Settings**

**Build Command:** (deixe vazio - o Dockerfile faz tudo)

**Start Command:** (deixe vazio - o Dockerfile define)

### 5. **Variáveis de Ambiente**

Clique em "Advanced" → "Add Environment Variable":

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[SENHA]@[HOST]:5432/[DATABASE]

# Auth (gere com: openssl rand -base64 32)
AUTH_SECRET=sua-chave-secreta-super-longa-e-segura

# App URL (atualize depois do deploy)
BASE_URL=https://sigecafe.onrender.com

# Session
SESSION_REFRESH_SECONDS=10
SESSION_MAX_AGE_SECONDS=600

# Node
NODE_ENV=production
```

### 6. **Deploy**

1. Clique em "Create Web Service"
2. Aguarde o build completar (~5-10 minutos)
3. Render vai dar uma URL: `https://sigecafe.onrender.com`

### 7. **Planos do Render**

**Free Plan:**
- 512 MB RAM
- 0.1 CPU
- Pode dar timeout no primeiro deploy

**Starter Plan ($7/mês):**
- 512 MB RAM
- 0.5 CPU
- Melhor para produção

### 8. **Se der timeout no build:**

1. Upgrade para Starter Plan ($7/mês)
2. Ou use Fly.io (gratuito e melhor)

## ✅ **O que vai acontecer:**

1. Render detecta o `Dockerfile`
2. Faz build da aplicação
3. Executa `prisma migrate deploy`
4. Inicia a aplicação na porta 10000

## 🐛 **Troubleshooting**

Se der erro de memória no build:
1. Upgrade para Starter Plan
2. Ou use Fly.io (recomendado - é gratuito!)

Se der erro de timeout:
1. Upgrade para Starter Plan
2. Ou use Fly.io

## 🎯 **Recomendação Final:**

Se o Render Free der timeout, **use Fly.io**:
- ✅ Totalmente gratuito
- ✅ 3 VMs pequenas grátis
- ✅ Mais memória
- ✅ Sem timeout

