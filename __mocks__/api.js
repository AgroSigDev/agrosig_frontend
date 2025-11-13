// Mocks para usar en pruebas de componentes
export const mockApi = {
  login: jest.fn(),
  register: jest.fn(),
  getCurrentUser: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: jest.fn(),
};

// Implementaciones por defecto
mockApi.login.mockResolvedValue({
  user: { id: 1, email: 'test@example.com', name: 'Test User' },
  token: 'mock-token-123',
  refreshToken: 'mock-refresh-token-456'
});

mockApi.register.mockResolvedValue({
  success: true,
  data: { id: 1, email: 'test@example.com', name: 'Test User' }
});

mockApi.getCurrentUser.mockResolvedValue({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role_id: 1
});

mockApi.isAuthenticated.mockReturnValue(true);
mockApi.logout.mockImplementation(() => {});

export default mockApi;