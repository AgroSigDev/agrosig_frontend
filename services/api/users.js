// services/api/users.js - GESTIÓN DE USUARIOS (SOLO USO INTERNO)
import { API_URL, fetchConfig } from './utils';
import { authenticatedFetch, getAuthToken, getCurrentUser } from './auth';

// === FUNCIONES PARA ADMINISTRADORES (GESTIÓN DE USUARIOS) === //

// GET USERS - OBTENER TODOS LOS USUARIOS (SOLO ADMIN)
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

// GET USER BY ID - PARA ADMIN (usa params: /users/:id)
export const getUserById = async (userId) => {
  try {
    const response = await authenticatedFetch(`${API_URL}/users/${userId}`);

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

// CREATE USER - CREAR USUARIO (SOLO ADMIN)
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

// UPDATE USER - PARA ADMIN (actualizar cualquier usuario - usa params: /users/:id)
export const updateUser = async (userId, userData) => {
  try {
    console.log("[FRONTEND] Actualizando usuario como admin:", { userId, userData });

    if (!userId || userId === 'undefined') {
      throw new Error('ID de usuario no válido');
    }

    const response = await authenticatedFetch(`${API_URL}/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        first_name: userData.first_name,
        paternal_surname: userData.paternal_surname,
        maternal_surname: userData.maternal_surname,
        email: userData.email
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar usuario');
    }

    const data = await response.json();
    console.log("Usuario actualizado:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
};

// UPDATE USER STATUS - ACTUALIZAR ESTADO (SOLO ADMIN - usa params: /users/update-status/:id)
export const updateUserStatus = async (userId, isActive) => {
  try {
    console.log("Actualizando estado:", { userId, isActive });

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
    console.log("Estado actualizado:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando estado del usuario:', error);
    throw error;
  }
};

// UPDATE USER ROLE - ACTUALIZAR ROL (SOLO ADMIN - usa params: /users/update-role/:id)
export const updateUserRole = async (userId, roleId) => {
  try {
    console.log("Actualizando rol:", { userId, roleId });

    const response = await authenticatedFetch(`${API_URL}/users/update-role/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        role_id: roleId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar rol del usuario');
    }

    const data = await response.json();
    console.log("Rol actualizado:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando rol del usuario:', error);
    throw error;
  }
};

// DELETE USER - ELIMINAR USUARIO (SOLO ADMIN - usa params: /users/delete-user/:id)
export const deleteUser = async (userId) => {
  try {
    console.log("Eliminando usuario:", { userId });

    const response = await authenticatedFetch(`${API_URL}/users/delete-user/${userId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al eliminar usuario');
    }

    const data = await response.json();
    console.log("Usuario eliminado:", data);
    return data;
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    throw error;
  }
};

// === FUNCIONES PARA USUARIOS NORMALES (GESTIÓN DE PERFIL PROPIO) === //

// GET OWN PROFILE - OBTENER PERFIL PROPIO (usa /users/profile/me)
export const getOwnProfile = async () => {
  try {
    const response = await authenticatedFetch(`${API_URL}/users/profile/me`);

    if (!response.ok) {
      throw new Error('Error al obtener perfil');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    throw error;
  }
};

// UPDATE OWN PROFILE - ACTUALIZAR PERFIL PROPIO (usa /users/profile/me)
export const updateOwnProfile = async (userData) => {
  try {
    console.log("[FRONTEND] Actualizando perfil propio:", { userData });

    const response = await authenticatedFetch(`${API_URL}/users/profile/me`, {
      method: "PATCH",
      body: JSON.stringify({
        first_name: userData.first_name,
        paternal_surname: userData.paternal_surname,
        maternal_surname: userData.maternal_surname,
        email: userData.email
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar perfil');
    }

    const data = await response.json();
    console.log("Perfil actualizado:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
};

// UPDATE OWN PASSWORD - ACTUALIZAR CONTRASEÑA PROPIA (usa /users/password/me)
export const updateOwnPassword = async (oldPassword, newPassword, repeatedPassword) => {
  try {
    console.log("Actualizando contraseña propia");

    const response = await authenticatedFetch(`${API_URL}/users/password/me`, {
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
    console.log("Contraseña actualizada:", data);
    return data.data || data;
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    throw error;
  }
};

// UPDATE OWN PROFILE IMAGE - ACTUALIZAR IMAGEN PROPIA (usa /users/image/me)
export const updateOwnProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profile', imageFile);

    const response = await fetch(`${API_URL}/users/image/me`, {
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

// Función para verificar permisos de administrador
export const checkAdminPermissions = async () => {
  try {
    const currentUser = await getOwnProfile(); // Usar getOwnProfile en lugar de getCurrentUser
    return currentUser.role_id === 1; // 1 = Administrador
  } catch (error) {
    console.error('Error verificando permisos:', error);
    return false;
  }
};

// Función auxiliar para determinar qué función usar según el contexto
export const getUserService = (isAdminContext = false) => {
  return {
    // Para administradores
    getUsers: isAdminContext ? getUsers : null,
    getUserById: isAdminContext ? getUserById : null,
    createUser: isAdminContext ? createUser : null,
    updateUser: isAdminContext ? updateUser : null,
    updateUserStatus: isAdminContext ? updateUserStatus : null,
    updateUserRole: isAdminContext ? updateUserRole : null,
    deleteUser: isAdminContext ? deleteUser : null,
    
    // Para usuarios normales (siempre disponibles)
    getOwnProfile,
    updateOwnProfile,
    updateOwnPassword,
    updateOwnProfileImage
  };
};