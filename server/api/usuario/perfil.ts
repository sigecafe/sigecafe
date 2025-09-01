import { getServerSession } from '#auth'
import prisma from '~~/lib/prisma'
import type { AuthResponseDTO, UsuarioPreferencesDTO } from '~/types/api'

export default defineEventHandler(async (event): Promise<AuthResponseDTO> => {
  // Get authenticated session
  const session = await getServerSession(event)
  if (!session?.user) {
    return {
      success: false,
      message: 'Não autorizado',
      status: 403
    }
  }

  // Get the user ID from the session
  const userEmail = session.user.email
  if (!userEmail) {
    return {
      success: false,
      message: 'Usuário não identificado',
      status: 403
    }
  }

  // Find the user in the database to get the ID
  const dbUser = await prisma.usuario.findFirst({
    where: { email: userEmail }
  })

  if (!dbUser) {
    return {
      success: false,
      message: 'Usuário não encontrado',
      status: 404
    }
  }

  const userId = dbUser.id;

  // GET request to fetch user profile and preferences
  if (event.method === 'GET') {
    try {
      // Fetch user profile including preferences
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          celular: true,
          type: true,
          theme: true,
          fontSize: true,
          cooperativaId: true,
          estadoId: true,
          cidade: true,
          endereco: true
        }
      })

      if (!usuario) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        }
      }

      const usuarioDTO: UsuarioPreferencesDTO = {
        name: usuario.name,
        email: usuario.email || '',
        celular: usuario.celular,
        type: usuario.type,
        theme: usuario.theme,
        fontSize: usuario.fontSize,
        cooperativaId: usuario.cooperativaId,
        estadoId: usuario.estadoId,
        cidade: usuario.cidade,
        endereco: usuario.endereco
      }

      return {
        success: true,
        data: usuarioDTO
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return {
        success: false,
        message: 'Erro ao buscar dados do perfil'
      }
    }
  }

  // PUT request to update user profile and preferences
  if (event.method === 'PUT') {
    try {
      const body = await readBody(event) as UsuarioPreferencesDTO
      const { name, email, celular, theme, fontSize, cidade, endereco } = body

      // Build update data
      const updateData: any = {}
      if (name) updateData.name = name
      if (email !== undefined) updateData.email = email
      if (celular) updateData.celular = celular
      if (cidade) updateData.cidade = cidade
      if (endereco) updateData.endereco = endereco
      // Validate and include preferences
      if (theme && ['light', 'dark', 'system'].includes(theme)) {
        updateData.theme = theme
      }
      if (fontSize && ['small', 'medium', 'large', 'xlarge'].includes(fontSize)) {
        updateData.fontSize = fontSize
      }

      // Check if celular already exists for another user
      if (celular && celular !== dbUser.celular) {
        const existingUser = await prisma.usuario.findFirst({
          where: {
            celular,
            NOT: {
              id: userId
            }
          }
        })

        if (existingUser) {
          return {
            success: false,
            message: 'Este número de celular já está em uso'
          }
        }
      }

      const updatedUser = await prisma.usuario.update({
        where: { id: userId },
        data: updateData,
        select: {
          name: true,
          email: true,
          celular: true,
          type: true,
          theme: true,
          fontSize: true,
          cooperativaId: true,
          estadoId: true,
          cidade: true,
          endereco: true
        }
      })

      const updatedDTO: UsuarioPreferencesDTO = {
        name: updatedUser.name,
        email: updatedUser.email || '',
        celular: updatedUser.celular,
        type: updatedUser.type,
        theme: updatedUser.theme,
        fontSize: updatedUser.fontSize,
        cooperativaId: updatedUser.cooperativaId,
        estadoId: updatedUser.estadoId,
        cidade: updatedUser.cidade,
        endereco: updatedUser.endereco
      }

      return {
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: updatedDTO
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return {
        success: false,
        message: 'Erro ao atualizar perfil'
      }
    }
  }

  // DELETE request to delete user profile
  if (event.method === 'DELETE') {
    try {
      // Delete associated records first to avoid FK constraint violations
      // 2. Delete other related records
      await prisma.notificacao.deleteMany({
        where: { usuarioId: userId }
      });

      // No password reset tokens to delete (model removed)

      await prisma.oferta.deleteMany({
        where: { usuarioId: userId }
      });

      // 3. Check for transactions and delete if exist
      const transacoes = await prisma.transacao.findMany({
        where: {
          OR: [
            { compradorId: userId },
            { produtorId: userId }
          ]
        }
      });

      if (transacoes.length > 0) {
        await prisma.transacao.deleteMany({
          where: {
            OR: [
              { compradorId: userId },
              { produtorId: userId }
            ]
          }
        });
      }

      // 4. Finally delete the user
      await prisma.usuario.delete({
        where: { id: userId }
      });

      return {
        success: true,
        message: 'Perfil excluído com sucesso'
      }
    } catch (error) {
      console.error('Erro ao excluir perfil:', error)
      return {
        success: false,
        message: 'Erro ao excluir perfil'
      }
    }
  }

  return {
    success: false,
    message: 'Método não suportado'
  }
})
