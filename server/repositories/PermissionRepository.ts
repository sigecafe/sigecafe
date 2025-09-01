import prisma from '@@/lib/prisma';
import type { MenuType, Permission, UsuarioType } from '@prisma/client';

export class PermissionRepositoryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermissionRepositoryError';
    }
}

type CreatePermissionDTO = Omit<Permission, 'id'>;
type UpdatePermissionDTO = Partial<Omit<Permission, 'id'>>;

export class PermissionRepository {
    async findAll(): Promise<Permission[]> {
        try {
            return await prisma.permission.findMany();
        } catch (error) {
            throw new PermissionRepositoryError('Erro ao buscar permissões');
        }
    }

    async findByPath(path: string): Promise<Permission | null> {
        try {
            return await prisma.permission.findUnique({
                where: { path }
            });
        } catch (error) {
            throw new PermissionRepositoryError(`Erro ao buscar permissão pelo path: ${path}`);
        }
    }
    async findByPaths(paths: string[]): Promise<Permission[]> {
        try {
            return await prisma.permission.findMany({
                where: {
                    path: {
                        in: paths
                    }
                }
            });
        } catch (error) {
            throw new PermissionRepositoryError('Erro ao buscar permissões por paths');
        }
    }

    async findById(id: number): Promise<Permission | null> {
        try {
            return await prisma.permission.findUnique({
                where: { id }
            });
        } catch (error) {
            throw new PermissionRepositoryError(`Erro ao buscar permissão pelo id: ${id}`);
        }
    }

    async findByUserType(userType: UsuarioType): Promise<Permission[]> {
        try {
            return await prisma.permission.findMany({
                where: { usuarioType: { has: userType } },
            });
        } catch (error) {
            throw new PermissionRepositoryError(`Erro ao buscar permissões para o tipo: ${userType}`);
        }
    }

    async findOnlyApis(): Promise<Permission[]> {
        try {
            return await prisma.permission.findMany({
                where: {
                    path: {
                        startsWith: '/api/'  // Filtra apenas rotas que começam com /api/
                    },
                    menuType: undefined
                },
                orderBy: {
                    path: 'asc'  // Ordena por path para melhor visualização
                }
            });
        } catch (error) {
            throw new PermissionRepositoryError('Erro ao buscar permissões de API');
        }
    }

    async findByMenuType(menuType: MenuType | null): Promise<Permission[]> {
        try {
            return await prisma.permission.findMany({
                where: { menuType: { has: menuType } },
            });
        } catch (error) {
            throw new PermissionRepositoryError(`Erro ao buscar permissões para o tipo: ${menuType}`);
        }
    }

    async create(data: CreatePermissionDTO): Promise<Permission> {
        try {
            return await prisma.permission.create({
                data: { ...data }
            });
        } catch (error) {
            throw new PermissionRepositoryError('Erro ao criar permissão');
        }
    }

    async bulkCreate(data: CreatePermissionDTO[]): Promise<Permission[]> {
        try {
            await prisma.permission.createMany({
                data: data,
                skipDuplicates: true
            });
            return await prisma.permission.findMany({
                where: {
                    path: {
                        in: data.map(item => item.path)
                    }
                }
            });
        } catch (error) {
            throw new PermissionRepositoryError('Erro ao criar múltiplas permissões');
        }
    }

    async update(id: number, data: UpdatePermissionDTO): Promise<Permission> {
        try {
            return await prisma.permission.update({
                where: { id },
                data: { ...data }
            });
        } catch (error) {
            throw new PermissionRepositoryError(`Erro ao atualizar permissão: ${id}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await prisma.permission.delete({
                where: { id }
            });
        } catch (error) {
            throw new PermissionRepositoryError(`Erro ao deletar permissão: ${id}`);
        }
    }
}