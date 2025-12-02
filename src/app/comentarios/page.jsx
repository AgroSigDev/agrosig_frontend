// src/app/comentarios/page.jsx - VERSIÓN COMPLETAMENTE RESPONSIVA
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  removeAuthTokens,
  getOwnProfile,
  getComments as fetchComments,
  createComment as createCommentAPI,
  updateComment as updateCommentAPI,
  deleteComment as deleteCommentAPI,
  isAuthenticated
} from "../../../services/api/index";
import { useRouter } from 'next/navigation';
import notificationService from "../../utils/notifications";
import Navigation from "../../components/Navigation";

// Utilidades
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) return { relativo: "Ahora mismo", fecha: "Ahora" };
  if (diffMinutes < 60) return { relativo: `Hace ${diffMinutes} min`, fecha: `${diffMinutes}m` };
  if (diffHours < 24) return { relativo: `Hace ${diffHours} h`, fecha: `${diffHours}h` };
  if (diffDays < 7) return { relativo: `Hace ${diffDays} d`, fecha: `${diffDays}d` };

  return {
    relativo: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    fecha: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  };
};

const getInitialFromName = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

const getColorFromId = (id) => {
  const colors = [
    'bg-green-600', 'bg-emerald-600', 'bg-teal-600', 
    'bg-cyan-600', 'bg-sky-600', 'bg-blue-600',
    'bg-indigo-600', 'bg-violet-600', 'bg-purple-600'
  ];
  return colors[id % colors.length];
};

// Componente de Avatar responsivo
const UserAvatar = ({ user, size = "w-10 h-10 md:w-12 md:h-12", showOnline = false, className = "" }) => {
  const [imageError, setImageError] = useState(false);

  if (user.profileImage && !imageError) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={user.profileImage}
          alt={`Avatar de ${user.nombre}`}
          className={`${size} rounded-full object-cover shadow-md border-2 border-white`}
          onError={() => setImageError(true)}
        />
        {showOnline && user.online && (
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className} ${size} ${getColorFromId(user.id)} rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg shadow-md border-2 border-white`}>
      {getInitialFromName(user.nombre)}
      {showOnline && user.online && (
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

// Badge de rol responsivo
const RoleBadge = ({ role }) => (
  <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
    {role}
  </span>
);

// SVG Icons - tamaños responsivos
const Icons = {
  Edit: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Delete: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Send: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Add: ({ className = "w-5 h-5 md:w-6 md:h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Newest: ({ className = "w-4 h-4 md:w-5 md:h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  ScrollToBottom: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  Comments: ({ className = "w-5 h-5 md:w-6 md:h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Info: ({ className = "w-3 h-3" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

// Componente de Comentario responsivo
const CommentItem = ({ 
  comentario, 
  userAuthenticated, 
  onEdit, 
  onDelete, 
  isEditing, 
  onSaveEdit, 
  onCancelEdit,
  editText,
  onEditTextChange 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`bg-white rounded-lg md:rounded-xl p-4 md:p-5 border border-gray-200 hover:shadow-sm transition-all duration-200 group ${
        isEditing ? 'ring-1 ring-green-500' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3 md:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <UserAvatar user={comentario.usuario} showOnline={true} />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 md:gap-2 mb-2 md:mb-3">
            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {comentario.usuario.nombre}
              </h3>
              <div className="hidden xs:inline">
                <RoleBadge role={comentario.usuario.rol} />
              </div>
              {comentario.is_edited && (
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 md:px-2 py-0.5 rounded hidden sm:inline">
                  Editado
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-xs text-gray-500">
                {comentario.relativo}
              </span>
              {comentario.is_edited && (
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 md:px-2 py-0.5 rounded sm:hidden">
                  Ed.
                </span>
              )}
            </div>
          </div>

          {/* Role badge para móviles (debajo del nombre) */}
          <div className="xs:hidden mb-1">
            <RoleBadge role={comentario.usuario.rol} />
          </div>

          {/* Contenido del comentario */}
          {isEditing ? (
            <div className="mb-3 md:mb-4 space-y-2 md:space-y-3">
              <textarea
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none text-gray-700 text-sm leading-relaxed"
                rows="3"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    onSaveEdit(comentario.id);
                  }
                }}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onSaveEdit(comentario.id)}
                  disabled={!editText.trim()}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    editText.trim()
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Guardar
                </button>
              </div>
              <p className="text-xs text-gray-400 text-right">
                Ctrl + Enter para guardar rápido
              </p>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed text-sm mb-2 md:mb-3 pl-2 md:pl-3 border-l-2 border-gray-200">
              {comentario.texto}
            </p>
          )}

          {/* Acciones */}
          {userAuthenticated && comentario.canEdit && !isEditing && (
            <div className={`flex items-center justify-end pt-2 md:pt-3 border-t border-gray-100 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
            }`}>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => onEdit(comentario.id, comentario.texto)}
                  className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm"
                >
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-gray-50 rounded-md flex items-center justify-center hover:bg-green-50">
                    <Icons.Edit />
                  </div>
                  <span className="hidden sm:inline">Editar</span>
                </button>

                <button
                  onClick={() => onDelete(comentario.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-sm"
                >
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-gray-50 rounded-md flex items-center justify-center hover:bg-red-50">
                    <Icons.Delete />
                  </div>
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading spinner responsivo
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="flex justify-center items-center h-96 px-4">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
        <div>
          <h3 className="text-base md:text-lg font-medium text-gray-700">Cargando comentarios</h3>
          <p className="text-sm text-gray-500 mt-1">Por favor espera...</p>
        </div>
      </div>
    </div>
  </div>
);

// Login required state responsivo (MANTENIDO IGUAL)
const LoginRequiredState = ({ onLoginRedirect }) => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    
    <div className="container mx-auto px-4 pt-20 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-white rounded-lg md:rounded-xl p-6 md:p-8 mb-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full mb-4 w-fit">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium text-green-700">Acceso requerido</span>
              </div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Conecta con la Comunidad AGROSIG
              </h1>
              <p className="text-gray-600 mb-6 max-w-2xl">
                Únete a la conversación con profesionales del sector agrícola. Comparte experiencias, resuelve dudas y construye conocimiento colectivo.
              </p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs md:text-sm text-gray-700">Personas activos</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs md:text-sm text-gray-700">Discusiones técnicas</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Icons.Comments className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <button
                  onClick={onLoginRedirect}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm md:text-base"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Comunidad Activa</h3>
            <p className="text-gray-600 text-xs md:text-sm">Interactúa con agricultores, técnicos y expertos del sector.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Conocimiento Práctico</h3>
            <p className="text-gray-600 text-xs md:text-sm">Soluciones reales basadas en experiencias de campo.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Respuestas Rápidas</h3>
            <p className="text-gray-600 text-xs md:text-sm">Obtén ayuda de la comunidad en tiempo real.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">¿Listo para unirte?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-sm md:text-base">
              Forma parte de la mayor comunidad digital de profesionales agrícolas. 
              Comparte, aprende y crece junto a nosotros.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onLoginRedirect}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm md:text-base flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Iniciar Sesión</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/registro'}
                className="border border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-sm md:text-base flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Crear Cuenta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Empty State responsivo
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4 text-center">
    <div className="mb-4 md:mb-6">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center">
        <Icons.Comments className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
      </div>
    </div>
    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">
      ¡Sé el primero en comentar!
    </h3>
    <p className="text-gray-600 mb-4 md:mb-6 max-w-md text-sm md:text-base">
      Inicia la conversación y comparte tu experiencia con la comunidad agrícola. 
      Tu conocimiento puede ayudar a muchos profesionales.
    </p>
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-w-md">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icons.Info />
        </div>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Consejo:</span> Comparte casos reales, preguntas específicas o mejores prácticas.
        </p>
      </div>
    </div>
  </div>
);

// Floating Action Button para móviles
const FloatingActionButton = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-green-700 transition-colors z-50"
    aria-label="Nuevo comentario"
  >
    <Icons.Add />
  </button>
);

// Componente principal MODIFICADO - COMPLETAMENTE RESPONSIVO
export default function ComentariosPage() {
  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [editandoComentario, setEditandoComentario] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");
  const [sending, setSending] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const commentFormRef = useRef(null);
  const commentsContainerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    initializePage();
  }, [router]);

  const initializePage = async () => {
    try {
      const authenticated = isAuthenticated();
      setUserAuthenticated(authenticated);
      notificationService.init();

      if (authenticated) {
        await loadUserData();
        await cargarComentarios();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error inicializando página:', error);
      notificationService.showErrorNotification('Error al cargar los comentarios: ' + error.message);
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const currentUser = await getOwnProfile();
      setUserData({
        name: currentUser.first_name || "Usuario AGROSIG",
        email: currentUser.email || "usuario@agrosig.com",
        role: "Miembro AGROSIG",
        userId: currentUser.user_id || currentUser.id,
        profileImage: currentUser.image_user || currentUser.profile_image || currentUser.avatar_url || null
      });
    } catch (userError) {
      console.error('Error obteniendo datos del usuario:', userError);
      setUserAuthenticated(false);
      removeAuthTokens();
    }
  };

  const cargarComentarios = async () => {
    try {
      setLoading(true);
      const commentsData = await fetchComments();

      if (!Array.isArray(commentsData)) {
        throw new Error('Formato de datos inválido');
      }

      // Ordenar comentarios por fecha: más antiguos primero, más recientes al final
      const commentsOrdenados = [...commentsData].sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateA - dateB; // Ascendente: más antiguo primero
      });

      const comentariosFormateados = commentsOrdenados.map(comment => ({
        id: comment.comment_id,
        usuario: {
          id: comment.user_id,
          nombre: comment.first_name || 'Usuario',
          rol: "Miembro AGROSIG",
          profileImage: comment.image_user || comment.profile_image || comment.avatar_url || null,
          online: true
        },
        texto: comment.message,
        ...formatDate(comment.created_at || new Date()),
        is_edited: comment.is_edited,
        is_deleted: comment.is_deleted,
        respuestas: [],
        canEdit: userAuthenticated && userData && comment.user_id === userData.userId,
        created_at: comment.created_at
      }));

      setComentarios(comentariosFormateados);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      notificationService.showErrorNotification('Error al cargar comentarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  }, [autoScroll]);

  // Auto-scroll al fondo cuando hay nuevos comentarios
  useEffect(() => {
    if (autoScroll) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [comentarios, autoScroll, scrollToBottom]);

  // Detectar cuando el usuario hace scroll manual
  const handleScroll = useCallback(() => {
    if (commentsContainerRef.current) {
      const container = commentsContainerRef.current;
      const threshold = 100; // pixeles desde el fondo
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      
      setAutoScroll(nearBottom);
    }
  }, []);

  useEffect(() => {
    const container = commentsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleLoginRedirect = () => {
    notificationService.showInfoNotification('Por favor, inicia sesión para participar');
    router.push('/login');
  };

  const handleLogout = () => {
    notificationService.showSuccessNotification('Sesión cerrada correctamente');
    removeAuthTokens();
    setUserAuthenticated(false);
    setUserData(null);
    setComentarios([]);
  };

  const agregarComentario = async () => {
    if (!userAuthenticated) {
      handleLoginRedirect();
      return;
    }

    const commentText = nuevoComentario.trim();
    if (commentText === "") {
      notificationService.showErrorNotification('Escribe algo para comentar');
      return;
    }

    try {
      setSending(true);
      await createCommentAPI(commentText);
      setNuevoComentario("");
      setShowCommentForm(false);
      notificationService.showSuccessNotification('¡Comentario publicado!');
      await cargarComentarios();
      setAutoScroll(true);
    } catch (error) {
      console.error('Error creando comentario:', error);
      notificationService.showErrorNotification('Error al publicar: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const iniciarEdicion = (comentarioId, textoActual) => {
    setEditandoComentario(comentarioId);
    setTextoEditado(textoActual);
  };

  const cancelarEdicion = () => {
    setEditandoComentario(null);
    setTextoEditado("");
  };

  const guardarEdicion = async (comentarioId) => {
    if (!userAuthenticated) {
      handleLoginRedirect();
      return;
    }

    if (textoEditado.trim() === "") {
      notificationService.showErrorNotification('El comentario no puede estar vacío');
      return;
    }

    try {
      await updateCommentAPI(comentarioId, textoEditado);
      setEditandoComentario(null);
      setTextoEditado("");
      notificationService.showSuccessNotification('¡Comentario actualizado!');
      await cargarComentarios();
    } catch (error) {
      console.error('Error editando comentario:', error);
      notificationService.showErrorNotification('Error al actualizar: ' + error.message);
    }
  };

  const eliminarComentario = async (comentarioId) => {
    if (!userAuthenticated) {
      handleLoginRedirect();
      return;
    }

    try {
      const confirmed = await notificationService.showDeleteConfirmation();
      if (confirmed) {
        await deleteCommentAPI(comentarioId);
        notificationService.showSuccessNotification('Comentario eliminado');
        await cargarComentarios();
      }
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      notificationService.showErrorNotification('Error al eliminar: ' + error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      agregarComentario();
    }
  };

  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
    if (!showCommentForm) {
      setTimeout(() => {
        commentFormRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  if (!isClient || loading) {
    return <LoadingSpinner />;
  }

  if (!userAuthenticated) {
    return <LoginRequiredState onLoginRedirect={handleLoginRedirect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userData={userData} onLogout={handleLogout} />

      {/* Main Content - Altura responsiva */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 h-[calc(100vh-4rem)]">
          {/* Header responsivo */}
          <div className="mb-3 md:mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">Comunidad AGROSIG</h1>
                <p className="text-gray-600 text-xs md:text-sm truncate">
                  Los comentarios más recientes aparecen abajo
                </p>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                <div className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-gray-200 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs md:text-sm font-medium text-gray-700">
                      {comentarios.length} {comentarios.length === 1 ? 'comentario' : 'comentarios'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={scrollToBottom}
                    className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    title="Ir al comentario más reciente"
                  >
                    <Icons.Newest />
                    <span>Más reciente</span>
                  </button>
                  <button
                    onClick={toggleCommentForm}
                    className="md:hidden bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <Icons.Add className="w-4 h-4" />
                      <span className="text-xs">Nuevo</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-[calc(100%-3.5rem)]">
            {/* Área principal con scroll - COMENTARIOS + INPUT JUNTOS */}
            <div className="lg:flex-1 flex flex-col h-full">
              {/* Indicador de orden responsivo */}
              <div className="mb-1 md:mb-2 px-1">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs text-gray-500">
                  <Icons.Newest className="w-3 h-3" />
                  <span className="truncate">El mensaje más reciente aparece al final</span>
                </div>
              </div>

              {/* Contenedor de comentarios con scroll */}
              <div 
                ref={commentsContainerRef}
                className="flex-1 overflow-y-auto mb-3 md:mb-4 pr-1 md:pr-2"
              >
                {/* Comments List */}
                <div className="space-y-2 md:space-y-3">
                  {comentarios.length === 0 ? (
                    <EmptyState />
                  ) : (
                    comentarios.map((comentario) => (
                      <CommentItem
                        key={comentario.id}
                        comentario={comentario}
                        userAuthenticated={userAuthenticated}
                        onEdit={iniciarEdicion}
                        onDelete={eliminarComentario}
                        isEditing={editandoComentario === comentario.id}
                        onSaveEdit={guardarEdicion}
                        onCancelEdit={cancelarEdicion}
                        editText={textoEditado}
                        onEditTextChange={setTextoEditado}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Comment Form (Desktop) */}
              <div className="hidden md:block flex-shrink-0" ref={commentFormRef}>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3 md:gap-4">
                    <UserAvatar 
                      user={{
                        profileImage: userData?.profileImage,
                        nombre: userData?.name,
                        id: userData?.userId
                      }}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="mb-3">
                        <textarea
                          value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Comparte tus experiencias, preguntas técnicas, consejos agrícolas..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none text-gray-700 placeholder-gray-500 text-sm leading-relaxed"
                          rows="2"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-xs text-gray-500">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Ctrl + Enter para publicar rápido
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={scrollToBottom}
                            className="p-2 text-gray-500 hover:text-gray-700"
                            title="Ir al comentario más reciente"
                          >
                            <Icons.ScrollToBottom />
                          </button>
                          <button
                            onClick={agregarComentario}
                            disabled={!nuevoComentario.trim() || sending}
                            className={`px-3 py-2 rounded-md font-medium text-sm min-w-[100px] ${
                              nuevoComentario.trim() && !sending
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {sending ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Publicando...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Icons.Send />
                                <span>Publicar</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment Form (Mobile - Conditional) */}
              {(showCommentForm || comentarios.length === 0) && (
                <div className="md:hidden flex-shrink-0 mt-3" ref={commentFormRef}>
                  <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <UserAvatar 
                        user={{
                          profileImage: userData?.profileImage,
                          nombre: userData?.name,
                          id: userData?.userId
                        }}
                        size="w-8 h-8"
                        className="flex-shrink-0 mt-1"
                      />
                      <div className="flex-1">
                        <textarea
                          value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Escribe tu comentario..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 resize-none text-gray-700 text-sm"
                          rows="2"
                          autoFocus
                        />
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={() => setShowCommentForm(false)}
                            className="text-sm text-gray-500 hover:text-gray-700 px-2"
                          >
                            Cancelar
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={scrollToBottom}
                              className="p-2 text-gray-500 hover:text-gray-700"
                              title="Ir al comentario más reciente"
                            >
                              <Icons.ScrollToBottom className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={agregarComentario}
                              disabled={!nuevoComentario.trim() || sending}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium min-w-[80px] ${
                                nuevoComentario.trim() && !sending
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              {sending ? 'Enviando...' : 'Publicar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar (Desktop) - FIJO */}
            <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* User Card SOLAMENTE */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <UserAvatar 
                      user={{
                        profileImage: userData?.profileImage,
                        nombre: userData?.name,
                        id: userData?.userId
                      }}
                      size="w-12 h-12 md:w-14 md:h-14"
                    />
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{userData?.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{userData?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tus comentarios</span>
                      <span className="text-sm font-medium text-gray-900">
                        {comentarios.filter(c => c.canEdit).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Último comentario</span>
                      <span className="text-xs font-medium text-gray-900 truncate">
                        {comentarios.length > 0 ? comentarios[comentarios.length - 1]?.relativo : 'Ninguno'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Community Guidelines simplificado */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base">
                    Normas de la comunidad
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                      <span>Sé respetuoso</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                      <span>Comparte experiencias reales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                      <span>Evita spam</span>
                    </li>
                  </ul>
                </div>

                {/* Quick Action para ir al más reciente */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <button
                    onClick={scrollToBottom}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors text-sm"
                  >
                    <Icons.Newest className="w-4 h-4" />
                    <span>Ir al más reciente</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button para móviles */}
      <FloatingActionButton 
        onClick={toggleCommentForm} 
        disabled={sending}
      />
    </div>
  );
}