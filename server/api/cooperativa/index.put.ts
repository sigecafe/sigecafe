import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { CooperativaRepository } from '@@/server/repositories/CooperativaRepository'
import type { Cooperativa } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session?.user) {
    return [];
  }

  const method = event._method
  const cooperativaRepository = new CooperativaRepository();

  if (method === 'PUT') {
    const body = await readBody<Cooperativa>(event)
    return await cooperativaRepository.updateCooperativa(body)
  }
});
