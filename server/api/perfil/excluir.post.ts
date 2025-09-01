import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session?.user) {
    return [];
  }

  const usuarioRepository = new UsuarioRepository();

  if (session.user.email) {
    await usuarioRepository.deleteUsuarioByEmail(session.user.email);
  }
});
