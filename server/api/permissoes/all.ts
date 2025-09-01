import { getServerSession } from '#auth'
import type { Usuario } from '@prisma/client'
import { UsuarioType } from '@prisma/client'
import { PermissionRepository } from '@@/server/repositories/PermissionRepository'

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

  const permissionRepository = new PermissionRepository()

  try {
    switch (method) {
      case 'GET':
        // Obter todas as permissões
        return await permissionRepository.findAll()

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