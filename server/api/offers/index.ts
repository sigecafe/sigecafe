import { defineEventHandler, readBody, createError, getQuery } from 'h3'
import { getServerSession } from '#auth'
import { OfertaRepository } from '~~/server/repositories/OfertaRepository'
import type { OfferDTO, CreateOfferDTO, OfferBookDTO, UsuarioDTO } from '~/types/api'
import prisma from '@@/lib/prisma';

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

  // Initialize repository
  const ofertaRepository = new OfertaRepository()

  if (event.method === 'GET') {
    try {
      const query = getQuery(event)
      const type = query.type as string

      // If specific type is requested (bids or asks), return just that type
      if (type === 'bids') {
        const bids = await ofertaRepository.getBids()
        return { success: true, data: bids }
      } else if (type === 'asks') {
        const asks = await ofertaRepository.getAsks()
        return { success: true, data: asks }
      }

      // Default: return both in the book format
      const [bids, asks] = await Promise.all([
        ofertaRepository.getBids(),
        ofertaRepository.getAsks()
      ])

      const book: OfferBookDTO = { bids, asks }
      return { success: true, data: book }
    } catch (error: any) {
      console.error('Error fetching offers:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch offers: ${error.message || 'Unknown error'}`
      })
    }
  }

  if (event.method === 'POST') {
    try {
      const body = await readBody(event)

      console.log('Received offer creation request:', { userId, ...body })

      // Extract data from body, handling potential missing fields
      let { side, price, quantity, usuarioId } = body

      // If usuarioId is provided AND user is admin/staff, we need to handle it differently
      // This is likely a case where an admin is creating an offer on behalf of another user
      let targetUserId = userId;
      let targetUserType = user.type;

      const isAdminOrStaff = user.type === 'ADMINISTRADOR' || user.type === 'COOPERATIVA' || user.type === 'COLABORADOR';

      if (isAdminOrStaff && usuarioId && usuarioId !== userId) {
        // Admin is creating an offer for another user, look up that user's type
        const targetUser = await prisma.usuario.findUnique({
          where: { id: usuarioId }
        });

        if (!targetUser) {
          throw createError({ statusCode: 400, statusMessage: 'Target user not found' });
        }

        targetUserId = targetUser.id;
        targetUserType = targetUser.type;

        // For admin creating offers for others, if side is not specified, determine it based on target user type
        if (!side) {
          if (targetUser.type === 'PRODUTOR') {
            side = 'SELL';
          } else if (targetUser.type === 'COMPRADOR') {
            side = 'BUY';
          } else {
            throw createError({
              statusCode: 400,
              statusMessage: 'Cannot determine appropriate side for this user type'
            });
          }
        }
      }

      // Validate price and quantity
      if (price == null || quantity == null) {
        throw createError({ statusCode: 400, statusMessage: 'Missing price or quantity parameters' })
      }

      if (price <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Price must be greater than 0' })
      }

      if (quantity <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Quantity must be greater than 0' })
      }

      // If side is not provided (and not already determined above for admin+usuarioId case)
      if (!side) {
        if (targetUserType === 'PRODUTOR') {
          side = 'SELL';
        } else if (targetUserType === 'COMPRADOR') {
          side = 'BUY';
        } else if (isAdminOrStaff) {
          // For admin and staff users creating offers for themselves, we require the side parameter
          throw createError({
            statusCode: 400,
            statusMessage: 'Admin and staff users must specify the side (BUY or SELL) parameter when creating offers for themselves'
          });
        } else {
          // For any other user type
          throw createError({
            statusCode: 400,
            statusMessage: 'Unknown user type or missing side parameter'
          });
        }
      }

      // Enforce role-based side: PRODUTOR only SELL, COMPRADOR only BUY
      // Skip this check for admin/staff users when they're creating offers for other users
      if (!isAdminOrStaff || targetUserId === userId) {
        if (targetUserType === 'PRODUTOR' && side !== 'SELL') {
          throw createError({ statusCode: 403, statusMessage: 'Produtor users can only place sell offers' })
        }
        if (targetUserType === 'COMPRADOR' && side !== 'BUY') {
          throw createError({ statusCode: 403, statusMessage: 'Comprador users can only place buy offers' })
        }
      }

      // Create the offer
      const newOffer = await ofertaRepository.createOffer(targetUserId, { side, price, quantity })

      return {
        success: true,
        data: newOffer
      }
    } catch (error: any) {
      console.error('Error creating offer:', error)

      // Return more detailed error information
      const errorMessage = error.message || 'Unknown error occurred'
      const errorDetails = {
        name: error.name,
        code: error.code,
        stack: error.stack,
        details: error.details || 'No additional details'
      }

      console.error('Error details:', errorDetails)

      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || `Failed to create offer: ${errorMessage}`
      })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})