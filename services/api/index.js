// services/api/index.js - Archivo único que importan las vistas

// Re-exportar TODAS las funciones desde los módulos internos

// Utilidades
export {
  handleNetworkError,
  checkServerConnection,
  formatUserForForm,
  getRoleName,
  getProfileImageUrl,
  API_URL,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  fetchConfig
} from './utils';

// Autenticación
export {
  setAuthTokens,
  getAuthToken,
  getRefreshToken,
  removeAuthTokens,
  isAuthenticated,
  debugAuthToken,
  login,
  register,
  registerWithImage,
  validateRegisterFields,
  refreshAuthToken,
  authenticatedFetch,
  checkAuthStatus,
  logout
} from './auth';

// Gestión de usuarios - EXPORTACIONES ACTUALIZADAS
export {
  // Funciones para administradores (gestión de usuarios)
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserById,
  
  // Funciones para usuarios normales (gestión de perfil propio)
  getOwnProfile,
  updateOwnProfile,
  updateOwnPassword,
  updateOwnProfileImage,
  
  // Utilidades
  checkAdminPermissions,
  getUserService
} from './users';

// Gestión de comentarios
export {
  getComments,
  createComment,
  updateComment,
  deleteComment
} from './comments';