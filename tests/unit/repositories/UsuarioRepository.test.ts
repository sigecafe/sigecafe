import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository';

// Mock the Prisma client first, before using any mock variables
vi.mock('@@/lib/prisma', () => {
  return {
    default: {
      usuario: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn(),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      },
      userPreference: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 })
      },
      notificacao: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 })
      },
      passwordResetToken: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 })
      },
      oferta: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 })
      },
      transacao: {
        findMany: vi.fn().mockResolvedValue([]),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 })
      }
    }
  };
});

// Import the mocked module after mocking
import prisma from '@@/lib/prisma';

// Get the mocked type
const mockedPrisma = prisma as unknown as {
  usuario: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  userPreference: {
    deleteMany: ReturnType<typeof vi.fn>;
  };
  notificacao: {
    deleteMany: ReturnType<typeof vi.fn>;
  };
  passwordResetToken: {
    deleteMany: ReturnType<typeof vi.fn>;
  };
  oferta: {
    deleteMany: ReturnType<typeof vi.fn>;
  };
  transacao: {
    findMany: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
};

describe('UsuarioRepository', () => {
    let usuarioRepository: UsuarioRepository;

    beforeEach(() => {
        usuarioRepository = new UsuarioRepository();
        // Reset mock counters
        vi.clearAllMocks();

        // Configure mock implementations after clearing mocks
        mockedPrisma.usuario.findFirst.mockImplementation((params: any) => {
          if (params?.where?.email === 'existing@example.com') {
            return Promise.resolve({
              id: 2,
              email: 'existing@example.com',
              name: 'Existing User',
              password: 'password',
              celular: '9876543210',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          return Promise.resolve(null);
        });

        mockedPrisma.usuario.create.mockImplementation((data: any) => {
          return Promise.resolve({
            id: 1,
            ...data.data,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
    });

    it('should create a new usuario successfully', async () => {
        const mockUsuario = {
            email: 'test@example.com',
            name: 'Test User',
            password: 'securepassword',
            celular: '1234567890',
        };

        const createdUsuario = await usuarioRepository.createUsuario(mockUsuario as any);

        expect(createdUsuario).toHaveProperty('id');
        expect(createdUsuario.email).toBe(mockUsuario.email);
        expect(createdUsuario.name).toBe(mockUsuario.name);
    });

    it('should get usuario by id', async () => {
        const result = await usuarioRepository.getUsuarioById(1);
        expect(result).toBeNull(); // Mocked to return null
    });

    it('should delete a usuario by email if it exists', async () => {
        // Test with an existing user
        await usuarioRepository.deleteUsuarioByEmail('existing@example.com');

        // Verify findFirst was called with the right email
        expect(mockedPrisma.usuario.findFirst).toHaveBeenCalledWith({ where: { email: 'existing@example.com' }});

        // Verify delete was called with the right ID
        expect(mockedPrisma.usuario.delete).toHaveBeenCalledWith({ where: { id: 2 }});
    });

    it('should not call delete if usuario email does not exist', async () => {
        // Test with a non-existing user
        await usuarioRepository.deleteUsuarioByEmail('nonexistent@example.com');

        // Verify delete was not called
        expect(mockedPrisma.usuario.delete).not.toHaveBeenCalled();
    });
});