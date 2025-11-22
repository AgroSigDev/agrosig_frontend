"use client";
import { useState, useEffect } from "react";
import { removeAuthTokens, checkAuthStatus, getCurrentUser } from "../../../services/api/index";
import { useRouter } from 'next/navigation';
import notificationService from "../../utils/notifications";
import Navigation from "../../components/Navigation";
import Image from 'next/image';

const getInitialFromName = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

const getColorFromId = (id) => {
  const colors = [
    'bg-green-500', 'bg-blue-500', 'bg-purple-500',
    'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'
  ];
  return colors[id % colors.length] || 'bg-gray-500';
};

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    initializePage();
  }, [router]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        const usuariosIniciales = [];
        setUsuarios(usuariosIniciales);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      notificationService.showErrorNotification('Error al cargar usuarios: ' + error.message);
      setLoading(false);
    }
  };

  const initializePage = async () => {
    try {
      console.log('Inicializando página de dashboard...');
      
      // ✅ MODIFICADO: No verificar autenticación forzosa
      const status = checkAuthStatus();
      
      if (status.isAuthenticated) {
        console.log('Usuario autenticado, cargando datos...');
        notificationService.init();

        // Obtener datos del usuario actual si está autenticado
        try {
          const currentUser = await getCurrentUser();
          console.log('Datos del usuario desde API:', currentUser);

          setUserData({
            name: currentUser.first_name || "Administrador AGROSIG",
            email: currentUser.email || "admin@agrosig.com",
            role: "Administrador",
            userId: currentUser.id,
            profileImage: currentUser.profile_image || currentUser.avatar_url || null
          });
        } catch (userError) {
          console.log('No se pudieron cargar datos del usuario, continuando sin autenticación');
        }
      } else {
        console.log('Usuario no autenticado, mostrando dashboard público');
        // No establecer userData, para que Navigation muestre "Iniciar Sesión"
      }

      // Cargar usuarios (si es necesario)
      await cargarUsuarios();
    } catch (error) {
      console.error('Error inicializando página:', error);
      // No mostrar error para usuarios no autenticados
      if (checkAuthStatus().isAuthenticated) {
        notificationService.showErrorNotification('Error al cargar los usuarios: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    notificationService.showSuccessNotification('Has cerrado sesión correctamente. ¡Hasta pronto!');
    removeAuthTokens();
    setUserData(null); // Limpiar datos del usuario
    // No redirigir, mantener en el dashboard
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleDownload = () => {
    notificationService.showSuccessNotification('Redirigiendo a la tienda de aplicaciones...');
    window.open('https://play.google.com/store/apps/details?id=com.agrosig', '_blank');
  };

  const handleComingSoon = (pageName) => {
    notificationService.showSuccessNotification(`¡${pageName} estará disponible pronto!`);
  };

  // Array de funcionalidades de la app
  const features = [
    {
      icon: "🤖",
      title: "Asistente IA & Chatbot",
      description: "Asistente inteligente que responde tus dudas agrícolas 24/7 y ofrece recomendaciones personalizadas",
      capabilities: ["Diagnóstico de plagas", "Recomendaciones de cultivo", "Soporte instantáneo"]
    },
    {
      icon: "🗺️",
      title: "Gestión de Parcelas",
      description: "Registra y organiza todas tus parcelas con mapas interactivos y límites georreferenciados",
      capabilities: ["Mapas digitales", "Geolocalización", "Historial de cultivos"]
    },
    {
      icon: "📊",
      title: "Reportes Avanzados",
      description: "Genera reportes detallados de rendimiento, costos y productividad con análisis inteligente",
      capabilities: ["Dashboard interactivo", "Métricas en tiempo real", "Exportación de datos"]
    },
    {
      icon: "📝",
      title: "Registro de Actividades",
      description: "Lleva un control completo de todas las actividades agrícolas desde siembra hasta cosecha",
      capabilities: ["Calendario integrado", "Recordatorios automáticos", "Seguimiento de tareas"]
    },
    {
      icon: "🌤️",
      title: "API Meteorológica",
      description: "Pronósticos del tiempo precisos y alertas climáticas para optimizar tus decisiones",
      capabilities: ["Pronóstico 7 días", "Alertas de heladas", "Datos históricos"]
    },
  ];

  // Componente para mostrar el avatar
  const UserAvatar = ({ user, size = "w-8 h-8" }) => {
    if (user && user.profileImage) {
      return (
        <img
          src={user.profileImage}
          alt={`Avatar de ${user.name}`}
          className={`${size} rounded-lg object-cover shadow-sm border border-gray-200`}
        />
      );
    }

    if (user) {
      return (
        <div className={`${size} ${getColorFromId(user.userId || 0)} rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm border border-gray-200`}>
          {getInitialFromName(user.name)}
        </div>
      );
    }

    return null;
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <Navigation 
          userData={userData} 
          onLogout={handleLogout} 
          onLogin={handleLogin}
        />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent mx-auto mb-4"></div>
            <div className="text-2xl font-semibold text-slate-700 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg">
              Cargando...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Componente de Navegación - Ahora maneja usuarios no autenticados */}
      <Navigation
        userData={userData}
        onLogout={handleLogout}
        onLogin={handleLogin}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-700 to-green-800 text-white pt-16 pb-20 lg:pt-20 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-emerald-400/20 rounded-full animate-bounce"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* contenido de la app */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                Tu campo en
                <span className="block bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  tu móvil
                </span>
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl mb-6 opacity-95 leading-relaxed">
                Controla tu agricultura desde cualquier lugar con la
                <span className="font-semibold text-white"> app AGROSIG</span>.
                Monitorea, gestiona y optimiza en tiempo real.
              </p>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownload}
                  className="bg-white text-gray-800 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-4 group max-w-md mx-auto lg:mx-0"
                >
                  <div className="text-left">
                    <div className="text-sm opacity-70">Disponible ahora</div>
                    <div className="font-black text-xl">DESCARGAR APP</div>
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                {/* ✅ BOTÓN DE LOGIN PARA USUARIOS NO AUTENTICADOS */}
                {!userData && (
                  <button
                    onClick={handleLogin}
                    className="border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-green-800 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-4 group max-w-md mx-auto lg:mx-0"
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

            {/* marco de la imagen */}
            <div className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative">
                <div className="relative w-64 h-[560px] lg:w-72 lg:h-[600px]">
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

      {/* seccion Funcionalidades */}
      <section className="py-20 bg-white">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-green-100/50 hover:border-green-300/50 hover:scale-105"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-30 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {feature.capabilities.map((capability, capIndex) => (
                    <div key={capIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* seccion de beneficios */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-2xl mx-auto mb-4">
                📈
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Mayor Productividad</h3>
              <p className="text-gray-600">
                Optimiza tus procesos agrícolas y aumenta el rendimiento de tus cultivos
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-2xl mx-auto mb-4">
                💰
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Ahorro de Recursos</h3>
              <p className="text-gray-600">
                Reduce costos en agua, fertilizantes y control de plagas
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-2xl mx-auto mb-4">
                🌍
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Agricultura Sostenible</h3>
              <p className="text-gray-600">
                Practica una agricultura más responsable con el medio ambiente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            ¿Listo para transformar tu agricultura?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-2xl mx-auto">
            Descarga AGROSIG y lleva el control total de tus cultivos a cualquier lugar
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="bg-white text-green-800 px-16 py-5 rounded-2xl font-bold text-2xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center space-x-4"
            >
              <div className="text-left">
                <div className="text-sm opacity-70">Descargar ahora</div>
                <div className="font-black">OBTENER LA APP</div>
              </div>
              <span className="text-2xl">↓</span>
            </button>
            
            {/* ✅ BOTÓN DE REGISTRO PARA USUARIOS NO AUTENTICADOS */}
            {!userData && (
              <button
                onClick={() => router.push('/registro')}
                className="border-2 border-white text-white px-16 py-5 rounded-2xl font-bold text-2xl hover:bg-white hover:text-green-800 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center space-x-4"
              >
                <div className="text-left">
                  <div className="text-sm opacity-90">¿Nuevo usuario?</div>
                  <div className="font-black">REGISTRARSE</div>
                </div>
                <span className="text-2xl">→</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-green-900 via-emerald-900 to-green-950 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-2xl font-black">AGROSIG APP</span>
              </div>
              <p className="text-green-200 text-lg leading-relaxed max-w-md">
                La aplicación móvil que está revolucionando la agricultura moderna.
                Descarga y únete a la comunidad de agricultores inteligentes.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Navegación</h3>
              <ul className="space-y-2 text-green-200">
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

          <div className="border-t border-green-800 pt-8 text-center">
            <p className="text-green-300">
              © 2024 AGROSIG App. Transformando la agricultura desde tu móvil.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}