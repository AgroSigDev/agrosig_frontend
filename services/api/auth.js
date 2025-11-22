// services/api/auth.js - AUTENTICACIÓN (SOLO USO INTERNO)
import { 
  API_URL, 
  ACCESS_TOKEN_KEY, 
  REFRESH_TOKEN_KEY, 
  fetchConfig,
  handleNetworkError 
} from './utils';

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

// Función de debug para verificar el token
export const debugAuthToken = () => {
  const token = getAuthToken();
  if (!token) {
    console.log("No hay token disponible");
    return null;
  }

  try {
    const parts = token.split('.');
    console.log("[DEBUG] Token tiene", parts.length, "partes");

    const payload = JSON.parse(atob(parts[1]));
    console.log("[DEBUG] Contenido del token JWT:", payload);
    console.log("[DEBUG] user_id:", payload.user_id, "Tipo:", typeof payload.user_id);
    console.log("[DEBUG] role_id:", payload.role_id, "Tipo:", typeof payload.role_id);
    console.log("[DEBUG] Todos los campos:", Object.keys(payload));

    return payload;
  } catch (error) {
    console.error("Error decodificando token:", error);
    return null;
  }
};

// LOGIN - ACTUALIZADO para tu estructura de respuesta
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

  if (!data.data || !data.data.token) {
    throw new Error("Estructura de respuesta inesperada del servidor");
  }

  // GUARDAR AMBOS TOKENS
  setAuthTokens(data.data.token, data.data.refreshToken);
  console.log("Tokens guardados");

  return data.data;
}

// REGISTER - VERSIÓN PARA JSON (sin imagen)
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

// REGISTER WITH IMAGE - VERSIÓN MEJORADA para FormData (con imagen)
export const registerWithImage = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: formData,
      ...fetchConfig
    });

    const responseText = await response.text();
    console.log("Respuesta del servidor:", responseText);

    if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
      throw new Error("Error del servidor: respuesta HTML inesperada");
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parseando JSON:", parseError);
      throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Error ${response.status} en el registro`;
      let translatedMessage = errorMessage;

      if (errorMessage.includes('User already exists') ||
        errorMessage.includes('Email already exists') ||
        errorMessage.includes('already exists')) {
        translatedMessage = "El email ya está registrado. Por favor, usa otro email.";
      } else if (errorMessage.includes('Weak password') ||
        errorMessage.includes('password length') ||
        errorMessage.includes('password must be')) {
        translatedMessage = "La contraseña debe tener al menos 6 caracteres.";
      } else if (errorMessage.includes('Invalid email') ||
        errorMessage.includes('email format') ||
        errorMessage.includes('valid email')) {
        translatedMessage = "El formato del email no es válido.";
      } else if (errorMessage.includes('Invalid image') ||
        errorMessage.includes('image format') ||
        errorMessage.includes('image type')) {
        translatedMessage = "Formato de imagen no válido. Usa JPEG, PNG, GIF o WebP.";
      } else if (errorMessage.includes('Image too large') ||
        errorMessage.includes('file size')) {
        translatedMessage = "La imagen es demasiado grande. Máximo 5MB.";
      } else if (errorMessage.includes('required') ||
        errorMessage.includes('missing')) {
        translatedMessage = "Por favor, completa todos los campos obligatorios.";
      } else if (response.status === 400) {
        translatedMessage = "Datos de registro incompletos o inválidos.";
      } else if (response.status === 500) {
        translatedMessage = "Error interno del servidor. Por favor, intenta más tarde.";
      }

      throw new Error(translatedMessage);
    }

    console.log("Registro exitoso:", data);
    return data;

  } catch (error) {
    console.error("Error en registerWithImage:", error);
    throw handleNetworkError(error);
  }
};

// Función auxiliar para validar campos del registro
export const validateRegisterFields = (formData) => {
  const errors = [];

  if (!formData.first_name?.trim()) {
    errors.push("El nombre es obligatorio");
  }

  if (!formData.email?.trim()) {
    errors.push("El email es obligatorio");
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.push("El formato del email no es válido");
  }

  if (!formData.password) {
    errors.push("La contraseña es obligatoria");
  } else if (formData.password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres");
  }

  if (!formData.confirmPassword) {
    errors.push("Confirma tu contraseña");
  } else if (formData.password !== formData.confirmPassword) {
    errors.push("Las contraseñas no coinciden");
  }

  return errors;
};

// REFRESH TOKEN - ACTUALIZADO
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

    if (data.data && data.data.token) {
      setAuthTokens(data.data.token, refreshToken);
      console.log("Token refrescado exitosamente");
      return data.data.token;
    } else {
      throw new Error("Estructura de respuesta inválida al refrescar token");
    }
  } catch (error) {
    removeAuthTokens();
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
  }
}

// AUTHENTICATED FETCH - ACTUALIZADO
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

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(url, config);

  if (response.status === 401) {
    console.log("Token expirado, intentando refrescar...");

    try {
      const newToken = await refreshAuthToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(url, config);
    } catch (refreshError) {
      removeAuthTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw refreshError;
    }
  }

  return response;
}

// GET CURRENT USER - CORREGIDO: Usar user_id del token
export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    //  DECODIFICAR TOKEN CORRECTAMENTE
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.user_id;

    console.log("[DEBUG] Token payload completo:", payload);
    console.log("[DEBUG] User ID del token:", userId, "Tipo:", typeof userId);

    if (!userId) {
      console.error('[DEBUG] No se encontró user_id en el token. Campos disponibles:', Object.keys(payload));
      throw new Error('No se pudo obtener el ID del usuario del token');
    }

    const response = await authenticatedFetch(`${API_URL}/users/get-user/${userId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al obtener datos del usuario');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    throw error;
  }
};

// Función para verificar el estado de la sesión
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

// Función para cerrar sesión
export const logout = () => {
  removeAuthTokens();
  console.log("Sesión cerrada - tokens eliminados");
};