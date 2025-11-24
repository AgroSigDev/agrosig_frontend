"use client";
import { useState, useEffect } from "react";
import { login, checkAuthStatus, isAuthenticated } from "../../../services/api/index";
import { useRouter } from 'next/navigation';

export default function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    // VERIFICAR AUTENTICACIÓN USANDO LA NUEVA FUNCIÓN
    const authenticated = isAuthenticated();
    if (authenticated) {
      router.push('/dashboard');
    }

    // VERIFICAR SI HAY MENSAJE DE REGISTRO EXITOSO SIN useSearchParams
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get('message');
      if (message) {
        setShowSuccessAlert(true);
        // Limpiar el parámetro de la URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [router]);

  // Componente de Alerta de Éxito en Login
  const SuccessAlert = () => {
    if (!showSuccessAlert) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="text-emerald-600 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-800">
                ¡Registro Exitoso!
              </h3>
              <p className="mt-1 text-sm text-emerald-700">
                Cuenta creada exitosamente. Por favor, inicia sesión.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-all duration-200"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    
    if (!email || !password) {
      setError("Por favor, ingresa email y contraseña");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, ingresa un email válido");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      // USAR LA NUEVA FUNCIÓN DE LOGIN ACTUALIZADA
      await login(email, password);
      
      // Redirigir al dashboard después del login exitoso
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Error en login:', err);
      
      // Manejar errores específicos de la nueva función de login
      let errorMessage = err.message || "Error al iniciar sesión. Por favor, intenta nuevamente.";
      
      // Traducir mensajes de error específicos si es necesario
      if (errorMessage.includes('User not found')) {
        errorMessage = "Usuario no encontrado. Verifica tu email.";
      } else if (errorMessage.includes('Invalid password')) {
        errorMessage = "Contraseña incorrecta. Intenta nuevamente.";
      } else if (errorMessage.includes('User is not active')) {
        errorMessage = "Usuario inactivo. Contacta al administrador.";
      } else if (errorMessage.includes('The email is already linked to this Google account')) {
        errorMessage = "El email está vinculado a una cuenta de Google.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN PARA REDIRIGIR AL REGISTRO
  const handleCreateAccount = () => {
    router.push('/registro');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 w-full max-w-md mx-4 text-center border border-emerald-200/60">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white font-bold text-xl">SA</span>
              </div>
            </div>
          </div>
          <div className="py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="text-emerald-700 mt-4 font-medium">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-4 relative overflow-hidden">
      {/* Renderizar alerta de éxito */}
      <SuccessAlert />
      
      {/* Elementos decorativos de fondo con hojas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100/20 rounded-full blur-3xl"></div>
        
        {/* Patrón de hojas sutiles */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-20 left-10 transform rotate-12">
            <svg className="w-24 h-24 text-emerald-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.21-3.12C7.51 17.44 9.62 14 16 14c.35 0 .69.02 1.03.05L17 8z"/>
            </svg>
          </div>
          <div className="absolute bottom-20 right-10 transform -rotate-45">
            <svg className="w-20 h-20 text-emerald-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.21-3.12C7.51 17.44 9.62 14 16 14c.35 0 .69.02 1.03.05L17 8z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row rounded-3xl shadow-xl overflow-hidden bg-white/90 backdrop-blur-md border border-emerald-200/60">
          {/* Formulario */}
          <div className="p-8 md:p-12 lg:p-16 w-full lg:w-1/2">
            <div className="max-w-md mx-auto">
              {/* Header con Logo */}
              <div className="text-center mb-12">
                <div className="flex justify-center mb-8">
                  <div 
                    className="relative transition-all duration-500 hover:scale-105 transform"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur-md transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-20'}`}></div>
                    <img
                      src="/logo-soluciones-agrotec.png"
                      alt="Soluciones Agrotec S.A de C.V"
                      className="h-20 w-auto relative z-10 transition-all duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.getElementById('logo-fallback');
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                    <div id="logo-fallback" className="hidden">
                      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white py-4 px-8 rounded-2xl shadow-lg relative z-10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12m0 0H9m3 0h3" />
                            </svg>
                          </div>
                          <div>
                            <h1 className="text-2xl font-bold tracking-tight mb-1">Soluciones Agrotec</h1>
                            <p className="text-emerald-100 text-sm font-medium">S.A de C.V</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-emerald-900 mb-3 tracking-tight">
                  Bienvenido de vuelta
                </h2>
                <p className="text-emerald-700 text-base font-normal">
                  Ingresa a tu cuenta para continuar
                </p>
              </div>

              {/* Formulario */}
              <form className="space-y-6" onSubmit={handleLogin}>
                {/* Campo Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-emerald-800">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400"
                      placeholder="nombre@empresa.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-emerald-800">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400"
                      placeholder="Ingresa tu contraseña"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Opciones */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        rememberMe
                          ? 'bg-emerald-600 border-emerald-600 shadow-sm'
                          : 'bg-white border-emerald-400 group-hover:border-emerald-500'
                      }`}>
                        {rememberMe && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-emerald-700 font-medium">Recordar sesión</span>
                  </label>

                  <a
                    href="/olvide-contraseña"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors duration-200 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Botón Principal */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:from-emerald-300 disabled:to-emerald-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2 relative z-10">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>INICIANDO SESIÓN...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2 relative z-10">
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>INICIAR SESIÓN</span>
                    </span>
                  )}
                </button>

                {/* Separador */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-emerald-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-emerald-600 text-sm font-medium">
                      ¿Primera vez aquí?
                    </span>
                  </div>
                </div>

                {/* BOTÓN MODIFICADO - Ahora con funcionalidad de redirección */}
                <button
                  onClick={handleCreateAccount}
                  className="w-full py-3.5 text-center border border-emerald-300 text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>CREAR CUENTA NUEVA</span>
                  </span>
                </button>
              </form>

              {/* Mensaje de error */}
              {error && (
                <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 animate-fade-in">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-red-700 flex-1 font-medium">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200 flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lado derecho - Imagen/Contenido */}
          <div className="bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-900 p-8 md:p-12 w-full lg:w-1/2 flex items-center justify-center min-h-[400px] lg:min-h-[600px] relative overflow-hidden">
            {/* Patrón de hojas de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 transform rotate-12">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.21-3.12C7.51 17.44 9.62 14 16 14c.35 0 .69.02 1.03.05L17 8z"/>
                </svg>
              </div>
              <div className="absolute bottom-10 right-10 transform -rotate-45">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L5 9.5V15.5L3 16V18L9 16.5V15.5L15 16.5V18L21 16V14L19 15.5V9.5L21 9Z"/>
                </svg>
              </div>
              <div className="absolute top-1/2 left-1/4 transform rotate-90">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.21-3.12C7.51 17.44 9.62 14 16 14c.35 0 .69.02 1.03.05L17 8z"/>
                </svg>
              </div>
            </div>
            
            <div className="text-center relative z-10 text-white max-w-md">
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/5 rounded-2xl blur-sm transform -rotate-1 scale-105"></div>
                  <img
                    src="/animacion-agricola-profesional.gif"
                    alt="Tecnología agrícola moderna"
                    className="max-w-full max-h-[200px] w-auto h-auto object-contain rounded-xl mx-auto shadow-lg relative z-10"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = document.getElementById('gif-fallback');
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                </div>

                <div id="gif-fallback" className="hidden">
                  <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-lg">
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Soluciones Agrotec</h3>
                    <p className="text-white/70 text-base">Innovación en agricultura</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold mb-3 bg-white/10 backdrop-blur-sm py-3 px-6 rounded-xl border border-white/10">
                  Soluciones Agrotec S.A de C.V
                </h3>
                <p className="text-white/80 text-lg leading-relaxed font-light max-w-md mx-auto italic">
                  "Innovación y tecnología para maximizar el potencial de tu campo"
                </p>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    Cultivando el futuro de la agricultura
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}