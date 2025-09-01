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

  // Only allow DELETE method
  if (event.method !== 'DELETE') {
    return {
      success: false,
      message: 'Método não permitido',
      status: 405
    }
  }

  try {
    const body = await readBody(event)
    const { celular } = body

    if (!celular) {
      return {
        success: false,
        message: 'Número de celular é obrigatório',
        status: 400
      }
    }

    // Use repository to find and delete user
    const usuarioRepository = new UsuarioRepository()
    const usuario = await usuarioRepository.getUsuarioByCelular(celular)

    if (!usuario) {
      return {
        success: false,
        message: 'Usuário não encontrado',
        status: 404
      }
    }

    // Delete the user
    await usuarioRepository.deleteUsuarioById(usuario.id)

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