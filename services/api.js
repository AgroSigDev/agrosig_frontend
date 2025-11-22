// services/api.js - COMPLETO Y CORREGIDO
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

// Función de debug para verificar el token
export const debugAuthToken = () => {
  const token = getAuthToken();
  if (!token) {
    console.log("❌ No hay token disponible");
    return null;
  }

  try {
    const parts = token.split('.');
    console.log("🔍 [DEBUG] Token tiene", parts.length, "partes");

    const payload = JSON.parse(atob(parts[1]));
    console.log("🔍 [DEBUG] Contenido del token JWT:", payload);
    console.log("🔍 [DEBUG] user_id:", payload.user_id, "Tipo:", typeof payload.user_id);
    console.log("🔍 [DEBUG] role_id:", payload.role_id, "Tipo:", typeof payload.role_id);
    console.log("🔍 [DEBUG] Todos los campos:", Object.keys(payload));

    return payload;
  } catch (error) {
    console.error("❌ Error decodificando token:", error);
    return null;
  }
};

//  LOGIN - ACTUALIZADO para tu estructura de respuesta
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
    console.log("📨 Respuesta del servidor:", responseText);

    if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
      throw new Error("Error del servidor: respuesta HTML inesperada");
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Error parseando JSON:", parseError);
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

    console.log("✅ Registro exitoso:", data);
    return data;

  } catch (error) {
    console.error("❌ Error en registerWithImage:", error);

    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = "Error de conexión. Verifica que el servidor esté ejecutándose y que tengas acceso a HTTPS://localhost:4000";
    } else if (error.message.includes('certificate') || error.message.includes('SSL')) {
      errorMessage = "Error de certificado SSL. En desarrollo, puedes ignorar los warnings de certificados auto-firmados.";
    }

    throw new Error(errorMessage);
  }
};

//  Función auxiliar para validar campos del registro
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
    console.log("🔄 Token expirado, intentando refrescar...");

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

    // ✅ DECODIFICAR TOKEN CORRECTAMENTE
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.user_id;

    console.log("🔍 [DEBUG] Token payload completo:", payload);
    console.log("🔍 [DEBUG] User ID del token:", userId, "Tipo:", typeof userId);

    if (!userId) {
      console.error('❌ [DEBUG] No se encontró user_id en el token. Campos disponibles:', Object.keys(payload));
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

// funciones para gestión de usuarios
// GET USERS - NUEVA FUNCIÓN PARA GESTIÓN DE USUARIOS
export const getUsers = async () => {
  try {
    const response = await authenticatedFetch(`${API_URL}/users`);

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error;
  }
};

//  CREATE USER - NUEVA FUNCIÓN
export const createUser = async (userData) => {
  try {
    // Separar nombre completo en partes
    const nameParts = userData.name.split(' ');
    const first_name = nameParts[0] || '';
    const paternal_surname = nameParts[1] || '';
    const maternal_surname = nameParts[2] || '';

    const response = await authenticatedFetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        first_name: first_name,
        paternal_surname: paternal_surname,
        maternal_surname: maternal_surname,
        email: userData.email,
        password: 'TempPassword123!', // Contraseña temporal
        // Todos los nuevos usuarios se crean como "user" (role_id: 2)
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al crear usuario');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
};

// UPDATE USER - FUNCIÓN MEJORADA CON VALIDACIÓN
export const updateUser = async (userId, userData) => {
  try {
    // ✅ VALIDAR QUE EL USER_ID NO SEA UNDEFINED
    console.log("🔍 [FRONTEND] UserId recibido para actualizar:", userId, "Tipo:", typeof userId);

    if (!userId || userId === 'undefined' || userId === undefined) {
      throw new Error('ID de usuario no válido para la actualización');
    }

    // Convertir a número si es necesario
    const numericUserId = parseInt(userId);
    if (isNaN(numericUserId)) {
      throw new Error('ID de usuario debe ser un número');
    }

    console.log("📤 Actualizando usuario:", { numericUserId, userData });

    const response = await authenticatedFetch(`${API_URL}/users/update-profile/${numericUserId}`, {
      method: "PATCH",
      body: JSON.stringify({
        first_name: userData.first_name,
        paternal_surname: userData.paternal_surname,
        maternal_surname: userData.maternal_surname,
        email: userData.email
      })
    });

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('Respuesta inválida del servidor');
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Error ${response.status} al actualizar usuario`;
      throw new Error(errorMessage);
    }

    console.log("✅ Usuario actualizado:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
};


// UPDATE USER STATUS - FUNCIÓN CORREGIDA
export const updateUserStatus = async (userId, isActive) => {
  try {
    console.log("🔄 Actualizando estado:", { userId, isActive });

    const response = await authenticatedFetch(`${API_URL}/users/update-status/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        is_active: isActive
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar estado del usuario');
    }

    const data = await response.json();
    console.log("✅ Estado actualizado:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando estado del usuario:', error);
    throw error;
  }
};

// UPDATE USER PASSWORD - NUEVA FUNCIÓN
export const updateUserPassword = async (userId, oldPassword, newPassword, repeatedPassword) => {
  try {
    console.log("🔐 Actualizando contraseña:", { userId });

    const response = await authenticatedFetch(`${API_URL}/users/update-password/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        oldPassword,
        newPassword,
        repeatedPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar contraseña');
    }

    const data = await response.json();
    console.log("✅ Contraseña actualizada:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    throw error;
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
  console.log("🔓 Sesión cerrada - tokens eliminados");
};

//  Funciones para comentarios
// obtener comentarios
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

// Función para actualizar imagen de perfil
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
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar imagen de perfil');
    }

    const data = await response.json();
    console.log("✅ Imagen de perfil actualizada:", data);
    return data.data;
  } catch (error) {
    console.error('Error actualizando imagen de perfil:', error);
    throw error;
  }
};

// Función para obtener imagen de perfil
export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  return `${API_URL}/uploads/profile/${imagePath}`;
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

  if (error.message.includes('SSL') || error.message.includes('certificate')) {
    return {
      type: 'ssl',
      message: 'Error de certificado SSL. En desarrollo, acepta el certificado auto-firmado del servidor.',
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

// Función para obtener usuario por ID (para administradores)
export const getUserById = async (userId) => {
  try {
    const response = await authenticatedFetch(`${API_URL}/users/get-user/${userId}`);

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    throw error;
  }
};

// Función para verificar permisos de administrador
export const checkAdminPermissions = async () => {
  try {
    const currentUser = await getCurrentUser();
    return currentUser.role_id === 1; // 1 = Administrador
  } catch (error) {
    console.error('Error verificando permisos:', error);
    return false;
  }
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