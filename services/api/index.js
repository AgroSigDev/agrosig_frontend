//archivo unico que importan las vistas

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
  logout,
  getCurrentUser
} from './auth';

// Gestión de usuarios
export {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserPassword,
  updateProfileImage,
  getUserById,
  checkAdminPermissions
} from './users';

// Gestión de comentarios
export {
  getComments,
  createComment,
  updateComment,
  deleteComment
} from './comments';