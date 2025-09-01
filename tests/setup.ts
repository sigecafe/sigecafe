import { vi } from 'vitest';

// Mock the auth module to avoid the undefined/api/auth/session error
vi.mock('#auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      email: 'test@example.com',
      name: 'Test User',
      id: 1
    }
  })
}));

// Mock any other problematic Nuxt modules as needed
vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    authJs: {
      baseUrl: 'http://localhost:3000'
    },
    public: {
      apiBaseUrl: 'http://localhost:3000'
    }
  })
}));