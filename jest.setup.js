import '@testing-library/jest-dom';

// Mock de localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn(key => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => {
    localStorageMock.store[key] = value.toString();
  }),
  removeItem: jest.fn(key => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  })
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock de fetch global
global.fetch = jest.fn();

// Variables de entorno para testing
process.env.NEXT_PUBLIC_API_URL = 'https://localhost:4000';
process.env.NODE_ENV = 'test';

// ELIMINAR COMPLETAMENTE la parte de window.location
// No es necesario mockearlo