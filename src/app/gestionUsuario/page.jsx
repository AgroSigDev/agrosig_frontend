// src/app/gestionUsuario/page.jsx
"use client";
import { useState, useEffect } from "react";
import {
  removeAuthTokens,
  checkAuthStatus,
  getCurrentUser,
} from "../../../services/api";
import { useRouter } from 'next/navigation';
import notificationService from "../../utils/notifications";
import Navigation from "../../components/Navigation";

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
  const [showAddUser, setShowAddUser] = useState(false);
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  // Datos del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Usuario',
    status: 'Activo',
    phone: '',
    department: ''
  });

  // Datos mock iniciales
  const usuariosIniciales = [
    {
      id: 1,
      name: 'Ana García',
      email: 'ana@agrosig.com',
      role: 'Administrador',
      status: 'Activo',
      joinDate: '2023-01-15',
      phone: '+34 612 345 678',
      department: 'Dirección',
      profileImage: null
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos@agrosig.com',
      role: 'Técnico',
      status: 'Activo',
      joinDate: '2023-03-22',
      phone: '+34 623 456 789',
      department: 'Campo',
      profileImage: null
    },
    {
      id: 3,
      name: 'María Rodríguez',
      email: 'maria@agrosig.com',
      role: 'Consultor',
      status: 'Inactivo',
      joinDate: '2023-05-10',
      phone: '+34 634 567 890',
      department: 'Comercial',
      profileImage: null
    },
    {
      id: 4,
      name: 'Pedro Martínez',
      email: 'pedro@agrosig.com',
      role: 'Usuario',
      status: 'Activo',
      joinDate: '2023-07-18',
      phone: '+34 645 678 901',
      department: 'Operaciones',
      profileImage: null
    }
  ];

  useEffect(() => {
    setIsClient(true);
    initializePage();
  }, [router]);

  const initializePage = async () => {
    try {
      console.log(' Inicializando página de gestión de usuarios...');
      const status = checkAuthStatus();
      if (!status.isAuthenticated) {
        console.log(' No autenticado, redirigiendo...');
        router.push('/login');
        return;
      }

      notificationService.init();

      // Obtener datos del usuario actual
      console.log('Obteniendo usuario actual...');
      const currentUser = await getCurrentUser();

      setUserData({
        name: currentUser.first_name || "Administrador AGROSIG",
        email: currentUser.email || "admin@agrosig.com",
        role: "Administrador",
        userId: currentUser.user_id,
        profileImage: currentUser.profile_image || currentUser.avatar_url || null
      });

      // Cargar usuarios 
      await cargarUsuarios();
    } catch (error) {
      console.error(' Error inicializando página:', error);
      notificationService.showErrorNotification('Error al cargar los usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      // Simular carga de API
      setTimeout(() => {
        setUsuarios(usuariosIniciales);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      notificationService.showErrorNotification('Error al cargar usuarios: ' + error.message);
      setLoading(false);
    }
  };

  // Filtrar usuarios
  const filteredUsers = usuarios.filter(usuario => {
    const matchesSearch = usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'Todos' || usuario.role === selectedRole;
    const matchesStatus = selectedStatus === 'Todos' || usuario.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarUsuario = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      
      const nuevoUsuario = {
        id: usuarios.length + 1,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        profileImage: null
      };
      
      setUsuarios(prev => [...prev, nuevoUsuario]);
      setFormData({ 
        name: '', 
        email: '', 
        role: 'Usuario', 
        status: 'Activo',
        phone: '',
        department: ''
      });
      setShowAddUser(false);
      
      notificationService.showSuccessNotification('¡Usuario agregado correctamente!');
    } catch (error) {
      console.error('Error agregando usuario:', error);
      notificationService.showErrorNotification('Error al agregar usuario: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const editarUsuario = (usuario) => {
    setEditandoUsuario(usuario);
    setFormData({
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      status: usuario.status,
      phone: usuario.phone,
      department: usuario.department
    });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      
      setUsuarios(prev => prev.map(usuario => 
        usuario.id === editandoUsuario.id 
          ? { ...usuario, ...formData }
          : usuario
      ));
      
      setEditandoUsuario(null);
      setFormData({ 
        name: '', 
        email: '', 
        role: 'Usuario', 
        status: 'Activo',
        phone: '',
        department: ''
      });
      
      notificationService.showSuccessNotification('¡Usuario actualizado correctamente!');
    } catch (error) {
      console.error('Error editando usuario:', error);
      notificationService.showErrorNotification('Error al actualizar usuario: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const eliminarUsuario = async (usuarioId) => {
    try {
      const confirmed = await notificationService.showDeleteConfirmation();

      if (confirmed) {
        setUsuarios(prev => prev.filter(usuario => usuario.id !== usuarioId));
        notificationService.showSuccessNotification('Usuario eliminado correctamente');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      notificationService.showErrorNotification('Error al eliminar usuario: ' + error.message);
    }
  };

  const cancelarEdicion = () => {
    setEditandoUsuario(null);
    setShowAddUser(false);
    setFormData({ 
      name: '', 
      email: '', 
      role: 'Usuario', 
      status: 'Activo',
      phone: '',
      department: ''
    });
  };

  const handleLogout = () => {
    notificationService.showSuccessNotification('Has cerrado sesión correctamente. ¡Hasta pronto!');
    removeAuthTokens();
    router.push('/login');
  };

  // Componente para mostrar el avatar
  const UserAvatar = ({ user, size = "w-8 h-8" }) => {
    if (user.profileImage) {
      return (
        <img
          src={user.profileImage}
          alt={`Avatar de ${user.name}`}
          className={`${size} rounded-lg object-cover shadow-sm border border-gray-200`}
        />
      );
    }

    return (
      <div className={`${size} ${getColorFromId(user.id)} rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm border border-gray-200`}>
        {getInitialFromName(user.name)}
      </div>
    );
  };

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
              <h3 className="text-sm font-semibold text-orange-800 mb-1">Técnicos</h3>
              <p className="text-2xl font-bold text-orange-900">
                {usuarios.filter(u => u.role === 'Técnico').length}
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
                  placeholder="Buscar por nombre, email o departamento..."
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
                <option value="Técnico">Técnico</option>
                <option value="Consultor">Consultor</option>
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
              onClick={() => setShowAddUser(true)}
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

        {/* Modal para Agregar/Editar Usuario */}
        {(showAddUser || editandoUsuario) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                {editandoUsuario ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
              </h2>
              
              <form onSubmit={editandoUsuario ? guardarEdicion : agregarUsuario}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    >
                      <option value="Usuario">Usuario</option>
                      <option value="Técnico">Técnico</option>
                      <option value="Consultor">Consultor</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Guardando...' : (editandoUsuario ? 'Guardar Cambios' : 'Agregar Usuario')}
                  </button>
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla de Usuarios */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {filteredUsers.length === 0 ? (
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
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Departamento
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

                        {/* Columna Contacto */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{usuario.phone || 'N/A'}</div>
                        </td>

                        {/* Columna Departamento */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{usuario.department || 'N/A'}</div>
                        </td>

                        {/* Columna Rol */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            usuario.role === 'Administrador' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : usuario.role === 'Técnico'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : usuario.role === 'Consultor'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {usuario.role}
                          </span>
                        </td>

                        {/* Columna Estado */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            usuario.status === 'Activo'
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
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => editarUsuario(usuario)}
                              className="text-green-600 hover:text-green-800 transition-colors p-2 rounded-lg hover:bg-green-50"
                              title="Editar usuario"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>

                            <button
                              onClick={() => eliminarUsuario(usuario.id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                              title="Eliminar usuario"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
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
    </div>
  );
}