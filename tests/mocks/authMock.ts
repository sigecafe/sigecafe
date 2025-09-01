import { vi } from 'vitest';

// Mock auth session state
export const mockAuthSession = {
  user: {
    email: 'test@example.com',
    name: 'Test User',
    id: 1
  }
};

// Create a mock getServerSession function
export const mockGetServerSession = vi.fn().mockResolvedValue(mockAuthSession);

// Setup auth mock to use in tests
export function setupAuthMock() {
  // Mock the auth module
  vi.mock('#auth', () => ({
    getServerSession: mockGetServerSession
  }));

  // Reset mock implementations
  mockGetServerSession.mockClear();
}

// Helper to set different auth states
export function setAuthState(isAuthenticated: boolean = true) {
  if (isAuthenticated) {
    mockGetServerSession.mockResolvedValue(mockAuthSession);
  } else {
    mockGetServerSession.mockResolvedValue(null);
  }
}