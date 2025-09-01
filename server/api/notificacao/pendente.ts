import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Verificar autenticação
  const session = await getServerSession(event)
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Você precisa estar autenticado para acessar esta funcionalidade',
    })
  }

  // Buscar o usuário pelo email
  const usuario = await prisma.usuario.findFirst({
    where: {
      email: session.user.email as string
    }
  })

  if (!usuario) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuário não encontrado',
    })
  }

  // Apenas administradores e cooperativas podem ver notificações pendentes
  if (usuario.type !== 'ADMINISTRADOR' && usuario.type !== 'COOPERATIVA') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acesso negado',
    })
  }

  try {
    // Buscar notificações pendentes (não enviadas)
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        enviada: false
      },
      include: {
        usuario: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return notificacoes.map(n => ({
      id: n.id,
      titulo: n.titulo,
      descricao: n.descricao,
      celular: n.usuario.celular,
      usuarioNome: n.usuario.name,
      createdAt: n.createdAt
    }))
  } catch (error) {
    console.error('Erro ao buscar notificações pendentes:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar notificações pendentes',
    })
  }
})