"use client";
import { useState, useEffect } from "react";
import { removeAuthTokens, checkAuthStatus, getOwnProfile, getAuthToken, getUsers, getCrops, getPlot } from "../../../services/api/index";
import { useRouter } from 'next/navigation';
import notificationService from "../../utils/notifications";
import Navigation from "../../components/Navigation";
import Image from 'next/image';

// Utilidades mejoradas
const getInitialFromName = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

const getColorFromId = (id) => {
  const colors = [
    'bg-gradient-to-br from-green-500 to-emerald-600',
    'bg-gradient-to-br from-blue-500 to-cyan-600',
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-red-500 to-pink-600',
    'bg-gradient-to-br from-yellow-500 to-orange-600',
    'bg-gradient-to-br from-indigo-500 to-purple-600'
  ];
  return colors[id % colors.length] || 'bg-gradient-to-br from-gray-500 to-gray-600';
};

// SVG Icons - Agregar iconos administrativos
const Icons = {
  Robot: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Analytics: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Database: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Map: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Weather: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  Money: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Productivity: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Savings: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Sustainability: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Decisions: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Leaf: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  ),
  UserCheck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  UserX: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12l-4 4m4-4l-4-4" />
    </svg>
  ),
  Farm: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Crop: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  )
};

// Componente de Loading mejorado
const LoadingSpinner = ({ message = "Cargando..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
    <Navigation />
    <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-emerald-600 rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg">
          {message}
        </div>
      </div>
    </div>
  </div>
);

// Componente de Error
const ErrorDisplay = ({ message, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
    <Navigation />
    <div className="flex justify-center items-center h-96">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-4">
          <Icons.Warning />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  </div>
);

// COMPONENTES REUTILIZABLES PARA ESTADÍSTICAS DE USUARIOS
const UserStatsCard = ({ title, value, description, icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl font-black text-gray-800">{value}</div>
        <div className="text-gray-600 text-sm">{title}</div>
        {description && (
          <div className="text-gray-500 text-xs mt-1">{description}</div>
        )}
        {trend && (
          <div className={`text-xs font-medium mt-2 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
            {trend.value} {trend.direction === 'up' ? '↗' : '↘'} {trend.label}
          </div>
        )}
      </div>
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white`}>
        {icon}
      </div>
    </div>
  </div>
);

const UserStatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((stat, index) => (
      <UserStatsCard
        key={index}
        title={stat.label}
        value={stat.value}
        description={stat.description}
        icon={<stat.icon />}
        color={stat.color}
        trend={stat.trend}
      />
    ))}
  </div>
);

// Componente para mostrar parcelas - CORREGIDO con campos reales del backend
const PlotCard = ({ plot }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-bold text-gray-800 text-lg mb-1">{plot.plot_name}</h3>
        <p className="text-gray-600 text-sm">{plot.location}</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${plot.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
        {plot.is_active ? 'Activa' : 'Inactiva'}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <div className="text-gray-500 text-xs">Área</div>
        <div className="font-semibold text-gray-800">{plot.area} ha</div>
      </div>
      <div>
        <div className="text-gray-500 text-xs">Coordenadas</div>
        <div className="font-semibold text-gray-800 text-xs">
          {plot.lat?.toFixed(4)}, {plot.lng?.toFixed(4)}
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between text-sm text-gray-600">
      <div className="flex items-center space-x-1">
        <Icons.Calendar className="w-4 h-4" />
        <span>
          {new Date(plot.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      </div>
      <div className="text-xs text-gray-500">
        Por: {plot.first_name} {plot.paternal_surname}
      </div>
    </div>

    {/* Información adicional */}
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="text-xs text-gray-500">
        ID: {plot.plot_id} • User: {plot.user_id}
      </div>
    </div>
  </div>
);

// Componente para mostrar crops en tabla
const CropsTable = ({ crops, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Cultivos Recientes</h3>

      {crops.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay cultivos registrados
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha Siembra</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Área</th>
              </tr>
            </thead>
            <tbody>
              {crops.slice(0, 5).map((crop) => (
                <tr key={crop.crop_id || crop.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{crop.crop_type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {crop.planting_date || 'No especificada'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${crop.status === 'active' ? 'bg-green-100 text-green-800' :
                      crop.status === 'harvested' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {crop.status === 'active' ? 'Activo' :
                        crop.status === 'harvested' ? 'Cosechado' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {crop.area ? `${crop.area} ha` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// FUNCIÓN PARA DETECTAR ADMIN - Misma lógica que en Navigation
const isAdminUser = (userData) => {
  if (!userData) {
    console.log("[DASHBOARD] userData no disponible");
    return false;
  }

  console.log("[DASHBOARD] Verificando admin para:", userData.email);

  // MÉTODO 1: Verificar role_id en userData (si el backend lo incluye)
  if (userData.role_id !== undefined && userData.role_id !== null) {
    console.log("[DASHBOARD] role_id en userData:", userData.role_id, "Tipo:", typeof userData.role_id);

    // Convertir a número y verificar
    const roleId = Number(userData.role_id);
    if (roleId === 1) {
      console.log("[DASHBOARD] ADMIN detectado por role_id en userData");
      return true;
    }

    // También verificar como string
    if (userData.role_id === "1") {
      console.log("[DASHBOARD] ADMIN detectado por role_id (string) en userData");
      return true;
    }
  }

  // MÉTODO 2: Verificar role_id en el token JWT
  try {
    const token = getAuthToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("[DASHBOARD] Payload del token:", payload);

      if (payload.role_id === 1 || payload.role_id === "1") {
        console.log("[DASHBOARD] ADMIN detectado por role_id en token JWT");
        return true;
      }
    }
  } catch (error) {
    console.log("[DASHBOARD] Error decodificando token:", error);
  }

  // MÉTODO 3: Fallback por email específico
  const adminEmails = [
    'ga78goher@gmail.com',
    'ga78gober@gmail.com',
    'gabriel@gmail.com',
    'admin@agrotec.com'
  ];

  const userEmail = userData.email?.toLowerCase().trim() || '';
  console.log("[DASHBOARD] Email del usuario:", userEmail);

  if (adminEmails.includes(userEmail)) {
    console.log("[DASHBOARD] ADMIN detectado por email específico");
    return true;
  }

  console.log("[DASHBOARD] USUARIO NORMAL");
  console.log("[DASHBOARD] userData para debug:", {
    email: userData.email,
    role_id: userData.role_id,
    has_role_id: 'role_id' in userData,
    all_fields: Object.keys(userData)
  });

  return false;
};

// COMPONENTE DE DASHBOARD ADMINISTRATIVO MEJORADO
const AdminDashboard = ({ userData, onLogout }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalPlots: 0,
    activePlots: 0,
    totalCrops: 0,
    activeCrops: 0
  });

  const [recentPlots, setRecentPlots] = useState([]);
  const [crops, setCrops] = useState([]);
  const [plots, setPlots] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [plotsLoading, setPlotsLoading] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'users', 'plots', 'crops', null

  // Cargar datos de usuarios
  const loadUsersData = async () => {
    try {
      console.log('👥 Cargando datos de usuarios...');
      const users = await getUsers();
      console.log('✅ Usuarios cargados:', users);
      setUsersData(users || []);
      return users || [];
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      setUsersData([]);
      return [];
    }
  };

  // Funciones para cargar crops y plots
  const loadCropsData = async () => {
    try {
      setCropsLoading(true);
      console.log('🌱 Cargando datos de cultivos...');
      const cropsData = await getCrops(1, 10);
      console.log('✅ Cultivos cargados:', cropsData);

      if (cropsData && cropsData.crops) {
        setCrops(cropsData.crops);
        return cropsData.crops;
      } else {
        setCrops(cropsData || []);
        return cropsData || [];
      }
    } catch (error) {
      console.error('❌ Error cargando cultivos:', error);
      notificationService.showErrorNotification('Error al cargar los cultivos');
      setCrops([]);
      return [];
    } finally {
      setCropsLoading(false);
    }
  };

  const loadPlotsData = async () => {
    try {
      setPlotsLoading(true);
      console.log('🗺️ Cargando datos de parcelas...');
      const plotsData = await getPlot();
      console.log('✅ Parcelas cargadas:', plotsData);

      const plotsArray = Array.isArray(plotsData) ? plotsData : [];
      setPlots(plotsArray);
      setRecentPlots(plotsArray.slice(-4).reverse());
      return plotsArray;
    } catch (error) {
      console.error('❌ Error cargando parcelas:', error);
      notificationService.showErrorNotification('Error al cargar las parcelas');
      setPlots([]);
      setRecentPlots([]);
      return [];
    } finally {
      setPlotsLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Iniciando carga de datos administrativos...');

      const [users, cropsData, plotsData] = await Promise.all([
        loadUsersData(),
        loadCropsData(),
        loadPlotsData()
      ]);

      console.log('📊 Datos cargados:', {
        users: users.length,
        crops: cropsData.length,
        plots: plotsData.length
      });

      // Calcular estadísticas
      const totalPlots = plotsData.length;
      const activePlots = plotsData.filter(plot => plot.is_active === true || plot.is_active === 1).length;
      const totalCrops = cropsData.length;
      const activeCrops = cropsData.filter(crop => crop.is_active === true || crop.is_active === 1).length;
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.is_active === true || user.is_active === 1).length;
      const inactiveUsers = users.filter(user => user.is_active === false || user.is_active === 0).length;

      setStats({
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        inactiveUsers: inactiveUsers,
        totalPlots: totalPlots,
        activePlots: activePlots,
        totalCrops: totalCrops,
        activeCrops: activeCrops
      });

      // Configurar acciones rápidas ACTUALIZADAS
      setQuickActions([
        {
          id: 1,
          title: "Total de Usuarios",
          description: "Usuarios registrados en el sistema",
          icon: Icons.Users,
          color: "from-blue-500 to-cyan-600",
          action: () => handleUsersManagement(),
          badge: totalUsers
        },
        {
          id: 2,
          title: "Total de Parcelas",
          description: "Parcelas registradas en el sistema",
          icon: Icons.Farm,
          color: "from-green-500 to-emerald-600",
          action: () => handlePlotsManagement(),
          badge: totalPlots
        },
        {
          id: 3,
          title: "Total de Cultivos",
          description: "Cultivos registrados en el sistema",
          icon: Icons.Crop,
          color: "from-purple-500 to-indigo-600",
          action: () => handleCropsManagement(),
          badge: totalCrops
        }
      ]);

      console.log('🎯 Dashboard administrativo cargado exitosamente');
    } catch (error) {
      console.error('❌ Error cargando datos administrativos:', error);
      notificationService.showErrorNotification('Error al cargar los datos administrativos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // FUNCIONES PARA ACCIONES RÁPIDAS
  const handleUsersManagement = () => {
    console.log('👥 Abriendo visualización de usuarios');
    setActiveModal('users');
    notificationService.showInfoNotification('Visualización de usuarios abierta');
  };

  const handlePlotsManagement = () => {
    console.log('🗺️ Abriendo visualización de parcelas');
    setActiveModal('plots');
    notificationService.showInfoNotification('Visualización de parcelas abierta');
  };

  const handleCropsManagement = () => {
    console.log('🌱 Abriendo visualización de cultivos');
    setActiveModal('crops');
    notificationService.showInfoNotification('Visualización de cultivos abierta');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Estadísticas de usuarios REALES para el dashboard administrativo - ACTUALIZADO
  const userStats = [
    {
      label: 'Usuarios Totales',
      value: stats.totalUsers,
      description: 'Registrados en el sistema',
      icon: Icons.Users,
      color: 'from-blue-500 to-cyan-600',
      trend: { value: '+12%', direction: 'up', label: 'este mes' }
    },
    {
      label: 'Usuarios Activos',
      value: stats.activeUsers,
      description: 'Conectados recientemente',
      icon: Icons.UserCheck,
      color: 'from-green-500 to-emerald-600',
      trend: { value: '+8%', direction: 'up', label: 'esta semana' }
    },
    {
      label: 'Parcelas Totales',
      value: stats.totalPlots,
      description: 'Parcelas registradas',
      icon: Icons.Farm,
      color: 'from-purple-500 to-indigo-600',
      trend: { value: '+15%', direction: 'up', label: 'este mes' }
    },
    {
      label: 'Cultivos Totales',
      value: stats.totalCrops,
      description: 'Total de cultivos registrados',
      icon: Icons.Crop,
      color: 'from-orange-500 to-amber-600',
      trend: { value: '+20%', direction: 'up', label: 'este mes' }
    }
  ];

  // Componente para mostrar crops en tabla - ACTUALIZADO según la estructura de la BD
  const CropsTable = ({ crops, loading }) => {
    if (loading) {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Cultivos Recientes</h3>

        {crops.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay cultivos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Variedad</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha Siembra</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha Cosecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Costo Total</th>
                </tr>
              </thead>
              <tbody>
                {crops.slice(0, 5).map((crop) => (
                  <tr key={crop.crop_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{crop.crop_type}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {crop.crop_variety || 'No especificada'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {crop.planting_date ? new Date(crop.planting_date).toLocaleDateString('es-ES') : 'No especificada'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {crop.harvest_date ? new Date(crop.harvest_date).toLocaleDateString('es-ES') : 'No cosechado'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        crop.is_active === true || crop.is_active === 1 ? 'bg-green-100 text-green-800' : 
                        crop.harvest_date ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {crop.is_active === true || crop.is_active === 1 ? 'Activo' : 
                         crop.harvest_date ? 'Cosechado' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {crop.cost_total ? `$${parseFloat(crop.cost_total).toFixed(2)}` : '$0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Contenido de las pestañas (solo Resumen)
  const renderTabContent = () => {
    return (
      <div className="space-y-8">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <UserStatsCard
              key={index}
              title={stat.label}
              value={stat.value}
              description={stat.description}
              icon={<stat.icon />}
              color={stat.color}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Grid de Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cultivos Recientes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Cultivos Recientes</h3>
              <span className="text-gray-500 text-sm">
                Total: {stats.totalCrops}
              </span>
            </div>
            <CropsTable crops={crops.slice(0, 3)} loading={cropsLoading} />
          </div>

          {/* Parcelas Recientes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Parcelas Recientes</h3>
              <span className="text-gray-500 text-sm">
                Total: {stats.totalPlots}
              </span>
            </div>
            <div className="space-y-4">
              {recentPlots.slice(0, 3).map((plot) => (
                <div key={plot.plot_id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <Icons.Farm className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm">{plot.plot_name}</h4>
                    <p className="text-gray-500 text-xs">{plot.location}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    plot.is_active ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // MODAL DE VISUALIZACIÓN DE USUARIOS
  const UsersManagementModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Total de Usuarios</h2>
            <p className="text-gray-600">Usuarios registrados en el sistema: {usersData.length}</p>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icons.UserX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user) => (
                  <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div>
                        <div className="font-medium">{user.first_name} {user.paternal_surname}</div>
                        <div className="text-gray-500 text-xs">ID: {user.user_id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Total: {usersData.length} usuarios
          </div>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // MODAL DE VISUALIZACIÓN DE PARCELAS
  const PlotsManagementModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Total de Parcelas</h2>
            <p className="text-gray-600">Parcelas registradas en el sistema: {plots.length}</p>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icons.UserX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plots.map((plot) => (
              <div key={plot.plot_id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{plot.plot_name}</h3>
                    <p className="text-gray-600 text-sm">{plot.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plot.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plot.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <div className="text-gray-500">Área</div>
                    <div className="font-medium">{plot.area} ha</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Usuario</div>
                    <div className="font-medium text-xs">
                      {plot.first_name} {plot.paternal_surname}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  ID: {plot.plot_id} • Creado: {plot.created_at ? new Date(plot.created_at).toLocaleDateString('es-ES') : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Total: {plots.length} parcelas
          </div>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // MODAL DE VISUALIZACIÓN DE CULTIVOS
  const CropsManagementModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Total de Cultivos</h2>
            <p className="text-gray-600">Cultivos registrados en el sistema: {crops.length}</p>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icons.UserX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <CropsTable crops={crops} loading={cropsLoading} />
        </div>
        
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Total: {crops.length} cultivos
          </div>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <Navigation userData={userData} onLogout={onLogout} />
        <div className="pt-24 flex justify-center items-center h-96">
          <LoadingSpinner message="Cargando datos administrativos..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navigation userData={userData} onLogout={onLogout} />

      {/* Header Administrativo Mejorado */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Icons.Shield />
                </div>
                <div>
                  <h1 className="text-3xl font-black">Panel Administrativo</h1>
                  <p className="text-indigo-100">Bienvenido, {userData?.name}</p>
                </div>
              </div>
              <p className="text-indigo-200 max-w-2xl">
                Gestiona y supervisa toda la plataforma AGROSIG desde un solo lugar
              </p>
            </div>
            {/* SE ELIMINÓ EL WIDGET DE SALUD DEL SISTEMA */}
          </div>

          {/* Navegación por Pestañas - SOLO RESUMEN */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              className="flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 bg-white text-indigo-700 shadow-lg border border-indigo-100"
            >
              <Icons.Analytics className="w-5 h-5" />
              <span>Resumen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal Mejorado */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Barra Lateral con Acciones Rápidas ACTUALIZADAS */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <h2 className="text-xl font-black text-gray-800 mb-4">Acciones Rápidas</h2>
              <div className="space-y-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-left group hover:scale-105 w-full"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <action.icon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{action.title}</h3>
                          {action.badge && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                              {action.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* WIDGET DE ESTADÍSTICAS (SOLO LAS ESTADÍSTICAS, SIN SALUD DEL SISTEMA) */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-3">Estadísticas del Sistema</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center">
                        <Icons.UserCheck className="w-4 h-4" />
                      </div>
                      <span className="text-indigo-100 text-sm">Usuarios Activos</span>
                    </div>
                    <span className="font-bold text-lg">{stats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
                        <Icons.Farm className="w-4 h-4" />
                      </div>
                      <span className="text-indigo-100 text-sm">Parcelas Activas</span>
                    </div>
                    <span className="font-bold text-lg">{stats.activePlots}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center">
                        <Icons.Crop className="w-4 h-4" />
                      </div>
                      <span className="text-indigo-100 text-sm">Cultivos Totales</span>
                    </div>
                    <span className="font-bold text-lg">{stats.totalCrops}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </section>

      {/* MODALES */}
      {activeModal === 'users' && <UsersManagementModal />}
      {activeModal === 'plots' && <PlotsManagementModal />}
      {activeModal === 'crops' && <CropsManagementModal />}
    </div>
  );
};

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    initializePage();
  }, [router]);

  const initializePage = async () => {
    try {
      console.log('🔄 Inicializando página de dashboard...');
      setError(null);
      setLoading(true);

      const status = checkAuthStatus();

      if (status.isAuthenticated) {
        console.log('🔐 Usuario autenticado, cargando datos...');
        notificationService.init();

        try {
          const currentUser = await getOwnProfile();
          console.log('✅ Datos del usuario cargados:', currentUser);

          const userDataObj = {
            name: currentUser.first_name || "Usuario AGROSIG",
            email: currentUser.email || "usuario@agrosig.com",
            role: currentUser.role || "Usuario",
            userId: currentUser.user_id || currentUser.id,
            profileImage: currentUser.image_user || currentUser.profile_image || currentUser.avatar_url || null,
            role_id: currentUser.role_id,
            user_type: currentUser.user_type,
            tipo_usuario: currentUser.tipo_usuario
          };

          setUserData(userDataObj);

          const userIsAdmin = isAdminUser(userDataObj);
          setIsAdmin(userIsAdmin);

          if (userIsAdmin) {
            console.log('👑 Usuario identificado como administrador');
            notificationService.showSuccessNotification('Bienvenido al Panel Administrativo');
            // NOTA: Los crops y plots se cargan DENTRO del componente AdminDashboard
          } else {
            console.log('👤 Usuario identificado como usuario normal');
            // Usuario normal NO carga crops ni plots
          }

        } catch (userError) {
          console.warn('⚠️ No se pudieron cargar datos del usuario:', userError);
        }
      } else {
        console.log('👤 Usuario no autenticado, mostrando dashboard público');
        setIsAdmin(false);
      }

      await cargarUsuarios();

    } catch (error) {
      console.error('❌ Error inicializando página:', error);
      setError(error.message || 'Error al cargar el dashboard');

      if (checkAuthStatus().isAuthenticated) {
        notificationService.showErrorNotification('Error al cargar los datos: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const usuariosIniciales = [];
      setUsuarios(usuariosIniciales);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      throw new Error('No se pudieron cargar los usuarios');
    }
  };

  const handleLogout = () => {
    notificationService.showSuccessNotification('Has cerrado sesión correctamente. ¡Hasta pronto!');
    removeAuthTokens();
    setUserData(null);
    setIsAdmin(false);
    initializePage();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleDownload = () => {
    const apkUrl = 'apk/agrosig_aplication.apk';
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'Agrosig.apk';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notificationService.showSuccessNotification('Descargando AGROSIG App para Android...');
  };

  const handleRegister = () => {
    router.push('/registro');
  };

  const handleComingSoon = (pageName) => {
    notificationService.showInfoNotification(`¡${pageName} estará disponible pronto!`);
  };

  // Array de funcionalidades mejorado con SVG
  const features = [
    {
      icon: Icons.Robot,
      title: "Asistente IA & Chatbot",
      description: "Asistente inteligente que responde tus dudas agrícolas 24/7 y ofrece recomendaciones personalizadas",
      capabilities: ["Diagnóstico de plagas", "Recomendaciones de cultivo", "Soporte instantáneo"],
      gradient: "from-purple-500 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50"
    },
    {
      icon: Icons.Map,
      title: "Gestión de Parcelas",
      description: "Registra y organiza todas tus parcelas con mapas interactivos y límites georreferenciados",
      capabilities: ["Mapas digitales", "Geolocalización", "Historial de cultivos"],
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      icon: Icons.Chart,
      title: "Reportes Avanzados",
      description: "Genera reportes detallados de rendimiento, costos y productividad con análisis inteligente",
      capabilities: ["Dashboard interactivo", "Métricas en tiempo real", "Exportación de datos"],
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: Icons.Calendar,
      title: "Registro de Actividades",
      description: "Lleva un control completo de todas las actividades agrícolas desde siembra hasta cosecha",
      capabilities: ["Calendario integrado", "Recordatorios automáticos", "Seguimiento de tareas"],
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50"
    },
    {
      icon: Icons.Weather,
      title: "API Meteorológica",
      description: "Pronósticos del tiempo precisos y alertas climáticas para optimizar tus decisiones",
      capabilities: ["Pronóstico 7 días", "Alertas de heladas", "Datos históricos"],
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50"
    },
    {
      icon: Icons.Money,
      title: "Gestión de Costos",
      description: "Controla y optimiza tus gastos con análisis detallados de costos y rentabilidad",
      capabilities: ["Análisis de ROI", "Control de inventarios", "Presupuestos"],
      gradient: "from-yellow-500 to-amber-600",
      bgGradient: "from-yellow-50 to-amber-50"
    }
  ];

  // Estadísticas para mostrar
  const stats = [
    { value: "10K+", label: "Agricultores activos" },
    { value: "50K+", label: "Hectáreas gestionadas" },
    { value: "99%", label: "Satisfacción del usuario" },
    { value: "24/7", label: "Soporte disponible" }
  ];

  // Beneficios con SVG
  const benefits = [
    {
      icon: Icons.Productivity,
      title: "Mayor Productividad",
      description: "Optimiza tus procesos agrícolas y aumenta el rendimiento de tus cultivos"
    },
    {
      icon: Icons.Savings,
      title: "Ahorro de Recursos",
      description: "Reduce costos en agua, fertilizantes y control de plagas"
    },
    {
      icon: Icons.Sustainability,
      title: "Agricultura Sostenible",
      description: "Practica una agricultura más responsable con el medio ambiente"
    },
    {
      icon: Icons.Decisions,
      title: "Decisiónes Inteligentes",
      description: "Toma mejores decisiones basadas en datos en tiempo real"
    }
  ];

  // Si es administrador y está logueado, mostrar dashboard administrativo
  if (isAdmin && userData) {
    return <AdminDashboard
      userData={userData}
      onLogout={handleLogout}
    />;
  }

  if (!isClient) {
    return <LoadingSpinner message="Inicializando..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={initializePage} />;
  }

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  // DASHBOARD PÚBLICO (para usuarios normales y no autenticados)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <Navigation
        userData={userData}
        onLogout={handleLogout}
        onLogin={handleLogin}
      />

      {/* Hero Section - Dashboard Público */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-700 to-green-800 text-white pt-16 pb-16 lg:pt-24 lg:pb-28 overflow-hidden px-4 sm:px-6">
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-emerald-400/20 rounded-full animate-bounce"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
            {/* Contenido principal */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                <span className="text-sm font-medium">Plataforma Agrícola Inteligente</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Tu campo en
                <span className="block bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  tu móvil
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-95 leading-relaxed max-w-2xl">
                Controla tu agricultura desde cualquier lugar con la
                <span className="font-semibold text-white"> app AGROSIG</span>.
                Monitorea, gestiona y optimiza en tiempo real.
              </p>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6 mb-6 sm:mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-green-200 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={handleDownload}
                  className="bg-white text-gray-800 px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-3 sm:space-x-4 group w-full sm:w-auto sm:max-w-md mx-auto lg:mx-0"
                >
                  <div className="text-left">
                    <div className="text-sm opacity-70">Disponible ahora</div>
                    <div className="font-black text-xl">DESCARGAR APP</div>
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>

                {!userData && (
                  <button
                    onClick={handleLogin}
                    className="border-2 border-white text-white px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-white hover:text-green-800 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-3 sm:space-x-4 group w-full sm:w-auto sm:max-w-md mx-auto lg:mx-0"
                  >
                    <div className="text-left">
                      <div className="text-sm opacity-90">¿Ya tienes cuenta?</div>
                      <div className="font-black text-xl">INICIAR SESIÓN</div>
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                )}
              </div>
            </div>

            {/* MOCKUP DEL TELÉFONO */}
            <div className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative">
                <div className="relative w-56 h-[500px] sm:w-64 sm:h-[560px] lg:w-72 lg:h-[600px] mt-4 sm:mt-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 rounded-[2.5rem] shadow-2xl"></div>

                  {/* Teléfono */}
                  <div className="absolute inset-[8px] bg-gray-900 rounded-[2rem] shadow-inner overflow-hidden z-10">
                    <Image
                      src="/phone-mockup.png"
                      alt="AGROSIG App en móvil"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Marco exterior */}
                  <div className="absolute inset-0 border-[3px] border-white/10 rounded-[2.5rem] pointer-events-none z-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Funcionalidades Mejorada */}
      <section className="py-12 sm:py-20 bg-white px-4 sm:px-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-800 mb-4">
              Funcionalidades
              <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent"> Potentes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre todas las herramientas que AGROSIG pone a tu disposición para revolucionar tu agricultura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-green-50 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-green-100/50 hover:border-green-300/50 hover:scale-105"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-16 h-10 bg-transparent rounded-full flex items-center justify-center text-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {feature.capabilities.map((capability, capIndex) => (
                    <div key={capIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Beneficios Mejorada */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-green-50 to-emerald-100 px-4 sm:px-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-800 mb-4">
              Beneficios de usar
              <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent"> AGROSIG</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre cómo nuestra aplicación puede transformar tu forma de trabajar el campo
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-green-100 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección CTA Final Mejorada */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 sm:px-6">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
            ¿Listo para transformar tu agricultura?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-95 max-w-2xl mx-auto">
            Descarga AGROSIG y lleva el control total de tus cultivos a cualquier lugar
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="bg-white text-green-800 px-8 sm:px-16 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-2xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-3 sm:space-x-4 w-full sm:w-auto"
            >
              <div className="text-left">
                <div className="text-sm opacity-70">Descargar ahora</div>
                <div className="font-black">OBTENER LA APP</div>
              </div>
              <span className="text-2xl">↓</span>
            </button>

            {!userData && (
              <button
                onClick={handleRegister}
                className="border-2 border-white text-white px-8 sm:px-16 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-2xl hover:bg-white hover:text-green-800 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-3 sm:space-x-4 w-full sm:w-auto"
              >
                <div className="text-left">
                  <div className="text-sm opacity-90">¿Nuevo usuario?</div>
                  <div className="font-black">REGISTRARSE</div>
                </div>
                <span className="text-2xl">→</span>
              </button>
            )}
          </div>

          {/* Garantía */}
          <div className="mt-12 flex items-center justify-center space-x-4 text-green-100">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Icons.Check />
            </div>
            <span className="text-lg">Garantía de satisfacción 100%</span>
          </div>
        </div>
      </section>

      {/* Footer Mejorado */}
      <footer className="bg-gradient-to-br from-green-900 via-emerald-900 to-green-950 text-white pt-12 sm:pt-16 pb-8 px-4 sm:px-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 sm:mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Icons.Leaf />
                </div>
                <span className="text-xl sm:text-2xl font-black">AGROSIG APP</span>
              </div>
              <p className="text-green-200 text-base sm:text-lg leading-relaxed max-w-md">
                La aplicación móvil que está revolucionando la agricultura moderna.
                Descarga y únete a la comunidad de agricultores inteligentes.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Navegación</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-green-200">
                <li>
                  <button
                    onClick={() => handleComingSoon('Inicio')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleComingSoon('Nosotros')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Nosotros
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleComingSoon('Comentarios')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Comentarios
                  </button>
                </li>
                {userData && (
                  <li>
                    <button
                      onClick={() => handleComingSoon('Administrar Usuarios')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Administrar Usuarios
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-green-800 pt-6 sm:pt-8 text-center">
            <p className="text-green-300 text-sm sm:text-base">
              © 2024 AGROSIG App. Transformando la agricultura desde tu móvil.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 