import {
  setAuthTokens,
  getAuthToken,
  removeAuthTokens,
  isAuthenticated,
  login,
  register,
  refreshAuthToken,
  getCurrentUser,
  logout,
  debugAuthToken
} from '../api';

// Mock de fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Service - Token Management', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Token Functions', () => {
    test('setAuthTokens should store tokens in localStorage', () => {
      setAuthTokens('test-access-token', 'test-refresh-token');
      
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'test-access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token');
    });

    test('getAuthToken should return stored token', () => {
      localStorage.store['authToken'] = 'test-token';
      
      const token = getAuthToken();
      
      expect(token).toBe('test-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
    });

    test('removeAuthTokens should clear tokens from localStorage', () => {
      localStorage.store['authToken'] = 'test-token';
      localStorage.store['refreshToken'] = 'test-refresh';
      
      removeAuthTokens();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    test('isAuthenticated should return true when token exists', () => {
      localStorage.store['authToken'] = 'test-token';
      expect(isAuthenticated()).toBe(true);
    });

    test('isAuthenticated should return false when no token', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('Login Function', () => {
    test('successful login should return user data and store tokens', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com' },
          token: 'access-token-123',
          refreshToken: 'refresh-token-456'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      });

      const result = await login('test@example.com', 'password123');

      expect(fetch).toHaveBeenCalledWith(
        'https://localhost:4000/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      );

      expect(result).toEqual(mockResponse.data);
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'access-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token-456');
    });

    test('login should throw error with translated message for invalid credentials', async () => {
      const mockResponse = {
        message: 'Invalid password'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      });

      await expect(login('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow('Contraseña incorrecta.');
    });

    test('login should throw error for server HTML response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('<!DOCTYPE html><html>...</html>')
      });

      await expect(login('test@example.com', 'password123'))
        .rejects
        .toThrow('Error del servidor: respuesta HTML inesperada');
    });
  });

  describe('Register Function', () => {
    test('successful register should return data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        success: true,
        data: { id: 1, ...userData }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      });

      const result = await register(userData);

      expect(fetch).toHaveBeenCalledWith(
        'https://localhost:4000/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('register should throw error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      const mockResponse = {
        message: 'Email already exists'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      });

      await expect(register(userData))
        .rejects
        .toThrow('El email ya está registrado.');
    });
  });

  describe('getCurrentUser Function', () => {
    test('should get user data using userId from token', async () => {
      // Mock token con user_id
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsInJvbGVfaWQiOjEsImlhdCI6MTYxNjIzOTAyMn0.test';
      localStorage.store['authToken'] = mockToken;

      const mockUserData = {
        id: 123,
        name: 'Test User',
        email: 'test@example.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockUserData })
      });

      const result = await getCurrentUser();

      expect(fetch).toHaveBeenCalledWith(
        'https://localhost:4000/users/get-user/123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      expect(result).toEqual(mockUserData);
    });

    test('should throw error when no token available', async () => {
      localStorage.store['authToken'] = null;

      await expect(getCurrentUser()).rejects.toThrow('No hay token de autenticación');
    });

    test('should throw error when token has no user_id', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoxLCJpYXQiOjE2MTYyMzkwMjJ9.test';
      localStorage.store['authToken'] = mockToken;

      await expect(getCurrentUser()).rejects.toThrow('No se pudo obtener el ID del usuario del token');
    });
  });

  describe('Refresh Token Function', () => {
    test('successful token refresh should update access token', async () => {
      localStorage.store['refreshToken'] = 'old-refresh-token';
      
      const mockResponse = {
        success: true,
        data: {
          token: 'new-access-token-123'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      });

      const result = await refreshAuthToken();

      expect(fetch).toHaveBeenCalledWith(
        'https://localhost:4000/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer old-refresh-token'
          })
        })
      );

      expect(result).toBe('new-access-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'new-access-token-123');
    });

    test('refresh should throw error when no refresh token', async () => {
      localStorage.store['refreshToken'] = null;

      await expect(refreshAuthToken()).rejects.toThrow('No hay token de refresco disponible');
    });

    test('refresh should logout user when refresh fails', async () => {
      localStorage.store['refreshToken'] = 'invalid-refresh-token';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Invalid token')
      });

      await expect(refreshAuthToken()).rejects.toThrow('Sesión expirada. Por favor, inicia sesión nuevamente.');
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('Logout Function', () => {
    test('logout should remove tokens and clear authentication', () => {
      localStorage.store['authToken'] = 'test-token';
      localStorage.store['refreshToken'] = 'test-refresh';

      logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('Debug Auth Token', () => {
    test('debugAuthToken should decode and log token contents', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsInJvbGVfaWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTYxNjIzOTAyMn0.test';
      localStorage.store['authToken'] = mockToken;

      const consoleSpy = jest.spyOn(console, 'log');
      const result = debugAuthToken();

      expect(result).toEqual({
        user_id: 123,
        role_id: 1,
        email: 'test@example.com',
        iat: 1616239022
      });

      consoleSpy.mockRestore();
    });

    test('debugAuthToken should return null for invalid token', () => {
      localStorage.store['authToken'] = 'invalid-token';

      const result = debugAuthToken();

      expect(result).toBeNull();
    });
  });
});