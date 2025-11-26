import { API_URL, fetchConfig } from './utils';
import { authenticatedFetch, getAuthToken, getCurrentUser } from './auth';

// services/api/plots.js - PLOTS (SOLO USO INTERNO)


export const getPlot = async () => {
    try {
        const response = await authenticatedFetch(`${API_URL}/plots`);

        if (!response.ok) {
            throw new Error('Error al obtener plots');
        }

        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error obteniendo plots:', error);
        throw error;
    }
}

