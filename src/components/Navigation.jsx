"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import notificationService from "../utils/notifications";
import { getProfileImageUrl } from "../../services/api"; 

const Navigation = ({ userData, onLogout, isLoading = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef(null);

  // DEBUG: Verificar datos del usuario
  useEffect(() => {
    console.log("🔄 [NAVIGATION] userData actualizado:", userData);
    
    if (userData) {
      console.log("🔍 [DEBUG] userData completo:", userData);
      console.log("🔍 [DEBUG] role_id:", userData.role_id, "Tipo:", typeof userData.role_id);
      console.log("🔍 [DEBUG] email:", userData.email);
      console.log("🔍 [DEBUG] Todos los campos:", Object.keys(userData));
      
      // DEBUG COMPLETO TEMPORAL
      console.log("🚨 [DEBUG COMPLETO] userData estructura:", JSON.stringify(userData, null, 2));
      console.log("🚨 [DEBUG] role_id valor:", userData.role_id);
      console.log("🚨 [DEBUG] role_id tipo:", typeof userData.role_id);
      console.log("🚨 [DEBUG] role_id == 1:", userData.role_id == 1);
      console.log("🚨 [DEBUG] role_id === 1:", userData.role_id === 1);
      console.log("🚨 [DEBUG] Number(role_id) === 1:", Number(userData.role_id) === 1);
      
      // Probar la función isAdmin manualmente
      const adminCheck = isAdmin();
      console.log("🔍 [DEBUG] Resultado de isAdmin():", adminCheck);
    }
  }, [userData]);

  // PROBLEMA 1: Optimizar el scroll con throttling
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleComingSoon = (pageName) => {
    notificationService.showSuccessNotification(`¡${pageName} estará disponible pronto!`);
  };

  const handleLogout = async () => {
    const confirmed = await notificationService.showLogoutConfirmation();
    if (confirmed && onLogout) onLogout();
  };

  const getUserFullName = () => {
    if (!userData) return "Cargando...";
    if (userData.name) return userData.name;
    const { first_name = "", paternal_surname = "", maternal_surname = "" } = userData;
    const fullName = `${first_name} ${paternal_surname} ${maternal_surname}`.trim();
    return fullName || userData?.email?.split('@')[0] || "Usuario";
  };

  const getUserInitial = () => {
    if (!userData) return "C";
    const name = getUserFullName();
    return name ? name[0].toUpperCase() : userData?.email?.[0].toUpperCase() || "U";
  };

  // SOLUCIÓN ROBUSTA: Verificar por role_id Y por email como fallback
  const isAdmin = () => {
    if (!userData) {
      console.log("❌ [isAdmin] userData no disponible");
      return false;
    }
    
    // DEBUG: Verificar todos los campos disponibles
    console.log("🔍 [isAdmin DEBUG] userData completo:", userData);
    console.log("🔍 [isAdmin DEBUG] Campos disponibles:", Object.keys(userData));
    
    // Método 1: Por role_id (múltiples formas de verificar)
    const roleId = userData.role_id;
    console.log("🔍 [isAdmin DEBUG] role_id crudo:", roleId, "Tipo:", typeof roleId);
    
    // Convertir a número y verificar
    const numericRoleId = Number(roleId);
    console.log("🔍 [isAdmin DEBUG] role_id numérico:", numericRoleId);
    
    if (numericRoleId === 1) {
      console.log("✅ [isAdmin] Admin detectado por role_id === 1");
      return true;
    }
    
    // También verificar como string por si acaso
    if (roleId === "1" || roleId === 1) {
      console.log("✅ [isAdmin] Admin detectado por role_id string '1'");
      return true;
    }
    
    // Verificar si existe un campo role_name o similar
    if (userData.role_name === "admin" || userData.role === "admin") {
      console.log("✅ [isAdmin] Admin detectado por role_name");
      return true;
    }
    
    // Método 2: Fallback por email específico de Gabriel
    const gabrielEmails = [
      'ga78gober@gmail.com',
      'g878goher@gmail.com',
      'gabriel@gmail.com',
      // Agregar más emails de prueba si es necesario
    ];
    
    const userEmail = userData?.email?.toLowerCase() || '';
    console.log("🔍 [isAdmin DEBUG] Email del usuario:", userEmail);
    
    const isGabriel = gabrielEmails.includes(userEmail);
    
    if (isGabriel) {
      console.log("✅ [isAdmin] Admin detectado por email (Gabriel)");
      return true;
    }
    
    console.log(" [isAdmin] Usuario normal - Role ID:", roleId, "Tipo:", typeof roleId, "Email:", userEmail);
    console.log("[isAdmin] Todos los campos:", Object.keys(userData));
    return false;
  };

  // Función para obtener el nombre del rol
  const getRoleName = () => {
    if (!userData) return "Cargando...";
    
    // Verificar directamente los datos para debug
    console.log("🔍 [getRoleName] role_id:", userData.role_id, "Tipo:", typeof userData.role_id);
    
    if (isAdmin()) {
      return "Administrador";
    }
    
    // Si no es admin, podrías tener otros roles
    const roleId = Number(userData.role_id);
    if (roleId === 2) return "Usuario";
    if (roleId === 3) return "Moderador";
    
    return "Usuario";
  };

  // Navegación base para todos los usuarios
  const baseNavigationItems = [
    {
      key: "dashboard",
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
  const navigationItems = isAdmin() 
    ? [...baseNavigationItems, ...adminNavigationItems]
    : baseNavigationItems;

  // PROBLEMA 2: Mejorar la detección de ruta activa
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

  // Estado de carga
  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex flex-col space-y-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Navigation Items Skeleton */}
            <div className="flex items-center space-x-1">
              {[1, 2, 3].map((item) => (
                <div key={item} className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>

            {/* User Section Skeleton */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="text-right">
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
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
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
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                Soluciones Agrotec
              </span>
              <p className="text-[11px] text-gray-500 font-medium tracking-wide">SISTEMA DE GESTIÓN</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
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
                
                {/* Active indicator - SOLO mostrar cuando está activo */}
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
                    "flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-200 border",
                    isUserMenuOpen
                      ? "bg-gray-50 border-gray-300 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  )}
                >
                  <UserAvatar showDropdown={true} userData={userData} />
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {getUserFullName()}
                    </p>
                    <p className={clsx(
                      "text-xs font-medium capitalize",
                      isAdmin() 
                        ? "text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full" 
                        : "text-gray-500"
                    )}>
                      {getRoleName()}
                    </p>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200/80 backdrop-blur-sm py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getUserFullName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {userData.email}
                      </p>
                      <div className={clsx(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2",
                        isAdmin()
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {isAdmin() ? "👑 Administrador" : "👤 Usuario"}
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button 
                        onClick={() => handleComingSoon("Mi Perfil")}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors duration-150 group"
                      >
                        <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium">Mi Perfil</span>
                      </button>

                      <button 
                        onClick={() => handleComingSoon("Configuración")}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors duration-150 group"
                      >
                        <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">Configuración</span>
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
                        <span className="font-medium">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Estado cuando no hay userData (pero no está cargando)
              <div className="text-sm text-gray-500 px-3 py-2">
                No autenticado
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;