import { getServerSession } from '#auth'
import type { Usuario } from '@prisma/client'
import { UsuarioType } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const method = event.method

  // Verificar autenticação
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  // Verificar se o usuário é ADMINISTRADOR
  if ((session.user as Usuario).type !== UsuarioType.ADMINISTRADOR) {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado'
    })
  }

  if (method !== 'GET') {
    throw createError({
      statusCode: 405,
      message: 'Método não permitido'
    })
  }

  try {
    // Retornar todos os tipos de usuário disponíveis no sistema
    const roles = Object.values(UsuarioType).map(role => ({
      value: role,
      label: formatRoleLabel(role)
    }))

    return roles
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao processar requisição',
      cause: error
    })
  }
})

// Função para formatar o label do role para exibição
function formatRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    'ADMINISTRADOR': 'Administrador',
    'COOPERATIVA': 'Cooperativa',
    'PRODUTOR': 'Produtor',
    'COMPRADOR': 'Comprador',
    'AUTENTICADO': 'Usuário Autenticado'
  }

  return labels[role] || role
}