import { PrismaClient, TransacaoStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import type { TransacaoDTO, TransacaoFilterDTO, CreateTransacaoDTO, UpdateTransacaoDTO } from '~/types/api';
import { Prisma } from '@prisma/client';

interface TransacaoFilterParams {
  page?: number;
  limit?: number;
  compradorId?: number;
  produtorId?: number;
  status?: TransacaoStatus;
  dataInicio?: Date;
  dataFim?: Date;
}

interface TransacaoPagedResponse {
  data: TransacaoDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class TransacaoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create a new transaction
   */
  async create(data: CreateTransacaoDTO): Promise<TransacaoDTO> {
    const transaction = await this.prisma.transacao.create({
      data: {
        quantidade: data.quantidade,
        precoUnitario: data.precoUnitario,
        data: data.data,
        status: data.status,
        observacoes: data.observacoes,
        comprador: { connect: { id: data.compradorId } },
        produtor: { connect: { id: data.produtorId } },
      },
      include: {
        comprador: {
          select: { id: true, name: true },
        },
        produtor: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      ...transaction,
      id: transaction.id, // IDs are now numbers in the schema and DTO
      comprador: transaction.comprador.name,
      produtor: transaction.produtor.name,
    };
  }

  /**
   * Get transaction by ID
   */
  async getById(id: number): Promise<TransacaoDTO | null> {
    const transacao = await this.prisma.transacao.findUnique({
      where: { id },
      include: {
        comprador: { select: { name: true } },
        produtor: { select: { name: true } },
      }
    });

    if (!transacao) return null;

    return {
      ...transacao,
      id: transacao.id,
      comprador: transacao.comprador.name,
      produtor: transacao.produtor.name
    };
  }

  /**
   * Get all transactions with filtering
   */
  async getAll(params: TransacaoFilterParams = {}): Promise<TransacaoPagedResponse> {
    const {
      page = 1,
      limit = 10,
      compradorId,
      produtorId,
      status,
      dataInicio,
      dataFim
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TransacaoWhereInput = {};

    if (compradorId) {
      where.compradorId = compradorId;
    }

    if (produtorId) {
      where.produtorId = produtorId;
    }

    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) {
        where.data.gte = dataInicio;
      }
      if (dataFim) {
        where.data.lte = dataFim;
      }
    }

    const [transacoesRaw, total] = await Promise.all([
      this.prisma.transacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: {
          comprador: {
            select: { name: true }
          },
          produtor: {
            select: { name: true }
          }
        }
      }),
      this.prisma.transacao.count({ where })
    ]);

    // Transform data to match TransacaoDTO format
    const data = transacoesRaw.map(t => ({
      ...t,
      id: t.id,
      comprador: t.comprador.name,
      produtor: t.produtor.name
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update a transaction
   */
  async update(id: number, data: UpdateTransacaoDTO): Promise<TransacaoDTO> {
    const updatedTransacao = await this.prisma.transacao.update({
      where: { id },
      data: {
        quantidade: data.quantidade,
        precoUnitario: data.precoUnitario,
        data: data.data,
        status: data.status,
        observacoes: data.observacoes,
      },
      include: {
        comprador: {
          select: { name: true }
        },
        produtor: {
          select: { name: true }
        }
      }
    });

    return {
      ...updatedTransacao,
      id: updatedTransacao.id,
      comprador: updatedTransacao.comprador.name,
      produtor: updatedTransacao.produtor.name
    };
  }

  /**
   * Delete a transaction
   */
  async delete(id: number): Promise<void> {
    await this.prisma.transacao.delete({
      where: { id }
    });
  }

  /**
   * Get transactions by user ID (as either buyer or seller)
   */
  async getByUsuarioId(usuarioId: number, filter: TransacaoFilterParams = {}): Promise<TransacaoPagedResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      dataInicio,
      dataFim
    } = filter;

    const skip = (page - 1) * limit;

    // User can be either buyer or seller
    const where: Prisma.TransacaoWhereInput = {
      OR: [
        { compradorId: usuarioId },
        { produtorId: usuarioId }
      ]
    };

    // Apply additional filters
    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) {
        where.data.gte = dataInicio;
      }
      if (dataFim) {
        where.data.lte = dataFim;
      }
    }

    const [transacoesRaw, total] = await Promise.all([
      this.prisma.transacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: {
          comprador: {
            select: { name: true }
          },
          produtor: {
            select: { name: true }
          }
        }
      }),
      this.prisma.transacao.count({ where })
    ]);

    // Transform data for API
    const data = transacoesRaw.map(t => ({
      ...t,
      id: t.id,
      comprador: t.comprador.name,
      produtor: t.produtor.name
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find all transactions with advanced filtering
   */
  async findAll(filters: TransacaoFilterDTO = {}): Promise<TransacaoPagedResponse> {
    const {
      page = 1,
      limit = 10,
      compradorId,
      produtorId,
      status,
      dataInicio,
      dataFim
    } = filters;

    return this.getAll({
      page,
      limit,
      compradorId,
      produtorId,
      status,
      dataInicio,
      dataFim
    });
  }
}