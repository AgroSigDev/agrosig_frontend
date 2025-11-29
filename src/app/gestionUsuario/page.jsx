"use client";
import { useState, useEffect } from "react";
import {
  removeAuthTokens,
  checkAuthStatus,
  getOwnProfile,
  getUsers,
  updateUser,
  updateUserStatus,
  updateUserRole,
  getRoleName,
  registerWithImage,
  deleteUser
} from "../../../services/api/index";
import { useRouter } from 'next/navigation';
import notificationService from "../../utils/notifications";
import Navigation from "../../components/Navigation";
import UserModal from "../../components/UserModal";

// SVG Icons
const UsersIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const ActiveIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const AdminIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const AddIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const ToggleOnIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ToggleOffIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const EmptyStateIcon = ({ className = "w-24 h-24" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

// Función para obtener la inicial del nombre
const getInitialFromName = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

// Colores para avatares
const getColorFromId = (id) => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-orange-500 to-orange-600',
    'bg-gradient-to-br from-red-500 to-red-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-cyan-500 to-cyan-600'
  ];
  return colors[id % colors.length];
};

// Componente de Avatar
const UserAvatar = ({ user, size = "w-10 h-10" }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [user]);

  if (user.profileImage && !imageError) {
    return (
      <img
        src={user.profileImage}
        alt={`Avatar de ${user.name}`}
        className={`${size} rounded-xl object-cover shadow-md border-2 border-white transition-all duration-300 hover:scale-105`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} ${getColorFromId(user.id)} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white transition-all duration-300 hover:scale-105`}>
      {getInitialFromName(user.name)}
    </div>
  );
};

// Componente de Tarjeta de Estadística
const StatCard = ({ title, value, color, icon, description }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        {icon}
      </div>
      <div className="text-right">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
      {title}
    </h3>
    {description && (
      <p className="text-xs text-gray-500">{description}</p>
    )}
  </div>
);

// Componente de Filtros
const FilterSection = ({
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onAddUser
}) => (
  <div className="bg-white/60 backdrop-blur-sm p-6 border-y border-gray-200/50">
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      {/* Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
        <div className="flex-1 min-w-[300px] relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-black" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 shadow-sm transition-all duration-200 focus:shadow-md"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-200 focus:shadow-md min-w-[160px] text-gray-800 font-medium"
        >
          <option value="Todos" className="text-gray-800">Todos los roles</option>
          <option value="Administrador" className="text-gray-800">Administradores</option>
          <option value="Usuario" className="text-gray-800">Usuarios</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-200 focus:shadow-md min-w-[160px] text-gray-800 font-medium"
        >
          <option value="Todos" className="text-gray-800">Todos los estados</option>
          <option value="Activo" className="text-gray-800">Activos</option>
          <option value="Inactivo" className="text-gray-800">Inactivos</option>
        </select>
      </div>

      {/* Botón Agregar Usuario */}
      <button
        onClick={onAddUser}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 whitespace-nowrap"
      >
        <AddIcon className="w-5 h-5" />
        <span>Agregar Usuario</span>
      </button>
    </div>
  </div>
);

// Componente de Tabla
const UsersTable = ({
  users,
  onEdit,
  onToggleStatus,
  updatingStatus,
  currentUserId
}) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Fecha Registro
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200/30">
          {users.map((usuario) => (
            <tr key={usuario.id} className="hover:bg-gray-50/80 transition-all duration-200 group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <UserAvatar user={usuario} size="w-10 h-10" />
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {usuario.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {usuario.email}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 ${usuario.role === 'Administrador'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                  {usuario.role === 'Administrador' ? (
                    <AdminIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <UserIcon className="w-3 h-3 mr-1" />
                  )}
                  {usuario.role}
                </span>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 ${usuario.status === 'Activo'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                  {usuario.status === 'Activo' ? (
                    <ActiveIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <ToggleOffIcon className="w-3 h-3 mr-1" />
                  )}
                  {usuario.status}
                </span>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                  {usuario.joinDate}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(usuario)}
                    className="text-blue-600 hover:text-blue-800 transition-all duration-200 p-2 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200"
                    title="Editar usuario"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onToggleStatus(usuario.id, usuario.status === 'Activo' ? 'Inactivo' : 'Activo')}
                    disabled={updatingStatus[usuario.id] || usuario.id === currentUserId}
                    className={`p-2 rounded-lg border border-transparent transition-all duration-200 ${updatingStatus[usuario.id]
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                      : usuario.id === currentUserId
                        ? 'text-gray-300 cursor-not-allowed'
                        : usuario.status === 'Activo'
                          ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50 hover:border-orange-200'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50 hover:border-green-200'
                      }`}
                    title={usuario.id === currentUserId ? 'No puedes cambiar tu propio estado' : usuario.status === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                  >
                    {updatingStatus[usuario.id] ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : usuario.status === 'Activo' ? (
                      <ToggleOffIcon className="w-4 h-4" />
                    ) : (
                      <ToggleOnIcon className="w-4 h-4" />
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
);

// Componente de Estado Vacío
const EmptyState = ({
  searchTerm,
  selectedRole,
  selectedStatus,
  onClearFilters
}) => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
      <div className="text-gray-300 mb-4">
        <EmptyStateIcon className="w-16 h-16 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">
        No se encontraron usuarios
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        {searchTerm || selectedRole !== 'Todos' || selectedStatus !== 'Todos'
          ? 'No hay usuarios que coincidan con los filtros aplicados'
          : 'No hay usuarios registrados en el sistema'
        }
      </p>
      {(searchTerm || selectedRole !== 'Todos' || selectedStatus !== 'Todos') && (
        <button
          onClick={onClearFilters}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  </div>
);

// Componente de Loading
const LoadingState = () => (
  <div className="text-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
    <div className="text-lg font-semibold text-gray-700">
      Cargando usuarios...
    </div>
  </div>
);

export default function GestionUsuarioPage() {
  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [updatingStatus, setUpdatingStatus] = useState({});

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

  const initializePage = async () => {
    try {
      const status = checkAuthStatus();
      if (!status.isAuthenticated) {
        router.push('/login');
        return;
      }

      notificationService.init();

      const currentUser = await getOwnProfile();
      setUserData({
        name: `${currentUser.first_name || ''} ${currentUser.paternal_surname || ''}`.trim(),
        email: currentUser.email || "admin@agrosig.com",
        role: getRoleName(currentUser.role_id),
        userId: currentUser.user_id || currentUser.id,
        profileImage: currentUser.image_user ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${currentUser.image_user}` : null
      });

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

      const usuariosTransformados = usuariosData.map(usuario => {
        const fullName = `${usuario.first_name || ''} ${usuario.paternal_surname || ''} ${usuario.maternal_surname || ''}`.trim();

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
          joinDate: new Date(usuario.created_at).toLocaleDateString('es-ES'),
          profileImage: profileImageUrl,
          is_active: usuario.is_active,
          first_name: usuario.first_name,
          paternal_surname: usuario.paternal_surname,
          maternal_surname: usuario.maternal_surname
        };
      });

      setUsuarios(usuariosTransformados);
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

  // Handlers
  const handleAgregarUsuario = async (formData) => {
    try {
      setSending(true);
      const isFormData = formData instanceof FormData;
      const formDataToSend = new FormData();

      if (isFormData) {
        for (let [key, value] of formData.entries()) {
          if (key === 'profileImage') {
            formDataToSend.append('image_user', value);
          } else {
            formDataToSend.append(key, value);
          }
        }
      } else {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (key === 'profileImage') {
              formDataToSend.append('image_user', value);
            } else {
              formDataToSend.append(key, value);
            }
          }
        });
      }

      const nuevoUsuario = await registerWithImage(formDataToSend);

      let imagePreviewUrl = null;
      let imageFile = null;

      if (isFormData) {
        imageFile = formData.get('profileImage');
      } else {
        imageFile = formData.profileImage;
      }

      if (imageFile instanceof File) {
        imagePreviewUrl = URL.createObjectURL(imageFile);
      } else if (nuevoUsuario.image_user || nuevoUsuario.data?.image_user) {
        const imageName = nuevoUsuario.image_user || nuevoUsuario.data?.image_user;
        imagePreviewUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${imageName}`;
      }

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

  const handleEditarUsuario = async (formData) => {
    try {
      setSending(true);

      if (formData instanceof FormData) {
        const updateData = {
          first_name: formData.get('first_name')?.trim() || '',
          paternal_surname: formData.get('paternal_surname')?.trim() || '',
          maternal_surname: formData.get('maternal_surname')?.trim() || '',
          email: formData.get('email')?.toLowerCase().trim() || ''
        };
        await updateUser(usuarioEditando.id, updateData);
      } else {
        const updateData = {
          first_name: formData.first_name.trim(),
          paternal_surname: formData.paternal_surname.trim() || '',
          maternal_surname: formData.maternal_surname.trim() || '',
          email: formData.email.toLowerCase().trim()
        };
        await updateUser(usuarioEditando.id, updateData);
      }

      setUsuarios(prev => prev.map(usuario => {
        if (usuario.id === usuarioEditando.id) {
          const updatedUser = { ...usuario };
          if (formData instanceof FormData) {
            updatedUser.first_name = formData.get('first_name') || usuario.first_name;
            updatedUser.paternal_surname = formData.get('paternal_surname') || usuario.paternal_surname;
            updatedUser.maternal_surname = formData.get('maternal_surname') || usuario.maternal_surname;
            updatedUser.email = formData.get('email') || usuario.email;
            updatedUser.name = `${updatedUser.first_name} ${updatedUser.paternal_surname} ${updatedUser.maternal_surname}`.trim();
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

      setTimeout(() => {
        cargarUsuarios();
      }, 500);

    } catch (error) {
      console.error('Error editando usuario:', error);
      let errorMessage = error.message;
      if (error.message.includes('email ya está en uso') ||
        error.message.includes('duplicate key') ||
        error.message.includes('users_email_unique')) {
        errorMessage = 'El correo electrónico ya está en uso por otro usuario.';
      }
      notificationService.showErrorNotification(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const abrirModalEdicion = (usuario) => {
    const usuarioParaEditar = {
      ...usuario,
      first_name: usuario.first_name || '',
      paternal_surname: usuario.paternal_surname || '',
      maternal_surname: usuario.maternal_surname || '',
      password: '',
      confirmPassword: '',
      role: usuario.role
    };
    setUsuarioEditando(usuarioParaEditar);
    setShowEditModal(true);
  };

  const cerrarModales = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setUsuarioEditando(null);
    setSending(false);
  };

  const cambiarEstadoUsuario = async (usuarioId, nuevoEstado) => {
    try {
      if (usuarioId === userData?.userId && nuevoEstado === 'Inactivo') {
        notificationService.showErrorNotification('No puedes desactivar tu propio usuario');
        return;
      }

      setUpdatingStatus(prev => ({ ...prev, [usuarioId]: true }));
      const isActive = nuevoEstado === 'Activo';

      await updateUserStatus(usuarioId, isActive);

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
      setUpdatingStatus(prev => ({ ...prev, [usuarioId]: false }));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('Todos');
    setSelectedStatus('Todos');
  };

  const handleLogout = () => {
    notificationService.showSuccessNotification('Has cerrado sesión correctamente. ¡Hasta pronto!');
    removeAuthTokens();
    router.push('/login');
  };

  useEffect(() => {
    return () => {
      usuarios.forEach(usuario => {
        if (usuario.profileImage && usuario.profileImage.startsWith('blob:')) {
          URL.revokeObjectURL(usuario.profileImage);
        }
      });
    };
  }, [usuarios]);

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navigation userData={userData} onLogout={handleLogout} />
        <div className="flex justify-center items-center h-96">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navigation userData={userData} onLogout={handleLogout} />

      {/* Contenedor Principal */}
      <div className="mt-16 bg-white p-2 shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm min-h-[85vh] flex flex-col">
        <div className="bg-white/80 backdrop-blur-xl  shadow-xl border border-white/20 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
                  <p className="text-blue-100">Administra los usuarios del sistema AGROSIG</p>
                </div>
              </div>
              <div className="text-white text-sm bg-white/20 px-3 py-2 rounded-full backdrop-blur-sm border border-white/30">
                {usuarios.length} usuarios registrados
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Usuarios"
                value={usuarios.length}
                color="text-blue-600"
                icon={<UsersIcon className="w-6 h-6 text-blue-600" />}
                description="Usuarios en el sistema"
              />
              <StatCard
                title="Activos"
                value={usuarios.filter(u => u.status === 'Activo').length}
                color="text-green-600"
                icon={<ActiveIcon className="w-6 h-6 text-green-600" />}
                description="Usuarios activos"
              />
              <StatCard
                title="Administradores"
                value={usuarios.filter(u => u.role === 'Administrador').length}
                color="text-purple-600"
                icon={<AdminIcon className="w-6 h-6 text-purple-600" />}
                description="Usuarios con rol admin"
              />
              <StatCard
                title="Usuarios"
                value={usuarios.filter(u => u.role === 'Usuario').length}
                color="text-orange-600"
                icon={<UserIcon className="w-6 h-6 text-orange-600" />}
                description="Usuarios estándar"
              />
            </div>
          </div>

          {/* Filtros */}
          <FilterSection
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onAddUser={() => setShowAddModal(true)}
          />

          {/* Contenido Principal */}
          <div className="p-6">
            {loading ? (
              <LoadingState />
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                searchTerm={searchTerm}
                selectedRole={selectedRole}
                selectedStatus={selectedStatus}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <UsersTable
                users={filteredUsers}
                onEdit={abrirModalEdicion}
                onToggleStatus={cambiarEstadoUsuario}
                updatingStatus={updatingStatus}
                currentUserId={userData?.userId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <UserModal
        isOpen={showAddModal}
        onClose={cerrarModales}
        onSubmit={handleAgregarUsuario}
        loading={sending}
        user={null}
      />

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