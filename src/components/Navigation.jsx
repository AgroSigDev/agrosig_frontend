"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import notificationService from "../utils/notifications";
import { 
  getProfileImageUrl, 
  getAuthToken,
  logout,
  checkAuthStatus 
} from "../../services/api";

const Navigation = ({ userData, onLogout, onLogin, isLoading = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // DEBUG: Verificar estructura del usuario
  useEffect(() => {
    if (userData) {
      console.log("[NAVIGATION] userData recibido:", userData);
      console.log("[NAVIGATION] Email del usuario:", userData.email);
      console.log("[NAVIGATION] Campos disponibles:", Object.keys(userData));

      // Verificar si tiene role_id
      console.log("[NAVIGATION] ¿Tiene role_id?:", 'role_id' in userData);
      console.log("[NAVIGATION] role_id valor:", userData.role_id);

      // Verificar si es admin
      const adminCheck = isAdmin();
      console.log("[NAVIGATION] ¿Es admin?:", adminCheck);
    }
  }, [userData]);

  // Scroll effect
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleComingSoon = (pageName) => {
    notificationService.showSuccessNotification(`¡${pageName} estará disponible pronto!`);
  };

  // FUNCIÓN MEJORADA: Manejo de logout
  const handleLogout = async () => {
    const confirmed = await notificationService.showLogoutConfirmation();
    if (confirmed) {
      try {
        // Llamar a la función de logout del API
        await logout();
        
        // Ejecutar callback personalizado si existe
        if (onLogout) {
          onLogout();
        } else {
          // Redirigir a login por defecto
          router.push('/login');
        }
      } catch (error) {
        console.error("Error durante logout:", error);
        // Fallback: redirigir incluso si hay error
        router.push('/login');
      }
    }
  };

  const handleLoginClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      router.push('/login');
    }
  };

  // FUNCIÓN MEJORADA: Obtener nombre completo del usuario
  const getUserFullName = () => {
    if (!userData) return "Cargando...";

    // Si ya existe un campo name, usarlo
    if (userData.name) return userData.name;

    // Construir nombre completo desde los campos individuales
    if (userData.first_name) {
      const { first_name = "", paternal_surname = "", maternal_surname = "" } = userData;

      // Combinar nombres y apellidos, filtrando vacíos
      const nameParts = [first_name, paternal_surname, maternal_surname].filter(part => part && part.trim() !== '');
      const fullName = nameParts.join(' ').trim();

      return fullName || userData.email?.split('@')[0] || "Usuario";
    }

    // Fallback al email si no hay nombre
    return userData.email?.split('@')[0] || "Usuario";
  };

  // FUNCIÓN NUEVA: Obtener información detallada del usuario para mostrar
  const getUserDisplayInfo = () => {
    if (!userData) {
      return {
        fullName: "Cargando...",
        email: "cargando...",
        role: "Cargando...",
        initials: "C",
        isAdmin: false
      };
    }

    const adminStatus = isAdmin();
    const fullName = getUserFullName();
    const initials = getUserInitial();
    const email = userData.email || "No disponible";
    const role = adminStatus ? "Administrador" : "Usuario";

    return {
      fullName,
      email,
      role,
      initials,
      isAdmin: adminStatus
    };
  };

  const getUserInitial = () => {
    if (!userData) return "C";
    const name = getUserFullName();
    return name ? name[0].toUpperCase() : userData.email?.[0].toUpperCase() || "U";
  };

  // FUNCIÓN CORREGIDA: Verificar admin de forma robusta
  const isAdmin = () => {
    if (!userData) {
      console.log(" [isAdmin] userData no disponible");
      return false;
    }

    console.log(" [isAdmin] Verificando admin para:", userData.email);

    // MÉTODO 1: Verificar role_id en userData (si el backend lo incluye)
    if (userData.role_id !== undefined && userData.role_id !== null) {
      console.log(" [isAdmin] role_id en userData:", userData.role_id, "Tipo:", typeof userData.role_id);

      // Convertir a número y verificar
      const roleId = Number(userData.role_id);
      if (roleId === 1) {
        console.log("[isAdmin] ADMIN detectado por role_id en userData");
        return true;
      }

      // También verificar como string
      if (userData.role_id === "1") {
        console.log("[isAdmin] ADMIN detectado por role_id (string) en userData");
        return true;
      }
    }

    // MÉTODO 2: Verificar role_id en el token JWT
    try {
      const token = getAuthToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("[isAdmin] Payload del token:", payload);

        if (payload.role_id === 1 || payload.role_id === "1") {
          console.log(" [isAdmin] ADMIN detectado por role_id en token JWT");
          return true;
        }
      }
    } catch (error) {
      console.log(" [isAdmin] Error decodificando token:", error);
    }

    // MÉTODO 3: Fallback por email específico
    const adminEmails = [
      'ga78goher@gmail.com',
      'ga78gober@gmail.com',
      'gabriel@gmail.com',
      'admin@agrotec.com'
    ];

    const userEmail = userData.email?.toLowerCase().trim() || '';
    console.log(" [isAdmin] Email del usuario:", userEmail);

    if (adminEmails.includes(userEmail)) {
      console.log(" [isAdmin] ADMIN detectado por email específico");
      return true;
    }

    console.log(" [isAdmin] USUARIO NORMAL");
    console.log(" [isAdmin] userData para debug:", {
      email: userData.email,
      role_id: userData.role_id,
      has_role_id: 'role_id' in userData,
      all_fields: Object.keys(userData)
    });

    return false;
  };

  // Navegación base para todos los usuarios
  const baseNavigationItems = [
    {
      key: "Inicio",
      label: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      action: () => router.push("/dashboard"),
    },
    {
      key: "comentarios",
      label: "Comentarios",
      path: "/comentarios",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      action: () => router.push("/comentarios"),
    },
    {
      key: "nosotros",
      label: "Nosotros",
      path: "/nosotros",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      action: () => router.push("/nosotros"),
    }
  ];

  // Navegación solo para administradores
  const adminNavigationItems = [
    {
      key: "gestionUsuario",
      label: "Gestión Usuarios",
      path: "/gestionUsuario",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      action: () => router.push("/gestionUsuario"),
    }
  ];

  // Combinar navegación según el rol
  const adminStatus = isAdmin();
  const navigationItems = adminStatus
    ? [...baseNavigationItems, ...adminNavigationItems]
    : baseNavigationItems;

  console.log(" [NAVIGATION] Estado final - Admin:", adminStatus, "Items:", navigationItems.length);

  const isActive = (path) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  const UserAvatar = ({ size = 8, showDropdown = false, userData }) => {
    const sizeClass = `w-${size} h-${size}`;

    const imgUrl = getProfileImageUrl(userData?.image_user);

    return (
      <div className="relative flex items-center">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt="Avatar"
            className={`${sizeClass} rounded-full object-cover border border-gray-300 shadow-sm hover:shadow-md transition-all cursor-pointer`}
          />
        ) : (
          <div
            className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium text-xs shadow-sm cursor-pointer hover:shadow-md transition-all`}
          >
            {getUserInitial()}
          </div>
        )}
        {showDropdown && (
          <svg
            className={`w-3 h-3 ml-2 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    );
  };

  // Obtener información del usuario para mostrar
  const userInfo = getUserDisplayInfo();

  // Estado de carga
  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo skeleton */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="hidden sm:flex flex-col space-y-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Navigation Items Skeleton - Solo en desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {[1, 2, 3].map((item) => (
                <div key={item} className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>

            {/* User Section Skeleton */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="hidden lg:block text-right">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b backdrop-blur-lg",
          isScrolled
            ? "bg-white/95 shadow-sm border-gray-200/80"
            : "bg-white/98 border-gray-100"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo y Botón Mobile */}
            <div className="flex items-center space-x-4">
              {/* Botón Menú Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Logo */}
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => router.push("/dashboard")}
              >
                <div className="relative">
                  <img
                    src="/logo-soluciones-agrotec.png"
                    alt="Soluciones Agrotec"
                    className="h-8 w-auto transition-all duration-200 group-hover:scale-105"
                  />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                    Soluciones Agrotec
                  </span>
                  <p className="text-[11px] text-gray-500 font-medium tracking-wide">SISTEMA DE GESTIÓN</p>
                </div>
              </div>
            </div>

            {/* Navigation Items - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map(({ key, path, label, action, icon }) => (
                <button
                  key={key}
                  onClick={action}
                  className={clsx(
                    "flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg relative group",
                    isActive(path)
                      ? "text-blue-600 bg-blue-50/80 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                  )}
                >
                  {icon}
                  <span className="font-semibold">{label}</span>

                  {isActive(path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* User Section */}
            <div className="flex items-center" ref={userMenuRef}>
              {userData ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={clsx(
                      "flex items-center space-x-2 lg:space-x-4 rounded-lg px-3 py-2 lg:px-4 transition-all duration-200 border",
                      isUserMenuOpen
                        ? "bg-gray-50 border-gray-300 shadow-sm"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    <UserAvatar showDropdown={true} userData={userData} />

                    {/* Información del usuario - Solo en desktop grande */}
                    <div className="hidden xl:block text-right">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {userInfo.fullName}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {userInfo.email}
                      </p>
                      <div className="flex items-center justify-end space-x-2 mt-1">
                        <p className={clsx(
                          "text-xs font-medium capitalize px-2 py-0.5 rounded-full",
                          adminStatus
                            ? "text-blue-700 bg-blue-100 border border-blue-200"
                            : "text-gray-600 bg-gray-100 border border-gray-200"
                        )}>
                          {userInfo.role}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200/80 backdrop-blur-sm py-2 z-50">
                      {/* Encabezado */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <UserAvatar size={12} userData={userData} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {userInfo.fullName}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {userInfo.email}
                            </p>
                            <div className={clsx(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2",
                              adminStatus
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            )}>
                              {adminStatus ? "Administrador" : "Usuario"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push("/perfil");
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors duration-150 group"
                        >
                          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <span className="font-medium">Mi Perfil</span>
                            <p className="text-xs text-gray-500">Ver y editar tu información</p>
                          </div>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 transition-colors duration-150 group mx-2 rounded-lg"
                        >
                          <div className="p-1.5 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <span className="font-medium">Cerrar Sesión</span>
                            <p className="text-xs text-red-500">Salir de {userInfo.fullName}</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Usuarios no autenticados
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center space-x-2 px-3 py-2 lg:px-4 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 border border-green-200 hover:border-green-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline font-semibold">Iniciar Sesión</span>
                  </button>

                  <button
                    onClick={() => router.push('/registro')}
                    className="hidden sm:flex items-center space-x-2 px-3 py-2 lg:px-4 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 border border-green-600 hover:border-green-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="font-semibold">Registrarse</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm mt-16">
          <div 
            ref={mobileMenuRef}
            className="bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-5 duration-200"
          >
            <div className="px-4 py-6 space-y-2">
              {/* Navigation Items Mobile */}
              {navigationItems.map(({ key, path, label, action, icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    action();
                    setIsMobileMenuOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center space-x-3 px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg",
                    isActive(path)
                      ? "text-blue-600 bg-blue-50 border border-blue-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                  )}
                >
                  {icon}
                  <span className="font-semibold">{label}</span>
                  {isActive(path) && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}

              {/* User Info Mobile - Si está autenticado */}
              {userData && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <UserAvatar size={10} userData={userData} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userInfo.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userInfo.email}
                      </p>
                      <div className={clsx(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1",
                        adminStatus
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {adminStatus ? "Administrador" : "Usuario"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      router.push("/perfil");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}

              {/* Login/Register Mobile - Si no está autenticado */}
              {!userData && (
                <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => {
                      handleLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-base font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Iniciar Sesión</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/registro');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors border border-green-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Registrarse</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;