import prisma from '@@/lib/prisma'
import type { Cooperativa, Usuario } from '@prisma/client';

export class CooperativaRepository {
    async getCooperativaByUsuario(usuario: Usuario): Promise<Cooperativa | null> {
        if (!usuario.cooperativaId) return null;
        return prisma.cooperativa.findFirst({ where: { id: usuario.cooperativaId } });
    }
    async updateCooperativa(cooperativa: Cooperativa): Promise<Cooperativa | null> {
        return prisma.cooperativa.update({ where: { id: cooperativa.id }, data: cooperativa });
    }
    async getCooperativaById(id: number): Promise<Cooperativa | null> {
        return prisma.cooperativa.findUnique({ where: { id } });
    }
}
