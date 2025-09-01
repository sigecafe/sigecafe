import { getServerSession } from '#auth'
import { UsuarioRepository } from '../../repositories/UsuarioRepository'

export default defineEventHandler(async (event) => {
  // Get authentication session to verify authorization
  const session = await getServerSession(event)
  if (!session?.user) {
    return {
      success: false,
      message: 'Não autorizado',
      status: 403
    }
  }

  try {
    // Get the ID from the URL parameter
    const id = parseInt(event.context.params?.id || '0', 10)

    if (!id || isNaN(id)) {
      return {
        success: false,
        message: 'ID de usuário inválido',
        status: 400
      }
    }

    // Use repository to find and delete user
    const usuarioRepository = new UsuarioRepository()
    const usuario = await usuarioRepository.getUsuarioById(id)

    if (!usuario) {
      return {
        success: false,
        message: 'Usuário não encontrado',
        status: 404
      }
    }

    // Delete the user
    await usuarioRepository.deleteUsuarioById(id)

    return {
      success: true,
      message: 'Usuário excluído com sucesso'
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return {
      success: false,
      message: 'Erro ao excluir usuário',
      status: 500
    }
  }
})