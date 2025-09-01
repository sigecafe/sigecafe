import { getServerSession } from '#auth'
import type { Usuario } from '@prisma/client'
import { UsuarioType } from '@prisma/client'
import { PermissionRepository } from '@@/server/repositories/PermissionRepository'

export default defineEventHandler(async (event) => {
  const method = event.method

  const session = await getServerSession(event)
  if (!session?.user) return []
  const user = session.user as any
  if (!user.cooperativaId) return []

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
        return await permissionRepository.findByMenuType("PERFIL")

      case 'POST':
        const createBody = await readBody(event)
        return await permissionRepository.create(createBody)

      case 'PUT':
        const updateBody = await readBody(event)
        return await permissionRepository.update(updateBody.id, updateBody)

      case 'DELETE':
        const deleteBody = await readBody(event)
        return await permissionRepository.delete(deleteBody.id)

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