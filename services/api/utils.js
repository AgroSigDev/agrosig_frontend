// services/api/utils.js - CONFIGURACIÓN Y UTILIDADES (SOLO USO INTERNO)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-agrosig-backend.onrender.com/";
const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Configuración para desarrollo con certificados auto-firmados
const fetchConfig = {
  mode: 'cors',
  credentials: 'include'
};

// Función para manejar errores de red
export const handleNetworkError = (error) => {
  if (error.message.includes('Failed to fetch')) {
    return {
      type: 'network',
      message: 'Error de conexión. Verifica tu conexión a internet y que el servidor esté funcionando.',
      originalError: error
    };
  }

  return {
    type: 'general',
    message: error.message,
    originalError: error
  };
};

// Función para verificar la conexión con el servidor
export const checkServerConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'GET',
      ...fetchConfig
    });

    if (response.ok) {
      return { connected: true, message: 'Conexión exitosa con el servidor' };
    } else {
      return { connected: false, message: `Servidor respondió con estado: ${response.status}` };
    }
  } catch (error) {
    return {
      connected: false,
      message: 'No se pudo conectar con el servidor',
      error: error.message
    };
  }
};

// Función auxiliar para mapear role_id a nombre de rol
export const getRoleName = (roleId) => {
  const roleMap = {
    1: 'Administrador',
    2: 'Usuario'
  };
  return roleMap[roleId] || 'Usuario';
};

// Función para formatear datos de usuario para el formulario
export const formatUserForForm = (user) => {
  return {
    first_name: user.first_name || '',
    paternal_surname: user.paternal_surname || '',
    maternal_surname: user.maternal_surname || '',
    email: user.email || '',
    role: getRoleName(user.role_id),
    profileImage: user.image_user ? getProfileImageUrl(user.image_user) : null
  };
};

// Función para obtener imagen de perfil
export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  return `${API_URL}/uploads/profile/${imagePath}`;
};

export { 
  API_URL, 
  ACCESS_TOKEN_KEY, 
  REFRESH_TOKEN_KEY, 
  fetchConfig 
};