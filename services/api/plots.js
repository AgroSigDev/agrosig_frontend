import { API_URL, fetchConfig } from './utils';
import { authenticatedFetch, getAuthToken, getCurrentUser } from './auth';

// services/api/plots.js - PLOTS (SOLO USO INTERNO)

export const getPlot = async () => {
    try {
        const response = await authenticatedFetch(`${API_URL}/plots/plots`);
        console.log('📡 [PLOTS API] Response status:', response.status);

        if (!response.ok) {
            throw new Error('Erro al obtener parcelas');
        }

        const data = await response.json();
        console.log('✅ [PLOTS API] Datos recibidos:', data);
        
        // Asegurarnos de devolver un array
        const plotsData = data.data || data || [];
        console.log('📊 [PLOTS API] Total de parcelas:', plotsData.length);
        
        return plotsData;
    } catch (error) {
        console.error('🚨 [PLOTS API] Error obteniendo plots:', error);
        throw error;
    }
}