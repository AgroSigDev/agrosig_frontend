const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Guardar ambos tokens
export function setAuthTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Verificar si está autenticado
export function isAuthenticated() {
  return !!getAuthToken();
}

// Login - guarda ambos tokens
export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email.trim(),
      password: password.trim()
    })
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
    // TRADUCIR MENSAJES DE ERROR AL ESPAÑOL
    const errorMessage = data.message || `Error ${response.status} en el login`;
    let translatedMessage = errorMessage;

    // Traducir mensajes comunes de error
    if (errorMessage.includes('Error logging in user') ||
      errorMessage.includes('Invalid credentials') ||
      errorMessage.includes('Credenciales inválidas')) {
      translatedMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
    } else if (errorMessage.includes('User not found') ||
      errorMessage.includes('Usuario no encontrado')) {
      translatedMessage = "Usuario no encontrado.";
    } else if (errorMessage.includes('Email not verified') ||
      errorMessage.includes('Email no verificado')) {
      translatedMessage = "Email no verificado. Por favor, verifica tu cuenta.";
    } else if (errorMessage.includes('Account disabled') ||
      errorMessage.includes('Cuenta deshabilitada')) {
      translatedMessage = "Tu cuenta está deshabilitada. Contacta al administrador.";
    } else if (errorMessage.includes('Too many attempts')) {
      translatedMessage = "Demasiados intentos fallidos. Intenta más tarde.";
    } else if (response.status === 401) {
      translatedMessage = "No autorizado. Verifica tus credenciales.";
    } else if (response.status === 403) {
      translatedMessage = "Acceso denegado. No tienes permisos para acceder.";
    } else if (response.status === 404) {
      translatedMessage = "Servicio no encontrado.";
    } else if (response.status >= 500) {
      translatedMessage = "Error del servidor. Por favor, intenta más tarde.";
    }

    throw new Error(translatedMessage);
  }

  if (!data.data || !data.data.token) {
    throw new Error("Estructura de respuesta inesperada del servidor");
  }

  // ✅ GUARDAR AMBOS TOKENS
  setAuthTokens(data.data.token, data.data.refreshToken);
  console.log("🔑 Tokens guardados");

  return data.data;
}

// ✅ Función para refrescar el token usando el endpoint /auth/refresh
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
      }
    });

    const responseText = await response.text();
    console.log("🔄 Respuesta refresh:", responseText);

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
      // Guardar el nuevo access token
      localStorage.setItem(ACCESS_TOKEN_KEY, data.data.token);
      console.log("✅ Token refrescado exitosamente");
      return data.data.token;
    } else {
      throw new Error("Estructura de respuesta inválida al refrescar token");
    }
  } catch (error) {
    // Si el refresh falla, hacer logout
    removeAuthTokens();
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
  }
}

// ✅ Fetch inteligente que maneja refresh automático
export async function authenticatedFetch(url, options = {}) {
  let token = getAuthToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      "Authorization": `Bearer ${token}`
    }
  };

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

// ✅ Función getUsers usando el fetch autenticado
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
    // Traducir mensajes de error para getUsers
    const errorMessage = data.message || `Error ${response.status} al obtener usuarios`;
    let translatedMessage = errorMessage;

    if (response.status === 401) {
      translatedMessage = "No autorizado para ver usuarios";
    } else if (response.status === 403) {
      translatedMessage = "No tienes permisos para acceder a los usuarios";
    } else if (response.status === 404) {
      translatedMessage = "Endpoint de usuarios no encontrado";
    }

    throw new Error(translatedMessage);
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

// ✅ Función para obtener los datos del usuario actual
export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No hay token de acceso disponible');
    }

    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener datos del usuario');
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    throw error;
  }
};

// ✅ Función para cerrar sesión
export const logout = () => {
  removeAuthTokens();
  console.log("🔓 Sesión cerrada - tokens eliminados");
};

// ✅ Función para registrar nuevo usuario
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
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
    // Traducir mensajes de error para registro
    const errorMessage = data.message || `Error ${response.status} en el registro`;
    let translatedMessage = errorMessage;

    if (errorMessage.includes('Email already exists') ||
      errorMessage.includes('Usuario ya existe')) {
      translatedMessage = "El email ya está registrado.";
    } else if (errorMessage.includes('Weak password')) {
      translatedMessage = "La contraseña es demasiado débil.";
    } else if (errorMessage.includes('Invalid email')) {
      translatedMessage = "El formato del email no es válido.";
    } else if (response.status === 400) {
      translatedMessage = "Datos de registro incompletos o inválidos.";
    }

    throw new Error(translatedMessage);
  }

  return data.data || data;
};