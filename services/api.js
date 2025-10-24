// services/api.js - ACTUALIZADO PARA MANEJAR FORMData CON IMÁGENES
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:4000";
const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Configuración para desarrollo con certificados auto-firmados
const fetchConfig = {
  ...(typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && {
    mode: 'cors',
    credentials: 'include'
  })
};

// Guardar ambos tokens
export function setAuthTokens(accessToken, refreshToken) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }
}

// Obtener access token
export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}

// Obtener refresh token
export function getRefreshToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

// Eliminar ambos tokens (logout)
export function removeAuthTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

// Verificar si está autenticado
export function isAuthenticated() {
  return !!getAuthToken();
}

// ✅ LOGIN - ACTUALIZADO para tu estructura de respuesta
export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email.trim(),
      password: password.trim()
    }),
    ...fetchConfig
  });

  const responseText = await response.text();

  if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
    throw new Error("Error del servidor: respuesta HTML inesperada");
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
  }

  if (!response.ok) {
    // TRADUCIR MENSAJES DE ERROR AL ESPAÑOL - ACTUALIZADO para tus mensajes
    const errorMessage = data.message || `Error ${response.status} en el login`;
    let translatedMessage = errorMessage;

    // Traducir mensajes específicos de tu backend
    if (errorMessage.includes('User not found')) {
      translatedMessage = "Usuario no encontrado.";
    } else if (errorMessage.includes('The email is already linked to this Google account')) {
      translatedMessage = "El email está vinculado a una cuenta de Google.";
    } else if (errorMessage.includes('User is not active')) {
      translatedMessage = "Usuario inactivo. Contacta al administrador.";
    } else if (errorMessage.includes('Invalid password')) {
      translatedMessage = "Contraseña incorrecta.";
    } else if (errorMessage.includes('Error logging in user')) {
      translatedMessage = "Error al iniciar sesión. Verifica tus credenciales.";
    } else if (response.status === 401) {
      translatedMessage = "No autorizado. Verifica tus credenciales.";
    } else if (response.status === 500) {
      translatedMessage = "Error del servidor. Por favor, intenta más tarde.";
    }

    throw new Error(translatedMessage);
  }

  // ✅ ACTUALIZADO: Tu backend devuelve { success, message, data: { user, token, refreshToken } }
  if (!data.data || !data.data.token) {
    throw new Error("Estructura de respuesta inesperada del servidor");
  }

  // ✅ GUARDAR AMBOS TOKENS
  setAuthTokens(data.data.token, data.data.refreshToken);
  console.log("🔑 Tokens guardados");

  return data.data;
}

// ✅ REGISTER - VERSIÓN PARA JSON (sin imagen)
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData),
    ...fetchConfig
  });

  const responseText = await response.text();

  if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
    throw new Error("Error del servidor: respuesta HTML inesperada");
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
  }

  if (!response.ok) {
    // ✅ ACTUALIZADO: Traducir mensajes de error específicos de tu backend
    const errorMessage = data.message || `Error ${response.status} en el registro`;
    let translatedMessage = errorMessage;

    if (errorMessage.includes('User already exists') ||
      errorMessage.includes('Email already exists')) {
      translatedMessage = "El email ya está registrado.";
    } else if (errorMessage.includes('Weak password') ||
      errorMessage.includes('password length')) {
      translatedMessage = "La contraseña debe tener al menos 6 caracteres.";
    } else if (errorMessage.includes('Invalid email') ||
      errorMessage.includes('email format')) {
      translatedMessage = "El formato del email no es válido.";
    } else if (response.status === 400) {
      translatedMessage = "Datos de registro incompletos o inválidos.";
    } else if (response.status === 500) {
      translatedMessage = "Error del servidor al registrar usuario.";
    }

    throw new Error(translatedMessage);
  }

  return data;
};

// ✅ REGISTER WITH IMAGE - VERSIÓN PARA FormData (con imagen)
export const registerWithImage = async (formData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData,
    // No incluir Content-Type header, el navegador lo establecerá automáticamente con el boundary
    ...fetchConfig
  });

  const responseText = await response.text();

  if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
    throw new Error("Error del servidor: respuesta HTML inesperada");
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
  }

  if (!response.ok) {
    const errorMessage = data.message || `Error ${response.status} en el registro`;
    let translatedMessage = errorMessage;

    if (errorMessage.includes('User already exists') ||
      errorMessage.includes('Email already exists')) {
      translatedMessage = "El email ya está registrado.";
    } else if (errorMessage.includes('Weak password') ||
      errorMessage.includes('password length')) {
      translatedMessage = "La contraseña debe tener al menos 6 caracteres.";
    } else if (errorMessage.includes('Invalid email') ||
      errorMessage.includes('email format')) {
      translatedMessage = "El formato del email no es válido.";
    } else if (errorMessage.includes('Invalid image') ||
      errorMessage.includes('image format')) {
      translatedMessage = "Formato de imagen no válido.";
    } else if (errorMessage.includes('Image too large')) {
      translatedMessage = "La imagen es demasiado grande.";
    } else if (response.status === 400) {
      translatedMessage = "Datos de registro incompletos o inválidos.";
    } else if (response.status === 500) {
      translatedMessage = "Error del servidor al registrar usuario.";
    }

    throw new Error(translatedMessage);
  }

  return data;
};

// ✅ REFRESH TOKEN - ACTUALIZADO
export async function refreshAuthToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No hay token de refresco disponible");
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`
      },
      ...fetchConfig
    });

    // Si no existe el endpoint, manejamos el error
    if (response.status === 404) {
      throw new Error("Endpoint de refresh no disponible");
    }

    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error("Error al refrescar el token de acceso");
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error("Respuesta inválida al refrescar token");
    }

    // ✅ ACTUALIZADO: Asumiendo la misma estructura que login
    if (data.data && data.data.token) {
      setAuthTokens(data.data.token, refreshToken);
      console.log("✅ Token refrescado exitosamente");
      return data.data.token;
    } else {
      throw new Error("Estructura de respuesta inválida al refrescar token");
    }
  } catch (error) {
    removeAuthTokens();
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
  }
}

// ✅ AUTHENTICATED FETCH - ACTUALIZADO
export async function authenticatedFetch(url, options = {}) {
  let token = getAuthToken();

  const config = {
    ...options,
    ...fetchConfig,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    }
  };

  // Solo agregar Authorization si existe el token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(url, config);

  // Si el token expiró (401), intentar refrescar
  if (response.status === 401) {
    console.log("🔄 Token expirado, intentando refrescar...");

    try {
      const newToken = await refreshAuthToken();

      // Reintentar la petición con el nuevo token
      config.headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(url, config);
    } catch (refreshError) {
      // Si el refresh falla, redirigir al login
      removeAuthTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw refreshError;
    }
  }

  return response;
}

// ✅ GET CURRENT USER - ACTUALIZADO para tu endpoint
export const getCurrentUser = async () => {
  try {
    const response = await authenticatedFetch(`${API_URL}/users/get-user/me`);

    if (!response.ok) {
      throw new Error('Error al obtener datos del usuario');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    throw error;
  }
};

// ✅ GET USERS - ACTUALIZADO
export async function getUsers() {
  const response = await authenticatedFetch(`${API_URL}/users`);

  const responseText = await response.text();

  if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
    throw new Error("El servidor devolvió HTML en lugar de JSON");
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error(`Respuesta no JSON: ${responseText.substring(0, 100)}`);
  }

  if (!response.ok) {
    const errorMessage = data.message || `Error ${response.status} al obtener usuarios`;
    throw new Error(errorMessage);
  }

  return data.data || data;
}

// ✅ Función para verificar el estado de la sesión
export function checkAuthStatus() {
  const token = getAuthToken();
  const refreshToken = getRefreshToken();

  return {
    isAuthenticated: !!token,
    hasRefreshToken: !!refreshToken,
    tokens: {
      accessToken: token,
      refreshToken: refreshToken
    }
  };
}

// ✅ Función para cerrar sesión
export const logout = () => {
  removeAuthTokens();
  console.log("🔓 Sesión cerrada - tokens eliminados");
};

// ✅ Funciones para comentarios
export const getComments = async () => {
  try {
    const response = await authenticatedFetch(`${API_URL}/comment/comments`);

    if (!response.ok) {
      throw new Error('Error al obtener comentarios');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    throw error;
  }
};

export const createComment = async (message) => {
  try {
    const response = await authenticatedFetch(`${API_URL}/comment/register`, {
      method: "POST",
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error('Error al crear comentario');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creando comentario:', error);
    throw error;
  }
};

export const updateComment = async (commentId, message) => {
  try {
    const response = await authenticatedFetch(`${API_URL}/comment/update/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar comentario');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error actualizando comentario:', error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await authenticatedFetch(`${API_URL}/comment/delete/${commentId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error('Error al eliminar comentario');
    }

    return true;
  } catch (error) {
    console.error('Error eliminando comentario:', error);
    throw error;
  }
};

// ✅ Función para actualizar imagen de perfil
export const updateProfileImage = async (userId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/users/image/${userId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${getAuthToken()}`
      },
      body: formData,
      ...fetchConfig
    });

    if (!response.ok) {
      throw new Error('Error al actualizar imagen de perfil');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error actualizando imagen de perfil:', error);
    throw error;
  }
};

// ✅ Función para obtener imagen de perfil
export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si la imagen ya es una URL completa
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Si es una ruta relativa, construir la URL completa
  return `${API_URL}/images/${imagePath}`;
};