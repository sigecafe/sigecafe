import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';
import type { ColaboradorDTO } from '~/types/api';

interface ColaboradorFilterParams {
  page?: number;
  limit?: number;
  nome?: string;
  cargo?: string;
  cooperativaId?: number;
}

export class ColaboradorRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create a new Colaborador
   */
  async create(data: any): Promise<ColaboradorDTO> {
    return await this.prisma.colaborador.create({
      data
    });
  }

  /**
   * Get Colaborador by ID
   */
  async getById(id: number): Promise<ColaboradorDTO | null> {
    return await this.prisma.colaborador.findUnique({
      where: { id }
    });
  }

  /**
   * Get all Colaboradores with optional filtering
   */
  async getAll(params: ColaboradorFilterParams = {}): Promise<{ data: ColaboradorDTO[], meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const {
      page = 1,
      limit = 10,
      nome,
      cargo,
      cooperativaId,
    } = params;

    const skip = (page - 1) * limit;

    const where = {
      ...(nome && { nome: { contains: nome, mode: 'insensitive' as const } }),
      ...(cargo && { cargo: { contains: cargo, mode: 'insensitive' as const } }),
      ...(cooperativaId && { cooperativaId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.colaborador.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.colaborador.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a Colaborador
   */
  async update(id: number, data: any): Promise<ColaboradorDTO> {
    return await this.prisma.colaborador.update({
      where: { id },
      data
    });
  }

  /**
   * Delete a Colaborador
   */
  async delete(id: number): Promise<void> {
    await this.prisma.colaborador.delete({
      where: { id }
    });
  }

  /**
   * Get all Colaboradores by cooperativa ID
   */
  async getByCooperativa(cooperativaId: number, filter: ColaboradorFilterParams = {}): Promise<{ data: ColaboradorDTO[], meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const {
      page = 1,
      limit = 10,
      nome,
      cargo,
    } = filter;

    const skip = (page - 1) * limit;

    const where = {
      cooperativaId,
      ...(nome && { nome: { contains: nome, mode: 'insensitive' as const } }),
      ...(cargo && { cargo: { contains: cargo, mode: 'insensitive' as const } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.colaborador.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.colaborador.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}