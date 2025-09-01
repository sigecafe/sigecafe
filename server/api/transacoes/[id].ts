import { getServerSession } from '#auth'
import { PrismaClient, UsuarioType, TransacaoStatus } from '@prisma/client'
import type { TransacaoDTO, UpdateTransacaoDTO } from '~/types/api'

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
    where: { email: session.user.email }
  })

  if (!usuario) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuário não encontrado',
    })
  }

  // Obter o ID da transação da URL
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da transação não informado',
    })
  }

  // Processar as requisições de acordo com o método
  switch (event.method) {
    case 'GET':
      return handleGetTransacao(id, usuario.id, usuario.type)
    case 'PUT':
      return handleUpdateTransacao(event, id, usuario.id, usuario.type)
    case 'DELETE':
      return handleDeleteTransacao(id, usuario.id, usuario.type)
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Método não permitido',
      })
  }
})

async function handleGetTransacao(id: string, usuarioId: number, usuarioType: UsuarioType): Promise<TransacaoDTO> {
  try {
    // Buscar a transação pelo ID
    const transacao = await prisma.transacao.findUnique({
      where: { id: Number(id) },
      include: {
        comprador: true,
        produtor: true,
      },
    })

    if (!transacao) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transação não encontrada',
      })
    }

    // Verificar se o usuário tem permissão para acessar esta transação
    // Administradores podem acessar qualquer transação
    // Outros usuários só podem acessar transações em que são compradores ou produtores
    const isAdmin = usuarioType === UsuarioType.ADMINISTRADOR
    const isInvolved = transacao.compradorId === usuarioId || transacao.produtorId === usuarioId

    if (!isAdmin && !isInvolved) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Você não tem permissão para acessar esta transação',
      })
    }

    // Formatar e retornar a transação
    return {
      id: String(transacao.id),
      data: transacao.data,
      comprador: transacao.comprador.name,
      compradorId: transacao.compradorId,
      produtor: transacao.produtor.name,
      produtorId: transacao.produtorId,
      quantidade: transacao.quantidade,
      precoUnitario: transacao.precoUnitario,
      status: transacao.status,
      observacoes: transacao.observacoes || '',
      createdAt: transacao.createdAt,
      updatedAt: transacao.updatedAt,
    }
  } catch (error) {
    console.error('Erro ao buscar transação:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar transação',
    })
  }
}

async function handleUpdateTransacao(event: any, id: string, usuarioId: number, usuarioType: UsuarioType): Promise<TransacaoDTO> {
  try {
    // Buscar a transação pelo ID
    const transacao = await prisma.transacao.findUnique({
      where: { id: Number(id) },
      include: {
        comprador: true,
        produtor: true,
      },
    })

    if (!transacao) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transação não encontrada',
      })
    }

    // Verificar se o usuário tem permissão para atualizar esta transação
    // Administradores podem atualizar qualquer transação
    // Outros usuários só podem atualizar transações em que são compradores ou produtores
    const isAdmin = usuarioType === UsuarioType.ADMINISTRADOR
    const isInvolved = transacao.compradorId === usuarioId || transacao.produtorId === usuarioId

    if (!isAdmin && !isInvolved) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Você não tem permissão para atualizar esta transação',
      })
    }

    // Ler e validar os dados da requisição
    const body = await readBody(event) as UpdateTransacaoDTO

    if (!body || Object.keys(body).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum dado para atualização foi informado',
      })
    }

    // Preparar os dados para atualização
    const updateData: any = {}

    if (body.quantidade !== undefined) updateData.quantidade = body.quantidade
    if (body.precoUnitario !== undefined) updateData.precoUnitario = body.precoUnitario
    if (body.data !== undefined) updateData.data = new Date(body.data)
    if (body.status !== undefined) updateData.status = body.status as TransacaoStatus
    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes

    // Atualizar a transação
    const updatedTransacao = await prisma.transacao.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        comprador: true,
        produtor: true,
      },
    })

    // Formatar e retornar a transação atualizada
    return {
      id: String(updatedTransacao.id),
      data: updatedTransacao.data,
      comprador: updatedTransacao.comprador.name,
      compradorId: updatedTransacao.compradorId,
      produtor: updatedTransacao.produtor.name,
      produtorId: updatedTransacao.produtorId,
      quantidade: updatedTransacao.quantidade,
      precoUnitario: updatedTransacao.precoUnitario,
      status: updatedTransacao.status,
      observacoes: updatedTransacao.observacoes || '',
      createdAt: updatedTransacao.createdAt,
      updatedAt: updatedTransacao.updatedAt,
    }
  } catch (error) {
    console.error('Erro ao atualizar transação:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao atualizar transação',
    })
  }
}

async function handleDeleteTransacao(id: string, usuarioId: number, usuarioType: UsuarioType): Promise<{ success: boolean, message: string }> {
  try {
    // Buscar a transação pelo ID
    const transacao = await prisma.transacao.findUnique({
      where: { id: Number(id) }
    })

    if (!transacao) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transação não encontrada',
      })
    }

    // Verificar se o usuário tem permissão para excluir esta transação
    // Apenas administradores podem excluir transações
    const isAdmin = usuarioType === UsuarioType.ADMINISTRADOR

    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Apenas administradores podem excluir transações',
      })
    }

    // Excluir a transação
    await prisma.transacao.delete({
      where: { id: Number(id) }
    })

    // Retornar sucesso
    return {
      success: true,
      message: 'Transação excluída com sucesso',
    }
  } catch (error) {
    console.error('Erro ao excluir transação:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao excluir transação',
    })
  }
}