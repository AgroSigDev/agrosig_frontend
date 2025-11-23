"use client";
import { useState, useEffect } from "react";
import { removeAuthTokens, checkAuthStatus, getOwnProfile } from "../../../services/api/index";
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

// SVG Icons
const Icons = {
  Robot: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
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

// Componente de Avatar mejorado
const UserAvatar = ({ user, size = "w-12 h-12", className = "" }) => {
  if (user?.profileImage) {
    return (
      <div className={`${size} ${className} relative`}>
        <img
          src={user.profileImage}
          alt={`Avatar de ${user.name}`}
          className="w-full h-full rounded-xl object-cover shadow-lg border-2 border-white"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className={`absolute inset-0 ${getColorFromId(user.userId || 0)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white hidden`}>
          {getInitialFromName(user.name)}
        </div>
      </div>
    );
  }

  return (
    <div className={`${size} ${className} ${getColorFromId(user?.userId || 0)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white`}>
      {getInitialFromName(user?.name)}
    </div>
  );
};

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

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

          setUserData({
            name: currentUser.first_name || "Administrador AGROSIG",
            email: currentUser.email || "admin@agrosig.com",
            role: "Administrador",
            userId: currentUser.user_id || currentUser.id,
            profileImage: currentUser.image_user || currentUser.profile_image || currentUser.avatar_url || null
          });
        } catch (userError) {
          console.warn('⚠️ No se pudieron cargar datos del usuario:', userError);
        }
      } else {
        console.log('👤 Usuario no autenticado, mostrando dashboard público');
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
    initializePage();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleDownload = () => {
    notificationService.showSuccessNotification('Redirigiendo a la tienda de aplicaciones...');
    window.open('https://play.google.com/store/apps/details?id=com.agrosig', '_blank');
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

  if (!isClient) {
    return <LoadingSpinner message="Inicializando..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={initializePage} />;
  }

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <Navigation
        userData={userData}
        onLogout={handleLogout}
        onLogin={handleLogin}
      />

      {/* Hero Section Mejorada */}
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

            {/* MOCKUP DEL TELÉFONO ORIGINAL - CONSERVADO TAL CUAL */}
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
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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