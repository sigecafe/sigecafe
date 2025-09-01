import { describe, it, expect } from 'vitest';
import { hash, verify } from '@@/server/utils/crypto';

describe('Criptografia', () => {
    const SENHA_TESTE = 'senha123';
    const SENHA_INVALIDA = 'senhaerrada';
    const SENHA_VAZIA = '';
    const SENHA_LONGA = 'a'.repeat(72); // bcrypt tem limite de 72 bytes

    describe('hash', () => {
        it('deve gerar um hash bcrypt válido', async () => {
            const senhaCriptografada = await hash(SENHA_TESTE);
            expect(senhaCriptografada).not.toBe(SENHA_TESTE);
            expect(senhaCriptografada).toMatch(/^\$2[ayb]\$.{56}$/);
        });

        it('deve gerar hashes diferentes para a mesma senha', async () => {
            const [senhaCriptografada1, senhaCriptografada2] = await Promise.all([
                hash(SENHA_TESTE),
                hash(SENHA_TESTE)
            ]);
            expect(senhaCriptografada1).not.toBe(senhaCriptografada2);
        });

        it('deve lidar com senha vazia', async () => {
            await expect(hash(SENHA_VAZIA)).rejects.toThrow();
        });

        it('deve lidar com senha muito longa', async () => {
            const senhaCriptografada = await hash(SENHA_LONGA);
            expect(senhaCriptografada).toMatch(/^\$2[ayb]\$.{56}$/);
        });
    });

    describe('verify', () => {
        it('deve validar uma senha correta', async () => {
            const senhaCriptografada = await hash(SENHA_TESTE);
            const corresponde = await verify(SENHA_TESTE, senhaCriptografada);
            expect(corresponde).toBe(true);
        });

        it('deve rejeitar uma senha incorreta', async () => {
            const senhaCriptografada = await hash(SENHA_TESTE);
            const corresponde = await verify(SENHA_INVALIDA, senhaCriptografada);
            expect(corresponde).toBe(false);
        });

        it('deve rejeitar um hash inválido', async () => {
            await expect(verify(SENHA_TESTE, 'hash_invalido')).rejects.toThrow();
        });

        it('deve rejeitar um hash vazio', async () => {
            await expect(verify(SENHA_TESTE, '')).rejects.toThrow();
        });

        it('deve rejeitar uma senha vazia', async () => {
            const senhaCriptografada = await hash(SENHA_TESTE);
            await expect(verify(SENHA_VAZIA, senhaCriptografada)).rejects.toThrow();
        });

        it('deve lidar com senha muito longa corretamente', async () => {
            const senhaCriptografada = await hash(SENHA_LONGA);
            const corresponde = await verify(SENHA_LONGA, senhaCriptografada);
            expect(corresponde).toBe(true);
        });
    });
});