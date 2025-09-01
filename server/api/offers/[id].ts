import { defineEventHandler, createError } from 'h3'
import { getServerSession } from '#auth'
import prisma from '@@/lib/prisma'
import type { OfferDTO, UsuarioDTO } from '~/types/api'

export default defineEventHandler(async (event) => {
  // Authenticate user
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  console.log('Session user:', session.user)

  // Cast session.user to UsuarioDTO for type safety
  const user = session.user as unknown as UsuarioDTO

  if (!user.id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID not found in session' })
  }

  const userId = user.id
  const userType = user.type

  // Parse and validate the offer ID
  const offerId = parseInt(event.context.params?.id ?? '0', 10)
  if (isNaN(offerId) || offerId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid offer ID' })
  }

  if (event.method === 'DELETE') {
    console.log(`Processing cancellation request for offer ${offerId} by user ${userId}`)

    try {
      // Check if offer exists and belongs to user
      const offer = await prisma.oferta.findFirst({
        where: {
          id: offerId,
          status: 'OPEN'
        }
      })

      console.log('Found offer:', offer)

      if (!offer) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Offer not found or already cancelled/completed'
        })
      }

      // Check if user is admin/staff or offer belongs to user
      const isAdminOrStaff = userType === 'ADMINISTRADOR' || userType === 'COOPERATIVA' || userType === 'COLABORADOR'

      if (!isAdminOrStaff && offer.usuarioId !== userId) {
        console.log(`Unauthorized: Offer belongs to user ${offer.usuarioId}, not ${userId}`)
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only cancel your own offers'
        })
      }

      // Cancel the offer
      console.log(`Cancelling offer ${offerId}`)
      const updateResult = await prisma.oferta.update({
        where: { id: offerId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      })

      console.log('Update result:', updateResult)

      return { success: true, message: 'Offer cancelled successfully' }
    } catch (error: any) {
      console.error('Error cancelling offer:', error)

      if (error.statusCode) {
        throw error // Re-throw h3 errors
      }

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to cancel offer: ${error.message || 'Unknown error'}`
      })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})