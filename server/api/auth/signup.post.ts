import { defineEventHandler, readBody } from 'h3'
import { hash } from '@@/server/utils/crypto'
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository'
import type { SignupDTO, AuthResponseDTO } from '~/types/api'

const usuarioRepository = new UsuarioRepository()

export default defineEventHandler(async (event): Promise<AuthResponseDTO> => {
    const body = await readBody(event) as SignupDTO
    const { name, celular, password } = body

    if (!name || !celular || !password) {
        return { success: false, message: 'Faltam campos obrigatórios' }
    }

    try {
        const existingUsuario = await usuarioRepository.getUsuarioByCelular(celular)

        if (existingUsuario) {
            return { success: false, errorCode: 'USER_EXISTS', message: 'Usuário já existe' }
        }

        const encodedPassword = await hash(password)

        await usuarioRepository.createUsuario({
            name,
            celular,
            password: encodedPassword,
        })

        return { success: true, message: 'Usuário criado com sucesso' }
    } catch (error) {
        console.error('Erro ao registrar:', error)
        return { success: false, message: 'Ocorreu um erro ao registrar' }
    }
})