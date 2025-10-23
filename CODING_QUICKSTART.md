# 🚀 SigeCafé - Guia Rápido de CRUD

Este guia mostra como implementar operações CRUD (Create, Read, Update, Delete) no projeto SigeCafé seguindo os padrões estabelecidos.

## 📋 Índice

1. [Estrutura do Projeto](#estrutura-do-projeto)
2. [Padrões de Implementação](#padrões-de-implementação)
3. [Exemplo Completo: CRUD de Produtos](#exemplo-completo-crud-de-produtos)
4. [Componentes Frontend](#componentes-frontend)
5. [Testes](#testes)
6. [Dicas e Boas Práticas](#dicas-e-boas-práticas)

## 🏗️ Estrutura do Projeto

```
sigecafe/
├── server/
│   ├── api/                    # Endpoints da API
│   │   └── [recurso]/
│   │       ├── index.ts        # GET (listar) e POST (criar)
│   │       └── [id].ts         # GET, PUT, DELETE por ID
│   └── repositories/           # Camada de acesso a dados
│       └── [Recurso]Repository.ts
├── app/
│   ├── pages/app/              # Páginas da aplicação
│   ├── components/             # Componentes Vue
│   ├── stores/                 # Gerenciamento de estado (Pinia)
│   └── types/                  # Definições de tipos TypeScript
└── prisma/
    └── schema.prisma           # Schema do banco de dados
```

## 🎯 Padrões de Implementação

### 1. **Schema do Banco (Prisma)**

```prisma
// prisma/schema.prisma
model Produto {
  id          Int      @id @default(autoincrement())
  nome        String
  descricao   String?
  preco       Float
  categoria   String
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  cooperativa   Cooperativa @relation(fields: [cooperativaId], references: [id])
  cooperativaId Int
}
```

### 2. **Repository Pattern**

```typescript
// server/repositories/ProdutoRepository.ts
import prisma from '@@/lib/prisma'
import type { Produto } from '@prisma/client'

export class ProdutoRepository {
  // READ - Listar todos
  async findAll(filters?: ProdutoFilterDTO): Promise<Produto[]> {
    return prisma.produto.findMany({
      where: {
        ...(filters?.categoria && { categoria: filters.categoria }),
        ...(filters?.ativo !== undefined && { ativo: filters.ativo }),
        ...(filters?.cooperativaId && { cooperativaId: filters.cooperativaId })
      },
      include: {
        cooperativa: true
      }
    })
  }

  // READ - Buscar por ID
  async findById(id: number): Promise<Produto | null> {
    return prisma.produto.findUnique({
      where: { id },
      include: { cooperativa: true }
    })
  }

  // CREATE - Criar novo
  async create(data: CreateProdutoDTO): Promise<Produto> {
    return prisma.produto.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        categoria: data.categoria,
        cooperativaId: data.cooperativaId
      },
      include: { cooperativa: true }
    })
  }

  // UPDATE - Atualizar
  async update(id: number, data: UpdateProdutoDTO): Promise<Produto> {
    return prisma.produto.update({
      where: { id },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.preco && { preco: data.preco }),
        ...(data.categoria && { categoria: data.categoria }),
        ...(data.ativo !== undefined && { ativo: data.ativo })
      },
      include: { cooperativa: true }
    })
  }

  // DELETE - Remover
  async delete(id: number): Promise<void> {
    await prisma.produto.delete({ where: { id } })
  }
}
```

### 3. **API Endpoints - Formatos Específicos do Projeto**

⚠️ **IMPORTANTE**: O projeto SigeCafé usa formatos específicos para as APIs que diferem do padrão REST comum:

#### **Formato das Requisições:**

```typescript
// ✅ CREATE - POST /api/[modelo]
POST /api/colaborador
{
  "name": "João Silva",
  "celular": "11999999999",
  "cargo": "Gerente"
}

// ✅ UPDATE - PUT /api/[modelo] (sem ID na URL!)
PUT /api/colaborador
{
  "id": 123,
  "name": "João Silva Atualizado",
  "celular": "11999999999"
}

// ✅ DELETE - DELETE /api/[modelo] (formato específico!)
DELETE /api/colaborador
{
  "usuario": {
    "id": 123,
    "name": "João Silva",
    "celular": "11999999999"
  }
}

// ✅ READ - GET /api/[modelo]
GET /api/colaborador
// Retorna array de objetos
```

#### **Listar e Criar (index.ts)**
```typescript
// server/api/produtos/index.ts
import { defineEventHandler, readBody, createError, getQuery } from 'h3'
import { getServerSession } from '#auth'
import { ProdutoRepository } from '@@/server/repositories/ProdutoRepository'
import type { CreateProdutoDTO, ProdutoFilterDTO } from '~/types/api'

const repository = new ProdutoRepository()

export default defineEventHandler(async (event) => {
  // Autenticação obrigatória
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const user = session.user as any

  try {
    if (event.method === 'GET') {
      // Listar produtos com filtros
      const query = getQuery(event)
      const filters: ProdutoFilterDTO = {
        categoria: query.categoria as string,
        ativo: query.ativo ? query.ativo === 'true' : undefined,
        cooperativaId: user.cooperativaId
      }
      
      return await repository.findAll(filters)
    }

    if (event.method === 'POST') {
      // Criar novo produto
      const body = await readBody<CreateProdutoDTO>(event)
      
      // Validações
      if (!body.nome || !body.preco || !body.categoria) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Campos obrigatórios: nome, preco, categoria'
        })
      }

      // Adicionar cooperativaId do usuário logado
      const produtoData = {
        ...body,
        cooperativaId: user.cooperativaId
      }

      return await repository.create(produtoData)
    }

    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
      cause: error
    })
  }
})
```

#### **Operações por ID ([id].ts)**
```typescript
// server/api/produtos/[id].ts
import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { getServerSession } from '#auth'
import { ProdutoRepository } from '@@/server/repositories/ProdutoRepository'
import type { UpdateProdutoDTO } from '~/types/api'

const repository = new ProdutoRepository()

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const user = session.user as any
  const id = parseInt(getRouterParam(event, 'id') || '0')

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  try {
    switch (event.method) {
      case 'GET':
        // Buscar produto por ID
        const produto = await repository.findById(id)
        if (!produto) {
          throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
        }
        
        // Verificar se pertence à cooperativa do usuário
        if (produto.cooperativaId !== user.cooperativaId) {
          throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
        }
        
        return produto

      case 'PUT':
        // Atualizar produto
        const updateData = await readBody<UpdateProdutoDTO>(event)
        
        // Verificar se o produto existe e pertence à cooperativa
        const existingProduto = await repository.findById(id)
        if (!existingProduto || existingProduto.cooperativaId !== user.cooperativaId) {
          throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
        }

        return await repository.update(id, updateData)

      case 'DELETE':
        // Remover produto
        const produtoToDelete = await repository.findById(id)
        if (!produtoToDelete || produtoToDelete.cooperativaId !== user.cooperativaId) {
          throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
        }

        await repository.delete(id)
        return { success: true, message: 'Produto removido com sucesso' }

      default:
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
      cause: error
    })
  }
})
```

### 4. **Tipos TypeScript**

```typescript
// app/types/api.ts

export interface ProdutoDTO {
  id: number
  nome: string
  descricao?: string | null
  preco: number
  categoria: string
  ativo: boolean
  cooperativaId: number
  createdAt: Date
  updatedAt: Date
  cooperativa?: {
    id: number
    nome: string
  }
}

export interface CreateProdutoDTO {
  nome: string
  descricao?: string
  preco: number
  categoria: string
  cooperativaId: number
}

export interface UpdateProdutoDTO {
  nome?: string
  descricao?: string
  preco?: number
  categoria?: string
  ativo?: boolean
}

export interface ProdutoFilterDTO {
  categoria?: string
  ativo?: boolean
  cooperativaId?: number
  page?: number
  limit?: number
}
```

## 🎨 Componentes Frontend

### 1. **Store (Pinia) - Dois Padrões Disponíveis**

#### **Opção A: Store Específico (Recomendado para CRUDs complexos)**

```typescript
// app/stores/ProdutoStore.ts
import { defineStore } from 'pinia'
import type { ProdutoDTO, CreateProdutoDTO, UpdateProdutoDTO } from '~/types/api'

export const useProdutoStore = defineStore('produto', {
  state: () => ({
    produtos: [] as ProdutoDTO[],
    loading: false,
    error: null as string | null,
    isEditing: false,
    modalState: false,
    currentProduto: null as ProdutoDTO | null
  }),

  actions: {
    async fetchProdutos(filters?: any) {
      this.loading = true
      this.error = null
      
      try {
        const response = await $fetch('/api/produtos', {
          query: filters,
          credentials: "include"
        })
        this.produtos = response
      } catch (err: any) {
        this.error = err.data?.message || 'Erro ao carregar produtos'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createProduto(produtoData: CreateProdutoDTO) {
      this.loading = true
      this.error = null
      
      try {
        const novoProduto = await $fetch('/api/produtos', {
          method: 'POST',
          body: produtoData,
          credentials: "include"
        })
        this.produtos.push(novoProduto)
        this.resetForm()
        return novoProduto
      } catch (err: any) {
        this.error = err.data?.message || 'Erro ao criar produto'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateProduto(produtoData: UpdateProdutoDTO) {
      this.loading = true
      this.error = null
      
      try {
        const produtoAtualizado = await $fetch('/api/produtos', {
          method: 'PUT',
          body: produtoData,
          credentials: "include"
        })
        
        const index = this.produtos.findIndex(p => p.id === produtoData.id)
        if (index !== -1) {
          this.produtos[index] = produtoAtualizado
        }
        
        this.resetForm()
        return produtoAtualizado
      } catch (err: any) {
        this.error = err.data?.message || 'Erro ao atualizar produto'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteProduto(produto: ProdutoDTO) {
      this.loading = true
      this.error = null
      
      try {
        // ⚠️ FORMATO ESPECÍFICO DO PROJETO: DELETE usa { usuario: item }
        await $fetch('/api/produtos', {
          method: 'DELETE',
          body: { usuario: produto },
          credentials: "include"
        })
        
        const index = this.produtos.findIndex(p => p.id === produto.id)
        if (index !== -1) {
          this.produtos.splice(index, 1)
        }
      } catch (err: any) {
        this.error = err.data?.message || 'Erro ao remover produto'
        throw err
      } finally {
        this.loading = false
      }
    },

    setEditingProduto(produto: ProdutoDTO) {
      this.isEditing = true
      this.currentProduto = { ...produto }
      this.modalState = true
    },

    resetForm() {
      this.modalState = false
      this.isEditing = false
      this.currentProduto = null
    }
  }
})
```

#### **Opção B: Store Genérico (Para CRUDs simples) - RECOMENDADO!**

```typescript
// Para usar o store genérico, basta importar e usar:
import { createGenericDatabaseStore } from '~/stores/GenericDatabaseStore'

// Criar store para qualquer modelo
export const useProdutoStore = createGenericDatabaseStore('Produto')

// O store genérico já inclui todas as operações CRUD:
// - fetchAll()
// - create(item)
// - update(item) 
// - delete(item)
// - openEditModal(item)
// - openCreateModal()
// - closeModal()
```

#### **🔧 Como o GenericDatabaseStore Realmente Funciona**

O `GenericDatabaseStore.ts` é muito mais inteligente do que parece! Ele:

**1. Processamento Automático de Dados:**
```typescript
// Converte automaticamente campos de relação:
// estado.sigla → estadoId
// cooperativa.nome → cooperativaId

// Normaliza telefones:
// "(11) 99999-9999" → "11999999999"

// Remove campos aninhados desnecessários
```

**2. Formato Específico das APIs:**
```typescript
// CREATE/UPDATE - Body direto
POST /api/produtos
{
  "nome": "Café Arábica",
  "preco": 25.50,
  "categoria": "arabica"
}

// DELETE - Body com wrapper (formato específico do projeto!)
DELETE /api/produtos
{
  "usuario": {
    "id": 123,
    "nome": "Café Arábica"
  }
}

// PUT - Sem ID na URL, ID vai no body
PUT /api/produtos
{
  "id": 123,
  "nome": "Café Arábica Atualizado"
}
```

**3. Integração Total com UiGenericDatatable:**
```vue
<!-- Só precisa definir o modelo e colunas! -->
<UiGenericDatatable 
  model="Colaborador" 
  :columns="columns" 
/>

<!-- O componente automaticamente: -->
<!-- ✅ Cria o store genérico -->
<!-- ✅ Gerencia modais de criação/edição -->
<!-- ✅ Faz todas as operações CRUD -->
<!-- ✅ Processa dados automaticamente -->
<!-- ✅ Mostra loading states -->
<!-- ✅ Exibe toasts de sucesso/erro -->
<!-- ✅ Valida campos baseado nas colunas -->
<!-- ✅ Gerencia relacionamentos -->
```

#### **Quando usar cada padrão?**

**Use Store Específico quando:**
- ✅ Precisa de validações complexas
- ✅ Tem lógica de negócio específica
- ✅ Precisa de filtros avançados
- ✅ Tem relacionamentos complexos
- ✅ Precisa de cache ou otimizações

**Use Store Genérico quando:**
- ✅ CRUD simples sem lógica complexa
- ✅ Quer rapidez no desenvolvimento
- ✅ O modelo segue padrões básicos
- ✅ Não precisa de validações especiais
- ✅ Quer reutilizar código

### 2. **Página de Listagem**

#### **Opção A: Com Store Específico**

```vue
<!-- app/pages/app/produtos.vue -->
<template>
  <div>
    <AppPage>
      <UiCard class="mt-10">
        <UiCardHeader>
          <UiCardTitle>Produtos</UiCardTitle>
          <UiCardDescription>
            Gerencie os produtos da sua cooperativa
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <!-- Filtros -->
          <div class="mb-6 flex gap-4">
            <UiInput 
              v-model="filters.categoria" 
              placeholder="Filtrar por categoria"
              @input="handleFilter"
            />
            <UiSelect v-model="filters.ativo" @change="handleFilter">
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </UiSelect>
            <UiButton @click="produtoStore.resetForm(); produtoStore.modalState = true">
              <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
              Novo Produto
            </UiButton>
          </div>

          <!-- Tabela -->
          <UiGenericDatatable 
            model="Produto" 
            :columns="columns"
            :data="produtoStore.produtos"
            :loading="produtoStore.loading"
            @edit="produtoStore.setEditingProduto"
            @delete="handleDelete"
          />
        </UiCardContent>
      </UiCard>

      <!-- Modal de Criação/Edição -->
      <ProdutoModal 
        v-model:open="produtoStore.modalState"
        :produto="produtoStore.currentProduto"
        :is-editing="produtoStore.isEditing"
        @save="handleSave"
      />
    </AppPage>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
})

const produtoStore = useProdutoStore()
const filters = ref({
  categoria: '',
  ativo: ''
})

const columns = [
  { label: "ID", field: "id", type: "text" },
  { label: "Nome", field: "nome", type: "text" },
  { label: "Categoria", field: "categoria", type: "text" },
  { label: "Preço", field: "preco", type: "currency" },
  { label: "Status", field: "ativo", type: "boolean" },
  { label: "Ações", field: "actions", type: "actions" }
]

// Carregar dados iniciais
onMounted(() => {
  produtoStore.fetchProdutos()
})

// Handlers
const handleFilter = () => {
  produtoStore.fetchProdutos(filters.value)
}

const handleDelete = async (produto: any) => {
  if (confirm(`Tem certeza que deseja remover o produto "${produto.nome}"?`)) {
    try {
      await produtoStore.deleteProduto(produto)
      useSonner.success('Produto removido com sucesso!')
    } catch (error) {
      useSonner.error('Erro ao remover produto')
    }
  }
}

const handleSave = async (produtoData: any) => {
  try {
    if (produtoStore.isEditing) {
      await produtoStore.updateProduto({ ...produtoData, id: produtoStore.currentProduto?.id })
      useSonner.success('Produto atualizado com sucesso!')
    } else {
      await produtoStore.createProduto(produtoData)
      useSonner.success('Produto criado com sucesso!')
    }
  } catch (error) {
    useSonner.error('Erro ao salvar produto')
  }
}
</script>
```

#### **Opção B: Com Store Genérico (Mais Simples) - RECOMENDADO!**

```vue
<!-- app/pages/app/produtos.vue -->
<template>
  <div>
    <AppPage>
      <UiCard class="mt-10">
        <UiCardContent>
          <!-- O UiGenericDatatable já gerencia tudo automaticamente -->
          <UiGenericDatatable 
            model="Produto" 
            :columns="columns" 
          />
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
})

// Definir as colunas da tabela
const columns = [
  { label: "ID", field: "id", type: "text" },
  { label: "Nome", field: "nome", type: "text" },
  { label: "Categoria", field: "categoria", type: "text" },
  { label: "Preço", field: "preco", type: "currency" },
  { label: "Status", field: "ativo", type: "boolean" }
]

// O UiGenericDatatable automaticamente:
// - Cria o store genérico
// - Gerencia CRUD completo
// - Abre modais de criação/edição
// - Faz validações básicas
// - Mostra loading states
// - Processa dados automaticamente (telefones, relações, etc.)
</script>
```

### 3. **Modal de Formulário**

```vue
<!-- app/components/ProdutoModal.vue -->
<template>
  <UiSheet v-model:open="open">
    <UiSheetContent>
      <UiSheetHeader>
        <UiSheetTitle>
          {{ produto ? 'Editar Produto' : 'Novo Produto' }}
        </UiSheetTitle>
        <UiSheetDescription>
          {{ produto ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto' }}
        </UiSheetDescription>
      </UiSheetHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 mt-6">
        <UiFormField>
          <UiLabel>Nome *</UiLabel>
          <UiInput 
            v-model="form.nome" 
            placeholder="Nome do produto"
            required
          />
        </UiFormField>

        <UiFormField>
          <UiLabel>Descrição</UiLabel>
          <UiTextarea 
            v-model="form.descricao" 
            placeholder="Descrição do produto"
          />
        </UiFormField>

        <UiFormField>
          <UiLabel>Preço *</UiLabel>
          <UiInput 
            v-model="form.preco" 
            type="number"
            step="0.01"
            placeholder="0.00"
            required
          />
        </UiFormField>

        <UiFormField>
          <UiLabel>Categoria *</UiLabel>
          <UiSelect v-model="form.categoria" required>
            <option value="">Selecione uma categoria</option>
            <option value="arabica">Arábica</option>
            <option value="robusta">Robusta</option>
            <option value="especial">Especial</option>
          </UiSelect>
        </UiFormField>

        <div v-if="produto" class="flex items-center space-x-2">
          <UiCheckbox v-model="form.ativo" />
          <UiLabel>Produto ativo</UiLabel>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <UiButton type="button" variant="outline" @click="open = false">
            Cancelar
          </UiButton>
          <UiButton type="submit" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </UiButton>
        </div>
      </form>
    </UiSheetContent>
  </UiSheet>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
  produto?: any
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'save', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const form = ref({
  nome: '',
  descricao: '',
  preco: 0,
  categoria: '',
  ativo: true
})

// Watch para preencher formulário quando editando
watch(() => props.produto, (produto) => {
  if (produto) {
    form.value = {
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco,
      categoria: produto.categoria,
      ativo: produto.ativo
    }
  } else {
    // Reset form para novo produto
    form.value = {
      nome: '',
      descricao: '',
      preco: 0,
      categoria: '',
      ativo: true
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  
  try {
    const produtoData = {
      ...form.value,
      preco: parseFloat(form.value.preco.toString())
    }
    
    emit('save', produtoData)
  } catch (error) {
    console.error('Erro no formulário:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

## 🧪 Testes

### **Teste de Repository**

```typescript
// tests/unit/repositories/ProdutoRepository.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ProdutoRepository } from '~/server/repositories/ProdutoRepository'

describe('ProdutoRepository', () => {
  let repository: ProdutoRepository

  beforeEach(() => {
    repository = new ProdutoRepository()
  })

  it('deve criar um produto', async () => {
    const produtoData = {
      nome: 'Café Arábica Premium',
      descricao: 'Café de alta qualidade',
      preco: 25.50,
      categoria: 'arabica',
      cooperativaId: 1
    }

    const produto = await repository.create(produtoData)
    
    expect(produto).toBeDefined()
    expect(produto.nome).toBe(produtoData.nome)
    expect(produto.preco).toBe(produtoData.preco)
  })

  it('deve listar produtos por categoria', async () => {
    const produtos = await repository.findAll({ categoria: 'arabica' })
    
    expect(Array.isArray(produtos)).toBe(true)
    produtos.forEach(produto => {
      expect(produto.categoria).toBe('arabica')
    })
  })
})
```

### **Teste de API**

```typescript
// tests/unit/api/produtos.test.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('API Produtos', () => {
  await setup({
    // Configuração do teste
  })

  it('deve listar produtos', async () => {
    const response = await $fetch('/api/produtos')
    
    expect(Array.isArray(response)).toBe(true)
  })

  it('deve criar um produto', async () => {
    const produtoData = {
      nome: 'Teste',
      preco: 10.00,
      categoria: 'teste',
      cooperativaId: 1
    }

    const produto = await $fetch('/api/produtos', {
      method: 'POST',
      body: produtoData
    })

    expect(produto.nome).toBe(produtoData.nome)
  })
})
```

## 💡 Dicas e Boas Práticas

### **1. Validação de Dados**
```typescript
// Sempre valide os dados de entrada
const validateProduto = (data: any) => {
  if (!data.nome || data.nome.trim().length < 2) {
    throw new Error('Nome deve ter pelo menos 2 caracteres')
  }
  if (!data.preco || data.preco <= 0) {
    throw new Error('Preço deve ser maior que zero')
  }
  if (!data.categoria) {
    throw new Error('Categoria é obrigatória')
  }
}
```

### **2. Tratamento de Erros**
```typescript
// Use try/catch em todas as operações
try {
  const result = await repository.create(data)
  return result
} catch (error) {
  console.error('Erro ao criar produto:', error)
  throw createError({
    statusCode: 500,
    statusMessage: 'Erro interno do servidor'
  })
}
```

### **3. Paginação**
```typescript
// Implemente paginação para listas grandes
async findAll(filters: ProdutoFilterDTO) {
  const { page = 1, limit = 10, ...whereFilters } = filters
  
  return prisma.produto.findMany({
    where: whereFilters,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  })
}
```

### **4. Soft Delete**
```typescript
// Para dados importantes, use soft delete
model Produto {
  // ... outros campos
  deletedAt DateTime?
}

// No repository
async delete(id: number) {
  return prisma.produto.update({
    where: { id },
    data: { deletedAt: new Date() }
  })
}
```

### **5. Logs e Auditoria**
```typescript
// Adicione logs para operações importantes
async create(data: CreateProdutoDTO) {
  console.log(`Criando produto: ${data.nome}`)
  
  const produto = await prisma.produto.create({ data })
  
  console.log(`Produto criado com ID: ${produto.id}`)
  return produto
}
```

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                    # Iniciar servidor de desenvolvimento
npm run db                     # Setup completo do banco

# Banco de dados
npm run db:migrate            # Executar migrações
npm run db:seed               # Popular com dados iniciais
npm run db:studio             # Interface visual do Prisma

# Testes
npm run test:unit             # Testes unitários
npm run test:e2e              # Testes end-to-end

# Build
npm run build                 # Build para produção
npm run preview               # Preview da build
```

## 🎯 **Recomendação Principal**

### **Para 90% dos casos: Use o Store Genérico!**

```vue
<!-- Simples assim! -->
<template>
  <UiGenericDatatable 
    model="Colaborador" 
    :columns="columns" 
  />
</template>

<script setup>
const columns = [
  { label: "Nome", field: "name", type: "text" },
  { label: "Celular", field: "celular", type: "phone" },
  { label: "Cargo", field: "cargo", type: "text" }
]
</script>
```

**Por quê?**
- ✅ **Zero configuração** - funciona automaticamente
- ✅ **Processamento inteligente** - telefones, relações, validações
- ✅ **Formatos corretos** - DELETE com `{ usuario: item }`, PUT sem ID na URL
- ✅ **UI completa** - modais, loading, toasts, validações
- ✅ **Manutenção zero** - atualizações automáticas

### **Use Store Específico apenas quando:**
- 🔧 Lógica de negócio complexa
- 🔧 Validações customizadas
- 🔧 Filtros avançados
- 🔧 Cache ou otimizações específicas

## 📚 Próximos Passos

1. **Comece com o Store Genérico** - é mais rápido e eficiente
2. **Implemente a API** seguindo os formatos específicos do projeto
3. **Adicione validações** se necessário
4. **Escreva testes** para todas as operações
5. **Migre para Store Específico** apenas se precisar de lógica complexa

---

**🎉 Parabéns!** Agora você tem um guia completo e **correto** para implementar CRUDs no SigeCafé seguindo os padrões reais do projeto!