import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import type { Usuario } from '@prisma/client';
import prisma from '@@/lib/prisma';
import type { CooperativaDTO } from '~/types/api';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session?.user) {
    return null;
  }
  const user = session.user as Usuario;
  if (!user.cooperativaId) {
    return null;
  }

  // Fetch cooperativa with Estado sigla
  const coop = await prisma.cooperativa.findUnique({
    where: { id: user.cooperativaId },
    select: {
      id: true,
      nome: true,
      celular: true,
      cnpj: true,
      endereco: true,
      cidade: true,
      estado: { select: { sigla: true } }
    }
  });
  if (!coop) {
    return null;
  }
  const result: CooperativaDTO = {
    id: coop.id,
    nome: coop.nome,
    celular: coop.celular,
    cnpj: coop.cnpj,
    endereco: coop.endereco,
    cidade: coop.cidade,
    estado: coop.estado?.sigla || null
  };
  return result;
});
