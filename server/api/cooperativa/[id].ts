import { getServerSession } from '#auth';
import { UsuarioType } from '@prisma/client';
import { CooperativaRepository } from '@@/server/repositories/CooperativaRepository'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session?.user) {
    return [];
  }

  const id = getRouterParam(event, 'id');

  const cooperativaRepository = new CooperativaRepository();

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID is required'
    });
  }
  return await cooperativaRepository.getCooperativaById(parseInt(id));
})