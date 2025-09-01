import { defineEventHandler, readBody, createError } from 'h3'
import { getServerSession } from '#auth'
import { TransacaoRepository } from '@@/server/repositories/TransacaoRepository'
import type { CreateTransacaoDTO, TransacaoFilterDTO } from '~/types/api'
import { getQuery } from 'h3'

const repo = new TransacaoRepository()

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (event.method === 'GET') {
    const q = getQuery(event)
    const filters: TransacaoFilterDTO = {
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      compradorId: q.compradorId ? Number(q.compradorId) : undefined,
      produtorId: q.produtorId ? Number(q.produtorId) : undefined,
      status: q.status as any,
      dataInicio: q.dataInicio ? new Date(q.dataInicio as string) : undefined,
      dataFim: q.dataFim ? new Date(q.dataFim as string) : undefined,
    }
    return await repo.findAll(filters)
  }
  if (event.method === 'POST') {
    const body = await readBody<CreateTransacaoDTO>(event)
    return await repo.create(body)
  }
  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})

// Interface para tipagem das transações com informações de usuários
interface TransacaoWithUsers {
  id: string;
  data: Date;
  quantidade: number;
  precoUnitario: number;
  status: TransacaoStatus;
  observacoes: string | null;
  compradorId: number;
  produtorId: number;
  comprador: { name: string };
  produtor: { name: string };
  createdAt: Date;
  updatedAt: Date;
}

// Função para obter as transações do usuário
async function handleGetTransacoes(usuarioId: number): Promise<TransacaoDTO[]> {
  try {
    // Buscar o usuário para verificar se é administrador
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado',
      });
    }

    // Se for administrador, buscar todas as transações
    // Se não, buscar apenas as transações onde o usuário é comprador ou vendedor
    const transacoes = await prisma.transacao.findMany({
      where: usuario.type === UsuarioType.ADMINISTRADOR
        ? {}
        : { OR: [ { compradorId: usuarioId }, { produtorId: usuarioId } ] },
      include: { comprador: true, produtor: true },
      orderBy: { data: 'desc' },
    }) as TransacaoWithUsers[]

    // Formatar as transações para o frontend
    return transacoes.map((t) => ({
      id: t.id,
      data: t.data,
      comprador: t.comprador.name,
      compradorId: t.compradorId,
      produtor: t.produtor.name,
      produtorId: t.produtorId,
      quantidade: t.quantidade,
      precoUnitario: t.precoUnitario,
      status: t.status,
      observacoes: t.observacoes || '',
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }))
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar transações',
    })
  }
}

// Função para criar uma nova transação
async function handleCreateTransacao(event: any, usuarioId: number): Promise<TransacaoDTO> {
  try {
    const body = await readBody(event) as CreateTransacaoDTO

    // Validar os dados necessários
    if (!body.quantidade || !body.precoUnitario || !body.data || !body.status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados incompletos para criar transação',
      })
    }

    // Verificar se os IDs do comprador e produtor foram fornecidos
    if (!body.compradorId || !body.produtorId) {
      throw createError({ statusCode: 400, statusMessage: 'IDs do comprador e produtor são obrigatórios' })
    }

    // Criar a transação
    const transacao = await prisma.transacao.create({
      data: {
        quantidade: body.quantidade,
        precoUnitario: body.precoUnitario,
        data: new Date(body.data),
        status: body.status as TransacaoStatus,
        observacoes: body.observacoes,
        comprador: { connect: { id: body.compradorId } },
        produtor: { connect: { id: body.produtorId } },
      },
      include: { comprador: true, produtor: true },
    }) as TransacaoWithUsers

    // Retornar a transação formatada
    return {
      id: transacao.id,
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
      updatedAt: transacao.updatedAt
    }
  } catch (error: unknown) {
    console.error('Erro ao criar transação:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao criar transação',
    })
  }
}