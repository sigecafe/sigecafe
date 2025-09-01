import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'
import type { Usuario, UsuarioType } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
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

  // Obter o ID do usuário a ser modificado
  const userId = parseInt(getRouterParam(event, 'id') || '0')
  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'ID de usuário inválido'
    })
  }

  try {
    switch (event.method) {
      case 'GET':
        // Obter detalhes do usuário
        return await getUserDetails(userId)

      case 'PUT':
        // Atualizar o papel/função do usuário
        const updateData = await readBody(event)
        return await updateUserRole(userId, updateData)

      default:
        throw createError({
          statusCode: 405,
          message: 'Método não permitido'
        })
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao processar requisição',
      cause: error
    })
  }
})

async function getUserDetails(userId: number) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      celular: true,
      type: true,
      cooperativaId: true,
      cooperativa: { select: { id: true, nome: true } }
      // associado and colaborador removed
    }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'Usuário não encontrado'
    })
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    celular: user.celular,
    type: user.type,
    roleLabel: formatRoleLabel(user.type),
    cooperativa: user.cooperativa?.nome,
    cooperativaId: user.cooperativaId
    // associado and colaborador fields removed
  }
}

interface UpdateRoleDTO {
  type: UsuarioType;
  cooperativaId?: number | null;
  // associadoId and colaboradorId removed
}

async function updateUserRole(userId: number, data: UpdateRoleDTO) {
  // Verificar se o usuário existe
  const existingUser = await prisma.usuario.findUnique({
    where: { id: userId }
  })

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      message: 'Usuário não encontrado'
    })
  }

  // Validar a mudança de papel/função
  const newType = data.type

  // Validar os relacionamentos de acordo com o novo tipo
  if (newType === UsuarioType.COOPERATIVA && !data.cooperativaId) {
    throw createError({
      statusCode: 400,
      message: 'É necessário fornecer uma cooperativa para usuários do tipo COOPERATIVA'
    })
  }

  // Removal of associado/comprador role validation

  // Atualizar o usuário com o novo papel/função
  const updatedUser = await prisma.usuario.update({
    where: { id: userId },
    data: {
      type: data.type,
      cooperativaId: data.cooperativaId
      // associadoId and colaboradorId removed
    },
    select: {
      id: true,
      name: true,
      email: true,
      celular: true,
      type: true,
      cooperativaId: true,
      cooperativa: {
        select: {
          nome: true
        }
      },
      // associado and colaborador selects removed
    }
  })

  return {
    success: true,
    message: 'Papel/função do usuário atualizado com sucesso',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      celular: updatedUser.celular,
      type: updatedUser.type,
      roleLabel: formatRoleLabel(updatedUser.type),
      cooperativa: updatedUser.cooperativa?.nome,
      cooperativaId: updatedUser.cooperativaId
      // associado and colaborador removed from response
    }
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