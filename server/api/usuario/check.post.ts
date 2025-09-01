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
    const body = await readBody(event)
    const { celular } = body

    if (!celular) {
      return {
        success: false,
        message: 'Número de celular é obrigatório',
        status: 400
      }
    }

    // Use repository to check if user exists
    const usuarioRepository = new UsuarioRepository()
    const usuario = await usuarioRepository.getUsuarioByCelular(celular)

    return {
      success: true,
      exists: !!usuario,
      id: usuario?.id
    }
  } catch (error) {
    console.error('Erro ao verificar existência do usuário:', error)
    return {
      success: false,
      message: 'Erro ao verificar usuário',
      status: 500
    }
  }
})