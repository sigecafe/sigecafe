import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'
import type { Notificacao } from '@prisma/client'

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

  // Processar as requisições de acordo com o método
  switch (event.method) {
    case 'GET':
      return handleGetNotificacoes(usuario.id)
    case 'POST':
      return handleSendNotificacao(event)
    case 'PUT':
      return handleMarkAsRead(event, usuario.id)
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Método não permitido',
      })
  }
})

// Função para obter as notificações do usuário
async function handleGetNotificacoes(usuarioId: number) {
  try {
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId,
        enviada: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return notificacoes.map((n: Notificacao) => ({
      id: n.id,
      titulo: n.titulo,
      descricao: n.descricao,
      icon: n.icon,
      lida: n.lida,
      data: formatTimeAgo(n.createdAt)
    }))
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar notificações',
    })
  }
}

// Função para enviar uma notificação
async function handleSendNotificacao(event: any) {
  try {
    const body = await readBody(event)

    // Se for uma notificação específica a ser enviada
    if (body.id) {
      const notificacao = await prisma.notificacao.update({
        where: { id: body.id },
        data: { enviada: true }
      })
      return { success: true, notificacao }
    }

    // Criar nova notificação
    if (!body.titulo || !body.descricao || !body.usuarioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados incompletos para criar notificação',
      })
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        titulo: body.titulo,
        descricao: body.descricao,
        icon: body.icon || 'lucide:bell',
        enviada: true,
        usuario: {
          connect: { id: body.usuarioId }
        }
      }
    })

    return {
      success: true,
      notificacao: {
        id: notificacao.id,
        titulo: notificacao.titulo,
        descricao: notificacao.descricao,
        icon: notificacao.icon,
        data: formatTimeAgo(notificacao.createdAt)
      }
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao enviar notificação',
    })
  }
}

// Função para marcar notificação como lida
async function handleMarkAsRead(event: any, usuarioId: number) {
  try {
    const body = await readBody(event)

    if (!body.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da notificação é obrigatório',
      })
    }

    // Verificar se a notificação pertence ao usuário
    const notificacao = await prisma.notificacao.findFirst({
      where: {
        id: body.id,
        usuarioId
      }
    })

    if (!notificacao) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Notificação não encontrada',
      })
    }

    // Atualizar status de leitura
    const updatedNotificacao = await prisma.notificacao.update({
      where: { id: body.id },
      data: { lida: true }
    })

    return {
      success: true,
      notificacao: {
        id: updatedNotificacao.id,
        lida: updatedNotificacao.lida
      }
    }
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao marcar notificação como lida',
    })
  }
}

// Função auxiliar para formatar o tempo decorrido
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `Há ${days} dia${days > 1 ? 's' : ''}`
  if (hours > 0) return `Há ${hours}h`
  if (minutes > 0) return `Há ${minutes} min`
  return 'Agora mesmo'
}