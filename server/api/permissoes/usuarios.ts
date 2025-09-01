import { getServerSession } from '#auth'
import { getQuery } from 'h3'
import { PrismaClient, UsuarioType } from '@prisma/client'
import type { Usuario } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.method

  // Verificar autenticação
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  // Verificar se o usuário é ADMINISTRADOR
  if ((session.user as Usuario).type !== UsuarioType.ADMINISTRADOR) {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado'
    })
  }

  try {
    switch (method) {
      case 'GET':
        // Obter parâmetros de consulta (para paginação e filtragem)
        const query = getQuery(event)
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const search = query.search as string || ''
        const typeFilter = query.type as UsuarioType | undefined

        return await getUsuariosWithRoles(page, limit, search, typeFilter)

      default:
        throw createError({
          statusCode: 405,
          message: 'Método não permitido'
        })
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao processar requisição',
      cause: error
    })
  }
})

async function getUsuariosWithRoles(page: number, limit: number, search: string, typeFilter?: UsuarioType) {
  try {
    const skip = (page - 1) * limit

    // Construir condição where
    const where: any = {}

    // Adicionar filtro por tipo se fornecido
    if (typeFilter) {
      where.type = typeFilter
    }

    // Adicionar filtro de busca se fornecido
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { celular: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar usuários com paginação
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          celular: true,
          type: true,
          cooperativaId: true,
          cooperativa: { select: { nome: true } },
          createdAt: true,
          updatedAt: true
          // associado and colaborador removed
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.usuario.count({ where })
    ])

    // Formatar os resultados
    const formattedUsers = usuarios.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      celular: user.celular,
      role: user.type,
      roleLabel: formatRoleLabel(user.type),
      cooperativa: user.cooperativa?.nome,
      cooperativaId: user.cooperativaId,
      // associado and colaborador removed
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    return {
      data: formattedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Função para formatar o label do role para exibição
function formatRoleLabel(role: UsuarioType): string {
  const labels: Record<string, string> = {
    'ADMINISTRADOR': 'Administrador',
    'COOPERATIVA': 'Cooperativa',
    'PRODUTOR': 'Produtor',
    'COMPRADOR': 'Comprador',
    'AUTENTICADO': 'Usuário Autenticado'
  }

  return labels[role] || role.toString()
}