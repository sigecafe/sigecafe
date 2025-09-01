import { PrismaClient, OfferSide, OfferStatus } from '@prisma/client';
import prisma from '@@/lib/prisma';
import type { OfferDTO, CreateOfferDTO } from '~/types/api';

export class OfertaRepository {
  /**
   * Get all buy offers (bids)
   */
  async getBids(): Promise<OfferDTO[]> {
    const bids = await prisma.oferta.findMany({
      where: {
        side: 'BUY',
        status: 'OPEN'
      },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        price: 'desc'
      }
    });

    return bids.map(bid => ({
      id: bid.id,
      userId: bid.usuarioId,
      user: bid.usuario.name,
      side: bid.side,
      price: bid.price,
      quantity: bid.quantity,
      status: bid.status,
      createdAt: bid.createdAt,
      usuario: {
        id: bid.usuario.id,
        name: bid.usuario.name,
        type: bid.usuario.type
      }
    }));
  }

  /**
   * Get all sell offers (asks)
   */
  async getAsks(): Promise<OfferDTO[]> {
    const asks = await prisma.oferta.findMany({
      where: {
        side: 'SELL',
        status: 'OPEN'
      },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        price: 'desc'
      }
    });

    return asks.map(ask => ({
      id: ask.id,
      userId: ask.usuarioId,
      user: ask.usuario.name,
      side: ask.side,
      price: ask.price,
      quantity: ask.quantity,
      status: ask.status,
      createdAt: ask.createdAt,
      usuario: {
        id: ask.usuario.id,
        name: ask.usuario.name,
        type: ask.usuario.type
      }
    }));
  }

  /**
   * Create a new offer
   */
  async createOffer(userId: number, data: CreateOfferDTO): Promise<OfferDTO> {
    const { side, price, quantity } = data;

    // Create the offer
    const offer = await prisma.oferta.create({
      data: {
        usuario: {
          connect: { id: userId }
        },
        side,
        price,
        quantity: Math.floor(quantity),
        status: 'OPEN'
      },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    return {
      id: offer.id,
      userId: offer.usuarioId,
      user: offer.usuario.name,
      side: offer.side,
      price: offer.price,
      quantity: offer.quantity,
      status: offer.status,
      createdAt: offer.createdAt,
      usuario: {
        id: offer.usuario.id,
        name: offer.usuario.name,
        type: offer.usuario.type
      }
    };
  }

  /**
   * Get offer by ID
   */
  async getOfferById(offerId: number): Promise<OfferDTO | null> {
    const offer = await prisma.oferta.findUnique({
      where: { id: offerId },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    if (!offer) return null;

    return {
      id: offer.id,
      userId: offer.usuarioId,
      user: offer.usuario.name,
      side: offer.side,
      price: offer.price,
      quantity: offer.quantity,
      status: offer.status,
      createdAt: offer.createdAt,
      usuario: {
        id: offer.usuario.id,
        name: offer.usuario.name,
        type: offer.usuario.type
      }
    };
  }

  /**
   * Cancel an offer
   */
  async cancelOffer(offerId: number): Promise<OfferDTO> {
    const updatedOffer = await prisma.oferta.update({
      where: { id: offerId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    return {
      id: updatedOffer.id,
      userId: updatedOffer.usuarioId,
      user: updatedOffer.usuario.name,
      side: updatedOffer.side,
      price: updatedOffer.price,
      quantity: updatedOffer.quantity,
      status: updatedOffer.status,
      createdAt: updatedOffer.createdAt,
      usuario: {
        id: updatedOffer.usuario.id,
        name: updatedOffer.usuario.name,
        type: updatedOffer.usuario.type
      }
    };
  }

  /**
   * Get offers by user ID
   */
  async getOffersByUserId(userId: number): Promise<OfferDTO[]> {
    const offers = await prisma.oferta.findMany({
      where: {
        usuarioId: userId,
        status: 'OPEN'
      },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return offers.map(offer => ({
      id: offer.id,
      userId: offer.usuarioId,
      user: offer.usuario.name,
      side: offer.side,
      price: offer.price,
      quantity: offer.quantity,
      status: offer.status,
      createdAt: offer.createdAt,
      usuario: {
        id: offer.usuario.id,
        name: offer.usuario.name,
        type: offer.usuario.type
      }
    }));
  }
}