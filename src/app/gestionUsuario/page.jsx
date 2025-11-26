"use client";
import { useState, useEffect } from "react";
import {
  removeAuthTokens,
  checkAuthStatus,
  getOwnProfile, // CAMBIADO: getCurrentUser por getOwnProfile
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  getRoleName,
  registerWithImage,
  updateOwnProfileImage, // CAMBIADO: updateProfileImage por updateOwnProfileImage
  updateOwnPassword, // CAMBIADO: updateUserPassword por updateOwnPassword
  deleteUser // AÑADIDO: Función para eliminar usuario
} from "../../../services/api/index";
import { useRouter } from 'next/navigation';
import notificationService from "../../utils/notifications";
import Navigation from "../../components/Navigation";
import UserModal from "../../components/UserModal";

// Función para obtener la inicial del nombre como fallback
const getInitialFromName = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

// Colores más profesionales y sutiles
const getColorFromId = (id) => {
  const colors = [
    'bg-slate-600', 'bg-stone-600', 'bg-neutral-600',
    'bg-zinc-600', 'bg-gray-600', 'bg-slate-700',
    'bg-stone-700', 'bg-neutral-700', 'bg-zinc-700'
  ];
  return colors[id % colors.length];
};

export default function GestionUsuarioPage() {
  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [updatingStatus, setUpdatingStatus] = useState({}); // Estado para controlar qué usuario está actualizando

  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [sending, setSending] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    initializePage();
  }, [router]);

  // Componente para mostrar el avatar - MEJORADO
  const UserAvatar = ({ user, size = "w-8 h-8" }) => {
    const [imageError, setImageError] = useState(false);

    // Reset error state when user changes
    useEffect(() => {
      setImageError(false);
    }, [user]);

    if (user.profileImage && !imageError) {
      return (
        <img
          src={user.profileImage}
          alt={`Avatar de ${user.name}`}
          className={`${size} rounded-lg object-cover shadow-sm border border-gray-200`}
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      );
    }

    return (
      <div className={`${size} ${getColorFromId(user.id)} rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm border border-gray-200`}>
        {getInitialFromName(user.name)}
      </div>
    );
  };

  const initializePage = async () => {
    try {
      console.log('🔄 Inicializando página de gestión de usuarios...');
      const status = checkAuthStatus();
      if (!status.isAuthenticated) {
        console.log('No autenticado, redirigiendo...');
        router.push('/login');
        return;
      }

      notificationService.init();

      // Obtener datos del usuario actual
      console.log('Obteniendo usuario actual...');
      const currentUser = await getOwnProfile(); // CAMBIADO: getCurrentUser por getOwnProfile

      setUserData({
        name: `${currentUser.first_name || ''} ${currentUser.paternal_surname || ''}`.trim(),
        email: currentUser.email || "admin@agrosig.com",
        role: getRoleName(currentUser.role_id),
        userId: currentUser.user_id || currentUser.id, // Actualizado para usar user_id
        profileImage: currentUser.image_user ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${currentUser.image_user}` : null
      });

      // Cargar usuarios 
      await cargarUsuarios();
    } catch (error) {
      console.error('Error inicializando página:', error);
      notificationService.showErrorNotification('Error al cargar los usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await getUsers();

      console.log("Usuarios cargados del backend:", usuariosData);

      // Transformar los datos del backend al formato que espera tu frontend
      const usuariosTransformados = usuariosData.map(usuario => {
        // Construir nombre completo
        const fullName = `${usuario.first_name || ''} ${usuario.paternal_surname || ''} ${usuario.maternal_surname || ''}`.trim();

        // Construir URL de imagen correctamente
        let profileImageUrl = null;
        if (usuario.image_user) {
          if (usuario.image_user.startsWith('http')) {
            profileImageUrl = usuario.image_user;
          } else {
            profileImageUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${usuario.image_user}`;
          }
        }

        return {
          id: usuario.user_id,
          name: fullName,
          email: usuario.email,
          role: getRoleName(usuario.role_id),
          role_id: usuario.role_id,
          status: usuario.is_active ? 'Activo' : 'Inactivo',
          joinDate: new Date(usuario.created_at).toISOString().split('T')[0],
          profileImage: profileImageUrl,
          is_active: usuario.is_active,
          // Mantener campos individuales para el formulario de edición
          first_name: usuario.first_name,
          paternal_surname: usuario.paternal_surname,
          maternal_surname: usuario.maternal_surname
        };
      });

      setUsuarios(usuariosTransformados);
      console.log(`${usuariosTransformados.length} usuarios cargados correctamente`);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      notificationService.showErrorNotification('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios
  const filteredUsers = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase();
    const name = usuario.name || '';
    const email = usuario.email || '';
    const role = usuario.role || '';
    const status = usuario.status || '';

    const matchesSearch = name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower);
    const matchesRole = selectedRole === 'Todos' || role === selectedRole;
    const matchesStatus = selectedStatus === 'Todos' || status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Reemplaza la función handleAgregarUsuario existente con esta versión mejorada
  const handleAgregarUsuario = async (formData) => {
    try {
      setSending(true);

      // Determinar si es FormData u objeto regular
      const isFormData = formData instanceof FormData;

      // Crear un nuevo FormData para enviar al servidor
      const formDataToSend = new FormData();

      // Agregar los campos al FormData
      if (isFormData) {
        for (let [key, value] of formData.entries()) {
          // CAMBIO: profileImage -> image_user
          if (key === 'profileImage') {
            formDataToSend.append('image_user', value);
          } else {
            formDataToSend.append(key, value);
          }
        }
      } else {
        // Si es un objeto regular, convertirlo a FormData
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            // CAMBIO: profileImage -> image_user
            if (key === 'profileImage') {
              formDataToSend.append('image_user', value);
            } else {
              formDataToSend.append(key, value);
            }
          }
        });
      }

      console.log("Campos en FormData:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      // Llamar a la API para crear el usuario
      const nuevoUsuario = await registerWithImage(formDataToSend);

      console.log("Usuario creado:", nuevoUsuario);

      // CORRECCIÓN: Obtener la imagen correctamente
      let imagePreviewUrl = null;
      let imageFile = null;

      if (isFormData) {
        // Si es FormData, obtener el archivo del formData original (profileImage)
        imageFile = formData.get('profileImage');
      } else {
        // Si es objeto regular, obtener del objeto
        imageFile = formData.profileImage;
      }

      // Crear URL de preview de la imagen si existe
      if (imageFile instanceof File) {
        imagePreviewUrl = URL.createObjectURL(imageFile);
      } else if (nuevoUsuario.image_user || nuevoUsuario.data?.image_user) {
        // Si el backend devuelve la imagen
        const imageName = nuevoUsuario.image_user || nuevoUsuario.data?.image_user;
        imagePreviewUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${imageName}`;
      }

      // Obtener datos para construir el nombre - CORREGIDO
      let first_name, paternal_surname, maternal_surname, email;

      if (isFormData) {
        first_name = formData.get('first_name') || '';
        paternal_surname = formData.get('paternal_surname') || '';
        maternal_surname = formData.get('maternal_surname') || '';
        email = formData.get('email') || '';
      } else {
        first_name = formData.first_name || '';
        paternal_surname = formData.paternal_surname || '';
        maternal_surname = formData.maternal_surname || '';
        email = formData.email || '';
      }

      // Actualizar la lista local
      const usuarioTransformado = {
        id: nuevoUsuario.user_id || nuevoUsuario.id || nuevoUsuario.data?.user_id,
        name: `${first_name} ${paternal_surname} ${maternal_surname}`.trim(),
        email: email,
        role: 'Usuario',
        role_id: 2,
        status: 'Activo',
        joinDate: new Date().toISOString().split('T')[0],
        profileImage: imagePreviewUrl,
        is_active: true,
        first_name: first_name,
        paternal_surname: paternal_surname,
        maternal_surname: maternal_surname
      };

      setUsuarios(prev => [...prev, usuarioTransformado]);
      setShowAddModal(false);
      notificationService.showSuccessNotification('¡Usuario agregado correctamente!');

      // Recargar usuarios después de un breve retraso
      setTimeout(() => {
        cargarUsuarios();
      }, 1000);

    } catch (error) {
      console.error('Error agregando usuario:', error);
      notificationService.showErrorNotification('Error al agregar usuario: ' + (error.message || 'Error desconocido'));
    } finally {
      setSending(false);
    }
  };

  // Función auxiliar para actualizar imagen de usuario (para admin)
  const updateUserWithImage = async (userId, formData) => {
    try {
      // Para administradores, necesitamos una función específica
      // Por ahora, actualizaremos solo los datos sin imagen
      const updateData = {
        first_name: formData.get('first_name')?.trim() || '',
        paternal_surname: formData.get('paternal_surname')?.trim() || '',
        maternal_surname: formData.get('maternal_surname')?.trim() || '',
        email: formData.get('email')?.toLowerCase().trim() || ''
      };

      return await updateUser(userId, updateData);
    } catch (error) {
      console.error('Error actualizando usuario con imagen:', error);
      throw error;
    }
  };

  const handleEditarUsuario = async (formData) => {
    try {
      setSending(true);
      console.log("Iniciando actualización de usuario:", {
        usuarioId: usuarioEditando.id
      });

      // Verificar si es FormData (tiene imagen) u objeto normal
      if (formData instanceof FormData) {
        console.log("Usando FormData para actualización con imagen");

        // Para FormData, usar la función auxiliar
        const result = await updateUserWithImage(usuarioEditando.id, formData);
        console.log("Usuario actualizado con imagen:", result);
      } else {
        console.log("Usando objeto JSON para actualización sin imagen");

        // Para objeto normal, usar la función existente
        const updateData = {
          first_name: formData.first_name.trim(),
          paternal_surname: formData.paternal_surname.trim() || '',
          maternal_surname: formData.maternal_surname.trim() || '',
          email: formData.email.toLowerCase().trim()
        };

        await updateUser(usuarioEditando.id, updateData);
      }

      // Si se debe actualizar la contraseña (solo si se proporcionaron los campos)
      if (formData.get && formData.get('oldPassword') && formData.get('password')) {
        console.log("Actualizando contraseña");
        // NOTA: Para administradores, necesitaríamos una función específica updateUserPassword
        // Por ahora, omitimos esta funcionalidad para admin
        console.warn("Actualización de contraseña por admin no implementada");
      } else if (formData.oldPassword && formData.password) {
        console.log("Actualizando contraseña (objeto)");
        // NOTA: Para administradores, necesitaríamos una función específica updateUserPassword
        console.warn("Actualización de contraseña por admin no implementada");
      }

      // Actualizar la lista local inmediatamente
      setUsuarios(prev => prev.map(usuario => {
        if (usuario.id === usuarioEditando.id) {
          const updatedUser = { ...usuario };

          // Actualizar nombre y email
          if (formData instanceof FormData) {
            updatedUser.first_name = formData.get('first_name') || usuario.first_name;
            updatedUser.paternal_surname = formData.get('paternal_surname') || usuario.paternal_surname;
            updatedUser.maternal_surname = formData.get('maternal_surname') || usuario.maternal_surname;
            updatedUser.email = formData.get('email') || usuario.email;
            updatedUser.name = `${updatedUser.first_name} ${updatedUser.paternal_surname} ${updatedUser.maternal_surname}`.trim();

            // Actualizar imagen si hay una nueva
            const imageFile = formData.get('image');
            if (imageFile instanceof File) {
              updatedUser.profileImage = URL.createObjectURL(imageFile);
            }
          } else {
            updatedUser.first_name = formData.first_name || usuario.first_name;
            updatedUser.paternal_surname = formData.paternal_surname || usuario.paternal_surname;
            updatedUser.maternal_surname = formData.maternal_surname || usuario.maternal_surname;
            updatedUser.email = formData.email || usuario.email;
            updatedUser.name = `${updatedUser.first_name} ${updatedUser.paternal_surname} ${updatedUser.maternal_surname}`.trim();
          }

          return updatedUser;
        }
        return usuario;
      }));

      setShowEditModal(false);
      setUsuarioEditando(null);

      notificationService.showSuccessNotification('¡Usuario actualizado correctamente!');

      // Recargar usuarios para obtener datos actualizados del servidor
      setTimeout(() => {
        cargarUsuarios();
      }, 500);

    } catch (error) {
      console.error('Error editando usuario:', error);

      // Mostrar mensaje de error específico
      let errorMessage = error.message;
      if (error.message.includes('email ya está en uso') ||
        error.message.includes('duplicate key') ||
        error.message.includes('users_email_unique')) {
        errorMessage = 'El correo electrónico ya está en uso por otro usuario. Por favor, usa un email diferente.';
      } else if (error.message.includes('current password is incorrect')) {
        errorMessage = 'La contraseña actual es incorrecta.';
      } else if (error.message.includes('new password cannot be the same')) {
        errorMessage = 'La nueva contraseña debe ser diferente a la actual.';
      } else if (error.message.includes('password do not match')) {
        errorMessage = 'Las nuevas contraseñas no coinciden.';
      } else if (error.message.includes('at least 8 characters')) {
        errorMessage = 'La contraseña debe tener al menos 8 caracteres.';
      }

      notificationService.showErrorNotification(errorMessage);
    } finally {
      setSending(false);
    }
  };

  // Abrir modal de edición - CORREGIDO
  const abrirModalEdicion = (usuario) => {
    console.log("Abriendo modal de edición para:", usuario);

    const usuarioParaEditar = {
      ...usuario,
      // Usar los campos individuales que ya tenemos
      first_name: usuario.first_name || '',
      paternal_surname: usuario.paternal_surname || '',
      maternal_surname: usuario.maternal_surname || '',
      // No incluir password en edición por seguridad
      password: '',
      confirmPassword: '',
      role: usuario.role
    };

    setUsuarioEditando(usuarioParaEditar);
    setShowEditModal(true);
  };

  // Cerrar modales
  const cerrarModales = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setUsuarioEditando(null);
    setSending(false);
  };

  // FUNCIÓN MEJORADA PARA CAMBIAR ESTADO - CON FEEDBACK VISUAL
  const cambiarEstadoUsuario = async (usuarioId, nuevoEstado) => {
    try {
      // No permitir desactivar el propio usuario
      if (usuarioId === userData?.userId && nuevoEstado === 'Inactivo') {
        notificationService.showErrorNotification('No puedes desactivar tu propio usuario');
        return;
      }

      // Mostrar estado de carga para este usuario específico
      setUpdatingStatus(prev => ({ ...prev, [usuarioId]: true }));

      const isActive = nuevoEstado === 'Activo';
      console.log("Cambiando estado:", { usuarioId, isActive });

      await updateUserStatus(usuarioId, isActive);

      // Actualizar la lista local inmediatamente
      setUsuarios(prev => prev.map(usuario =>
        usuario.id === usuarioId
          ? {
            ...usuario,
            status: nuevoEstado,
            is_active: isActive
          }
          : usuario
      ));

      notificationService.showSuccessNotification(
        `Usuario ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`
      );

    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      notificationService.showErrorNotification('Error al cambiar estado del usuario: ' + error.message);
    } finally {
      // Quitar el estado de carga
      setUpdatingStatus(prev => ({ ...prev, [usuarioId]: false }));
    }
  };

  // Función para cambiar rol de usuario
  const cambiarRolUsuario = async (usuarioId, nuevoRolId) => {
    try {
      console.log("Cambiando rol:", { usuarioId, nuevoRolId });

      await updateUserRole(usuarioId, nuevoRolId);

      // Actualizar la lista local
      setUsuarios(prev => prev.map(usuario =>
        usuario.id === usuarioId
          ? {
            ...usuario,
            role: getRoleName(nuevoRolId),
            role_id: nuevoRolId
          }
          : usuario
      ));

      notificationService.showSuccessNotification('Rol de usuario actualizado correctamente');
    } catch (error) {
      console.error('Error cambiando rol del usuario:', error);
      notificationService.showErrorNotification('Error al cambiar rol del usuario: ' + error.message);
    }
  };

  // Función para eliminar usuario
  const eliminarUsuario = async (usuarioId) => {
    try {
      // No permitir eliminar el propio usuario
      if (usuarioId === userData?.userId) {
        notificationService.showErrorNotification('No puedes eliminar tu propio usuario');
        return;
      }

      const confirmed = await notificationService.showDeleteConfirmation(
        '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.'
      );

      if (confirmed) {
        console.log("Eliminando usuario:", usuarioId);

        await deleteUser(usuarioId);

        // Actualizar la lista local
        setUsuarios(prev => prev.filter(usuario => usuario.id !== usuarioId));

        notificationService.showSuccessNotification('Usuario eliminado correctamente');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      notificationService.showErrorNotification('Error al eliminar usuario: ' + error.message);
    }
  };

  const handleLogout = () => {
    notificationService.showSuccessNotification('Has cerrado sesión correctamente. ¡Hasta pronto!');
    removeAuthTokens();
    router.push('/login');
  };

  // Cleanup para URLs de objetos
  useEffect(() => {
    return () => {
      // Limpiar URLs de objetos para evitar memory leaks
      usuarios.forEach(usuario => {
        if (usuario.profileImage && usuario.profileImage.startsWith('blob:')) {
          URL.revokeObjectURL(usuario.profileImage);
        }
      });
    };
  }, [usuarios]);

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <Navigation userData={userData} onLogout={handleLogout} />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent mx-auto mb-4"></div>
            <div className="text-2xl font-semibold text-slate-700 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg">
              Cargando usuarios...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <Navigation userData={userData} onLogout={handleLogout} />

      {/* Tarjeta Principal CON MARGEN SUPERIOR */}
      <div className="mt-16 bg-white p-2 shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm min-h-[85vh] flex flex-col">

        {/* Header con gradiente profesional */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
                <p className="text-green-100 text-sm mt-1">Administra los usuarios del sistema AGROSIG</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-white text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/30">
                {usuarios.length} usuarios registrados
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-semibold text-green-800 mb-1">Total Usuarios</h3>
              <p className="text-2xl font-bold text-green-900">{usuarios.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-1">Usuarios Activos</h3>
              <p className="text-2xl font-bold text-blue-900">
                {usuarios.filter(u => u.status === 'Activo').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <h3 className="text-sm font-semibold text-purple-800 mb-1">Administradores</h3>
              <p className="text-2xl font-bold text-purple-900">
                {usuarios.filter(u => u.role === 'Administrador').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <h3 className="text-sm font-semibold text-orange-800 mb-1">Usuarios Normales</h3>
              <p className="text-2xl font-bold text-orange-900">
                {usuarios.filter(u => u.role === 'Usuario').length}
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Filtro y Búsqueda */}
        <div className="bg-white p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="flex-1 min-w-[250px]">
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[150px]"
              >
                <option value="Todos">Todos los roles</option>
                <option value="Administrador">Administrador</option>
                <option value="Usuario">Usuario</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[150px]"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {/* Botón Agregar Usuario */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Agregar Usuario</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="text-center py-16 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent mx-auto mb-4"></div>
                <div className="text-xl font-semibold text-slate-700">
                  Cargando usuarios...
                </div>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 h-full flex items-center justify-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4 opacity-20 text-gray-400">👥</div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  No se encontraron usuarios
                </h3>
                <p className="text-gray-400 text-sm">
                  {searchTerm || selectedRole !== 'Todos' || selectedStatus !== 'Todos'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay usuarios registrados en el sistema'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Fecha Registro
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                        {/* Columna Usuario */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserAvatar user={usuario} size="w-10 h-10" />
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {usuario.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {usuario.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Columna Rol */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${usuario.role === 'Administrador'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                            {usuario.role}
                          </span>
                        </td>

                        {/* Columna Estado */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${usuario.status === 'Activo'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {usuario.status}
                          </span>
                        </td>

                        {/* Columna Fecha Registro */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{usuario.joinDate}</div>
                        </td>

                        {/* Columna Acciones */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => abrirModalEdicion(usuario)}
                              className="text-green-600 hover:text-green-800 transition-colors p-2 rounded-lg hover:bg-green-50"
                              title="Editar usuario"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>

                            {/* BOTÓN DE ESTADO - MEJORADO CON FEEDBACK VISUAL */}
                            <button
                              onClick={() => cambiarEstadoUsuario(usuario.id, usuario.status === 'Activo' ? 'Inactivo' : 'Activo')}
                              disabled={updatingStatus[usuario.id]}
                              className={`p-2 rounded-lg transition-colors ${updatingStatus[usuario.id]
                                ? 'text-gray-400 cursor-not-allowed'
                                : usuario.status === 'Activo'
                                  ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                                  : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                }`}
                              title={usuario.status === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                            >
                              {updatingStatus[usuario.id] ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                  {usuario.status === 'Activo' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                  )}
                                </svg>
                              )}
                            </button>

                     
                        
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {/* Modal de agregar usuario */}
      <UserModal
        isOpen={showAddModal}
        onClose={cerrarModales}
        onSubmit={handleAgregarUsuario}
        loading={sending}
        user={null}
      />

      {/* Modal de editar usuario */}
      <UserModal
        isOpen={showEditModal}
        onClose={cerrarModales}
        onSubmit={handleEditarUsuario}
        user={usuarioEditando}
        loading={sending}
      />
    </div>
  );
}