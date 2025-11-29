// services/api/crops.js - SOLO PARA OBTENER CROPS
import { API_URL } from './utils';
import { authenticatedFetch } from './auth';

export const getCrops = async (page = 1, limit = 10) => {
    try {
        const response = await authenticatedFetch(`${API_URL}/crop/crops?page=${page}&limit=${limit}`);

        if (!response.ok) {
            throw new Error('Error al obtener cultivos');
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error obteniendo cultivos:', error);
        throw error;
    }
}