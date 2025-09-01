import { defineEventHandler } from 'h3';
import type { AuthResponseDTO } from '~/types/api';

export default defineEventHandler(async (event): Promise<AuthResponseDTO> => {
  try {
    // The actual session destruction happens client-side
    // This endpoint is mainly for API completeness and could be extended
    // to handle server-side session invalidation if needed

    return {
      success: true,
      message: 'Logout realizado com sucesso'
    };
  } catch (error) {
    console.error('Error in logout:', error);
    return {
      success: false,
      message: 'Erro ao processar logout'
    };
  }
});