// src/app/comentarios/page.jsx - VERSIÓN MEJORADA
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

// Utilidades separadas para mejor organización
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
    'bg-slate-600', 'bg-stone-600', 'bg-neutral-600', 
    'bg-zinc-600', 'bg-gray-600', 'bg-slate-700',
    'bg-stone-700', 'bg-neutral-700', 'bg-zinc-700'
  ];
  return colors[id % colors.length];
};

// Componente de Avatar reutilizable
const UserAvatar = ({ user, size = "w-12 h-12", showOnline = false }) => {
  const [imageError, setImageError] = useState(false);

  if (user.profileImage && !imageError) {
    return (
      <div className="relative">
        <img
          src={user.profileImage}
          alt={`Avatar de ${user.nombre}`}
          className={`${size} rounded-xl object-cover shadow-md border border-gray-200`}
          onError={() => setImageError(true)}
        />
        {showOnline && user.online && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${size} ${getColorFromId(user.id)} rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-md border border-gray-200`}>
      {getInitialFromName(user.nombre)}
      {showOnline && user.online && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

// Componente de Comentario individual
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
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
      {/* Header del Comentario */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <UserAvatar user={comentario.usuario} showOnline={true} />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1 flex-wrap">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {comentario.usuario.nombre}
              </h3>
              <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded font-medium border border-green-200 whitespace-nowrap">
                {comentario.usuario.rol}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 flex-wrap">
              <span className="whitespace-nowrap">{comentario.relativo}</span>
              {comentario.is_edited && (
                <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                  Editado
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
            {comentario.fecha}
          </span>
        </div>
      </div>

      {/* Contenido del Comentario */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 resize-none text-gray-700 text-sm leading-relaxed bg-white transition-all duration-200"
            rows="3"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                onSaveEdit(comentario.id);
              }
            }}
          />
          <div className="flex items-center justify-end space-x-2 mt-3">
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSaveEdit(comentario.id)}
              disabled={!editText.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                editText.trim()
                  ? 'bg-slate-700 text-white hover:bg-slate-800 shadow-sm'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Guardar
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            Ctrl + Enter para guardar rápido
          </p>
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed text-sm mb-3 bg-gray-50 rounded-lg p-4 border border-gray-100 whitespace-pre-wrap">
          {comentario.texto}
        </p>
      )}

      {/* Acciones del Comentario */}
      {userAuthenticated && comentario.canEdit && !isEditing && (
        <div className="flex items-center justify-end pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onEdit(comentario.id, comentario.texto)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <span className="font-medium text-sm">Editar</span>
            </button>

            <button
              onClick={() => onDelete(comentario.id)}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <span className="font-medium text-sm">Eliminar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Loading mejorado
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
    <Navigation />
    <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent mx-auto mb-4"></div>
        <div className="text-2xl font-semibold text-slate-700 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg">
          Cargando comentarios...
        </div>
      </div>
    </div>
  </div>
);

// Componente de Empty State
const EmptyState = ({ userAuthenticated, onLoginRedirect }) => (
  <div className="text-center py-16 h-full flex items-center justify-center">
    <div className="max-w-md">
      <div className="text-6xl mb-4 opacity-20 text-gray-400">💬</div>
      <h3 className="text-xl font-semibold text-gray-500 mb-2">
        Aún no hay comentarios
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        {userAuthenticated 
          ? "Sé el primero en iniciar una conversación y compartir tus conocimientos con la comunidad"
          : "Sé el primero en iniciar una conversación - Inicia sesión para comentar"
        }
      </p>
      {!userAuthenticated && (
        <button
          onClick={onLoginRedirect}
          className="bg-slate-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          Iniciar Sesión para Comentar
        </button>
      )}
    </div>
  </div>
);

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
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    initializePage();
  }, [router]);

  const initializePage = async () => {
    try {
      console.log('Inicializando página...');
      
      const authenticated = isAuthenticated();
      setUserAuthenticated(authenticated);
      notificationService.init();

      if (authenticated) {
        await loadUserData();
      }

      await cargarComentarios();
    } catch (error) {
      console.error('Error inicializando página:', error);
      notificationService.showErrorNotification('Error al cargar los comentarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const currentUser = await getOwnProfile();
      setUserData({
        name: currentUser.first_name || "Usuario AGROSIG",
        email: currentUser.email || "usuario@agrosig.com",
        role: "Usuario Premium",
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

      const comentariosFormateados = commentsData.map(comment => ({
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
        canEdit: userAuthenticated && userData && comment.user_id === userData.userId
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [comentarios, scrollToBottom]);

  const handleLoginRedirect = () => {
    notificationService.showInfoNotification('Por favor, inicia sesión para comentar');
    router.push('/login');
  };

  const handleLogout = () => {
    notificationService.showSuccessNotification('Has cerrado sesión correctamente. ¡Hasta pronto!');
    removeAuthTokens();
    setUserAuthenticated(false);
    setUserData(null);
    cargarComentarios();
  };

  const agregarComentario = async () => {
    if (!userAuthenticated) {
      handleLoginRedirect();
      return;
    }

    if (nuevoComentario.trim() === "") {
      notificationService.showErrorNotification('El comentario no puede estar vacío');
      return;
    }

    try {
      setSending(true);
      await createCommentAPI(nuevoComentario);
      setNuevoComentario("");
      notificationService.showSuccessNotification('¡Tu comentario ha sido publicado!');
      await cargarComentarios();
    } catch (error) {
      console.error('Error creando comentario:', error);
      notificationService.showErrorNotification('Error al publicar el comentario: ' + error.message);
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
      notificationService.showErrorNotification('Error al actualizar el comentario: ' + error.message);
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
      notificationService.showErrorNotification('Error al eliminar el comentario: ' + error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      agregarComentario();
    }
  };

  if (!isClient || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <Navigation userData={userData} onLogout={handleLogout} />

      {/* Tarjeta Principal */}
      <div className="mt-16 bg-white p-2 shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm min-h-[85vh] flex flex-col">
        
        {/* Header con gradiente profesional */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Comentarios de la Comunidad</h2>
                <p className="text-green-100 text-sm">
                  {userAuthenticated 
                    ? "Comparte y conecta con profesionales del sector" 
                    : "Conecta con profesionales del sector - Inicia sesión para comentar"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-white text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                {comentarios.length} comentarios
              </div>
              {!userAuthenticated && (
                <button
                  onClick={handleLoginRedirect}
                  className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Área de Contenido Principal */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Lista de Comentarios - Área Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {comentarios.length === 0 ? (
              <EmptyState 
                userAuthenticated={userAuthenticated} 
                onLoginRedirect={handleLoginRedirect} 
              />
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {comentarios.map((comentario) => (
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
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Formulario de Nuevo Comentario */}
          {userAuthenticated ? (
            <div className="p-6 border-t border-gray-200 bg-gradient-to-br from-white to-gray-50/50 flex-shrink-0">
              <div className="flex items-start space-x-4 max-w-4xl mx-auto">
                <div className="flex-shrink-0">
                  <UserAvatar 
                    user={{
                      profileImage: userData?.profileImage,
                      nombre: userData?.name,
                      id: userData?.userId
                    }} 
                  />
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Añadir un comentario
                    </label>
                    <textarea
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Comparte tus experiencias, preguntas o conocimientos con la comunidad agrícola..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-gray-700 placeholder-gray-500 text-base leading-relaxed transition-all duration-200 hover:border-gray-400 bg-white shadow-sm"
                      rows="3"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                        Ctrl + Enter para publicar
                      </span>
                    </div>

                    <button
                      onClick={agregarComentario}
                      disabled={!nuevoComentario.trim() || sending}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                        nuevoComentario.trim() && !sending
                          ? 'bg-green-700 text-white hover:bg-green-800 hover:shadow-md'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {sending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Publicando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                          </svg>
                          <span>Publicar comentario</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border-t border-gray-200 bg-gradient-to-br from-white to-gray-50/50 flex-shrink-0">
              <div className="text-center py-4 max-w-4xl mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-blue-800 font-medium">
                        Inicia sesión para comentar
                      </p>
                      <p className="text-blue-600 text-sm">
                        Únete a la conversación y comparte tus experiencias
                      </p>
                    </div>
                    <button
                      onClick={handleLoginRedirect}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}