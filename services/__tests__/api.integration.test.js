import {
  login,
  getCurrentUser
} from '../api';

// Mock de fetch para las pruebas de integración
global.fetch = jest.fn();

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('login should handle network errors', async () => {
    // Simular error de red
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(login('test@example.com', 'password'))
      .rejects
      .toThrow('Network error');
  });

  test('login should handle non-JSON responses', async () => {
    // Simular respuesta HTML (error del servidor)
    fetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('<!DOCTYPE html><html>Server Error</html>')
    });

    await expect(login('test@example.com', 'password'))
      .rejects
      .toThrow('Error del servidor: respuesta HTML inesperada');
  });

  test('getCurrentUser should handle missing user_id in token', async () => {
    // Token sin user_id
    const tokenWithoutUserId = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoxLCJpYXQiOjE2MTYyMzkwMjJ9.test';
    
    // Mock localStorage para devolver token sin user_id
    localStorage.setItem('authToken', tokenWithoutUserId);

    await expect(getCurrentUser())
      .rejects
      .toThrow('No se pudo obtener el ID del usuario del token');
  });
});