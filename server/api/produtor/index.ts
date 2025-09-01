import { defineEventHandler, createError } from 'h3'
import { getServerSession } from '#auth'
import prisma from '@@/lib/prisma'
import type { UsuarioDTO } from '~/types/api'

export default defineEventHandler(async (event) => {
  // Authenticate user
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Cast session.user to UsuarioDTO for type safety
  const user = session.user as unknown as UsuarioDTO

  if (!user.id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID not found in session' })
  }

  if (event.method === 'GET') {
    try {
      // Get all users with PRODUTOR type
      const produtores = await prisma.usuario.findMany({
        where: {
          type: 'PRODUTOR'
        },
        select: {
          id: true,
          name: true
        }
      })

      return {
        success: true,
        data: produtores
      }
    } catch (error: any) {
      console.error('Error fetching produtores:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch produtores: ${error.message || 'Unknown error'}`
      })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})