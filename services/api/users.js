// services/api/users.js - GESTIÓN DE USUARIOS (SOLO USO INTERNO)
import { API_URL } from './utils';
import { authenticatedFetch, getAuthToken, getCurrentUser } from './auth';

// GET USERS - FUNCIÓN PARA GESTIÓN DE USUARIOS
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

// CREATE USER - FUNCIÓN PARA CREAR USUARIO
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
    // VALIDAR QUE EL USER_ID NO SEA UNDEFINED
    console.log("[FRONTEND] UserId recibido para actualizar:", userId, "Tipo:", typeof userId);

    if (!userId || userId === 'undefined' || userId === undefined) {
      throw new Error('ID de usuario no válido para la actualización');
    }

    // Convertir a número si es necesario
    const numericUserId = parseInt(userId);
    if (isNaN(numericUserId)) {
      throw new Error('ID de usuario debe ser un número');
    }

    console.log("Actualizando usuario:", { numericUserId, userData });

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

    console.log("Usuario actualizado:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
};

// UPDATE USER STATUS - FUNCIÓN CORREGIDA
export const updateUserStatus = async (userId, isActive) => {
  try {
    console.log(" Actualizando estado:", { userId, isActive });

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
    console.log(" Estado actualizado:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando estado del usuario:', error);
    throw error;
  }
};

// UPDATE USER PASSWORD - FUNCIÓN PARA ACTUALIZAR CONTRASEÑA
export const updateUserPassword = async (userId, oldPassword, newPassword, repeatedPassword) => {
  try {
    console.log(" Actualizando contraseña:", { userId });

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
    console.log(" Contraseña actualizada:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
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
    console.log("Imagen de perfil actualizada:", data);
    return data.data;
  } catch (error) {
    console.error('Error actualizando imagen de perfil:', error);
    throw error;
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