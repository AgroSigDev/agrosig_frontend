// services/api/comments.js - GESTIÓN DE COMENTARIOS (SOLO USO INTERNO)
import { API_URL } from './utils';
import { authenticatedFetch } from './auth';

// OBTENER COMENTARIOS
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

// CREAR COMENTARIO
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

// ACTUALIZAR COMENTARIO
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

// ELIMINAR COMENTARIO
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