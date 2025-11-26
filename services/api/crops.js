// services/api/crops.js - CORREGIDO
import { API_URL } from './utils';
import { authenticatedFetch } from './auth';

export const getCrops = async () => {
    try {
        const response = await authenticatedFetch(`${API_URL}/crops/crops`); // Cambiado a /crops/crops

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