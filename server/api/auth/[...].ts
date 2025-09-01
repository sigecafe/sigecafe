import CredentialsProvider from 'next-auth/providers/credentials'
import type { Usuario, UsuarioType } from '@prisma/client'
import { NuxtAuthHandler } from '#auth'
import { verify } from '@@/server/utils/crypto'
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository'
import type { UsuarioDTO, LoginDTO } from '~/types/api'

const usuarioRepository = new UsuarioRepository()
const authSecret = process.env.AUTH_SECRET

export default NuxtAuthHandler({
    secret: authSecret,
    pages: {
        signIn: '/auth',
    },
    session: {
        strategy: 'jwt',
        maxAge: 600,
    },
    providers: [
        // @ts-ignore
        CredentialsProvider.default({
            name: 'Credentials',
            // @ts-ignore
            async authorize(credentials: LoginDTO) {
                if (!credentials?.celular || !credentials?.password) {
                    throw new Error('Credenciais inválidas')
                }

                // Normalize phone number by removing non-digit characters
                const normalizedCelular = credentials.celular.replace(/\D/g, '')

                const usuario = await usuarioRepository.getUsuarioByCelular(normalizedCelular)

                if (!usuario || !usuario.password) {
                    throw new Error('Credenciais inválidas')
                }

                const isPasswordValid = await verify(credentials.password, usuario.password)
                if (!isPasswordValid) {
                    throw new Error('Credenciais inválidas')
                }

                return usuario
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token?.sub) {
                const usuario: Usuario | null = await usuarioRepository.getUsuarioById(parseInt(token.sub))
                if (usuario) {
                    session.user = usuario as unknown as UsuarioDTO
                } else {
                    session.user = undefined
                }
            }
            return session
        }
    }
})