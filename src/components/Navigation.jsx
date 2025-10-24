"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import notificationService from "../utils/notifications";
import { getProfileImageUrl } from "../../services/api"; 

const Navigation = ({ userData, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Manejo del scroll
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 5);
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
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
    if (!userData) return "";
    if (userData.name) return userData.name;
    const { first_name = "", paternal_surname = "", maternal_surname = "" } = userData;
    return `${first_name} ${paternal_surname} ${maternal_surname}`.trim();
  };

  const getUserInitial = () => {
    const name = getUserFullName();
    return name ? name[0].toUpperCase() : userData?.email?.[0].toUpperCase() || "U";
  };

  const navigationItems = [
    {
      key: "inicio",
      label: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      action: () => router.push("/dashboard"),
    },
    {
      key: "comentarios",
      label: "Comentarios",
      path: "/comentarios",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      action: () => router.push("/comentarios"),
    },
    {
      key: "usuarios",
      label: "Usuarios",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      action: () => handleComingSoon("Administrar Usuarios"),
    },
    {
      key: "nosotros",
      label: "Nosotros",
      path: "/nosotros",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
       action: () => router.push("/nosotros"),
    }
  ];

  const isActive = (key) => pathname.includes(key);

  // Componente UserAvatar simplificado usando tu función importada
  const UserAvatar = ({ size = 10, showDropdown = false, userData }) => {
    const sizeClass = `w-${size} h-${size}`;
    
    const getUserFullName = () => {
      if (!userData) return "";
      if (userData.name) return userData.name;
      const { first_name = "", paternal_surname = "", maternal_surname = "" } = userData;
      return `${first_name} ${paternal_surname} ${maternal_surname}`.trim();
    };

    const getUserInitial = () => {
      const name = getUserFullName();
      return name ? name[0].toUpperCase() : userData?.email?.[0].toUpperCase() || "U";
    };

    // Usa la función importada de tu api.js
    const imgUrl = getProfileImageUrl(userData?.image_user);
    
    return (
      <div className="relative flex items-center">
        {imgUrl ? (
          <img 
            src={imgUrl} 
            alt="Avatar" 
            className={`${sizeClass} rounded-full object-cover border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer`} 
          />
        ) : (
          <div 
            className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-sm shadow-md cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all`}
          >
            {getUserInitial()}
          </div>
        )}
        {showDropdown && (
          <svg 
            className={`w-4 h-4 ml-1 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
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

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b backdrop-blur-sm",
        isScrolled 
          ? "bg-white/95 shadow-lg border-gray-200/50" 
          : "bg-white/90 border-gray-100/50"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="h-9 w-auto transition-transform group-hover:scale-105" 
              />
            </div>
            <div className="hidden md:block">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Soluciones Agrotec
              </span>
              <p className="text-xs text-gray-500 font-medium">Sistema de Gestión</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map(({ key, label, action, icon }) => (
              <button
                key={key}
                onClick={action}
                className={clsx(
                  "flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold transition-all rounded-xl border",
                  isActive(key)
                    ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 border-transparent hover:border-gray-200"
                )}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Desktop User Info - SOLO visible en desktop */}
            <div className="hidden lg:flex items-center" ref={userMenuRef}>
              {userData && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-gray-300"
                  >
                    <UserAvatar showDropdown={true} userData={userData} />
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{getUserFullName()}</p>
                      <p className="text-xs text-gray-500 font-medium">{userData.role || "Usuario"}</p>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{getUserFullName()}</p>
                        <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleComingSoon("Mi Perfil")}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Mi Perfil</span>
                      </button>

                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-2 mb-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle - SOLO visible en móvil */}
            <div className="flex lg:hidden items-center space-x-3">
              {userData && (
                <>
                  {/* Avatar del usuario en móvil */}
                  <UserAvatar size={10} userData={userData} />
                  
                  {/* Botón del menú hamburguesa */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={clsx(
                      "p-2.5 rounded-xl transition-all border",
                      isMobileMenuOpen 
                        ? "bg-gray-100 border-gray-300" 
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    )}
                    aria-label="Toggle mobile menu"
                  >
                    {isMobileMenuOpen ? (
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - SOLO visible en móvil */}
      <div
        ref={mobileMenuRef}
        className={clsx(
          "lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200/50 overflow-hidden transition-all duration-300 ease-in-out shadow-lg",
          isMobileMenuOpen ? "max-h-[550px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-4">
          {/* Mobile User Info */}
          {userData && (
            <div className="flex items-center space-x-4 py-4 px-3 bg-gray-50/80 rounded-xl mb-3">
              <UserAvatar size={12} userData={userData} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{getUserFullName()}</p>
                <p className="text-sm text-gray-600 truncate">{userData.email}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">{userData.role || "Usuario"}</p>
              </div>
            </div>
          )}

          {/* Mobile Navigation */}
          <div className="space-y-1 py-2">
            {navigationItems.map(({ key, label, action, icon }) => (
              <button
                key={key}
                onClick={action}
                className={clsx(
                  "w-full flex items-center space-x-3 px-4 py-3.5 text-left text-sm font-semibold rounded-xl transition-all border",
                  isActive(key)
                    ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 border-transparent"
                )}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Mobile User Menu */}
          <div className="pt-4 mt-4 border-t border-gray-200/50">
            <button 
              onClick={() => handleComingSoon("Mi Perfil")}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors mb-2"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Mi Perfil</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;