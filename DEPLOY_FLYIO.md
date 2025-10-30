# 🚀 Deploy no Fly.io (RECOMENDADO - Gratuito!)

Fly.io é a melhor opção gratuita para projetos grandes como o SigeCafé!

## 📋 Configuração Completa

### 1. **Instalar Fly CLI**

```bash
# macOS
brew install flyctl

# Ou via curl
curl -L https://fly.io/install.sh | sh
```

### 2. **Login no Fly.io**

```bash
fly auth login
```

### 3. **Criar App no Fly.io**

No diretório do projeto:

```bash
fly launch --dockerfile Dockerfile
```

Quando perguntar:
- **App name:** `sigecafe` (ou o que você quiser)
- **Region:** `gru` (São Paulo, Brasil)
- **Database:** Não (use Supabase)
- **Deploy now:** Sim

### 4. **Configurar Variáveis de Ambiente**

Após o deploy:

```bash
# Database (Supabase)
fly secrets set DATABASE_URL="postgresql://postgres:[SENHA]@[HOST]:5432/[DATABASE]"

# Auth (gere com: openssl rand -base64 32)
fly secrets set AUTH_SECRET="sua-chave-secreta-super-longa-e-segura"

# Session
fly secrets set SESSION_REFRESH_SECONDS="10"
fly secrets set SESSION_MAX_AGE_SECONDS="600"

# Node
fly secrets set NODE_ENV="production"
```

### 5. **Atualizar BASE_URL**

Depois do deploy, pegue sua URL (será algo como `https://sigecafe.fly.dev`):

```bash
fly secrets set BASE_URL="https://seu-app.fly.dev"
```

### 6. **Planos do Fly.io**

**Free Plan:**
- ✅ 3 VMs compartilhadas
- ✅ 256 MB RAM por VM
- ✅ 1 CPU compartilhado
- ✅ **Totalmente gratuito!**
- ✅ Sem timeout

**Hobby Plan ($5/mês):**
- ✅ 256 MB RAM dedicada
- ✅ 1 CPU dedicado
- ✅ Sem timeout

### 7. **Verificar Status**

```bash
# Ver logs
fly logs

# Ver status
fly status

# Abrir app
fly open
```

### 8. **Otimizar para Produção (Opcional)**

Criar `fly.toml` para ajustar recursos:

```toml
app = "sigecafe"
primary_region = "gru"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory_mb = 512
  cpu_kind = "shared"
  cpus = 1
```

## ✅ **Vantagens do Fly.io**

- ✅ **Totalmente gratuito** (3 VMs)
- ✅ **Mais memória** que Render (512 MB vs 256 MB)
- ✅ **Sem timeout** de função
- ✅ **Latência baixa** (servidores no Brasil)
- ✅ **Deploy rápido**
- ✅ **Logs em tempo real**

## 🚀 **Comandos Úteis**

```bash
# Ver logs em tempo real
fly logs

# SSH no servidor
fly ssh console

# Ver status da VM
fly status

# Escalar app
fly scale count 1

# Abrir no navegador
fly open
```

## 💡 **Se der erro:**

```bash
# Ver logs
fly logs

# Reiniciar app
fly apps restart

# Ver detalhes
fly status
```

## 🎯 **Próximos Passos:**

1. Execute `fly launch` no projeto
2. Configure as variáveis de ambiente
3. Aguarde o deploy
4. Teste a aplicação!

