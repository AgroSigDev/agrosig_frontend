"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { registerWithImage, validateRegisterFields } from "../../../services/api/index";

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    paternal_surname: "",
    maternal_surname: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const fileInputRef = useRef(null);
  const router = useRouter();

  // ✅ Componente de Alerta Personalizada (sin cambios)
  const CustomAlert = () => {
    if (!showAlert.show) return null;

    const isSuccess = showAlert.type === 'success';
    const bgColor = isSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200';
    const textColor = isSuccess ? 'text-emerald-800' : 'text-red-800';
    const iconColor = isSuccess ? 'text-emerald-600' : 'text-red-600';
    const icon = isSuccess ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${bgColor} border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in`}>
          <div className="flex items-center space-x-3">
            <div className={`${iconColor} flex-shrink-0`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${textColor}`}>
                {isSuccess ? '¡Éxito!' : 'Error'}
              </h3>
              <p className={`mt-1 text-sm ${textColor}`}>
                {showAlert.message}
              </p>
            </div>
            <button
              onClick={() => {
                setShowAlert({ show: false, type: '', message: '' });
                if (isSuccess) {
                  router.push('/login');
                }
              }}
              className={`flex-shrink-0 ${isSuccess ? 'text-emerald-600 hover:text-emerald-800' : 'text-red-600 hover:text-red-800'} transition-colors duration-200`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setShowAlert({ show: false, type: '', message: '' });
                if (isSuccess) {
                  router.push('/login');
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isSuccess 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isSuccess ? 'Ir al Login' : 'Entendido'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Manejar selección de imagen (sin cambios)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Por favor, selecciona una imagen válida (JPEG, PNG, GIF, WebP)");
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("La imagen debe ser menor a 5MB");
        return;
      }

      setProfileImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Eliminar imagen seleccionada (sin cambios)
  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validaciones del frontend usando la función auxiliar
      const validationErrors = validateRegisterFields(formData);
      if (validationErrors.length > 0) {
        setError(validationErrors[0]);
        setLoading(false);
        return;
      }

      // Crear FormData para enviar la imagen
      const formDataToSend = new FormData();
      
      // Agregar campos de texto
      formDataToSend.append('first_name', formData.first_name.trim());
      formDataToSend.append('paternal_surname', formData.paternal_surname.trim() || '');
      formDataToSend.append('maternal_surname', formData.maternal_surname.trim() || '');
      formDataToSend.append('email', formData.email.toLowerCase().trim());
      formDataToSend.append('password', formData.password);
      
      // Agregar imagen si existe
      if (profileImage) {
        formDataToSend.append('image_user', profileImage);
      }

      console.log("📤 Enviando datos de registro...");
      console.log("📝 Datos:", {
        first_name: formData.first_name,
        paternal_surname: formData.paternal_surname,
        maternal_surname: formData.maternal_surname,
        email: formData.email,
        hasImage: !!profileImage
      });

      // Usar la función mejorada registerWithImage
      const result = await registerWithImage(formDataToSend);

      // ✅ ÉXITO - MOSTRAR ALERTA DE ÉXITO
      setShowAlert({
        show: true,
        type: 'success',
        message: result.message || '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión con tus credenciales.'
      });
      
      // Limpiar formulario
      setFormData({
        first_name: "",
        paternal_surname: "",
        maternal_surname: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
      setProfileImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      console.error("❌ Error en registro:", err);
      
      // ✅ MOSTRAR ALERTA DE ERROR MEJORADA
      let errorMessage = err.message || "Error al crear la cuenta. Por favor, intenta nuevamente.";
      
      // Manejar errores específicos de red/CORS
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage = "Error de conexión. Verifica que el servidor esté ejecutándose y que tengas acceso a HTTPS://localhost:4000";
      } else if (err.message.includes('certificate') || err.message.includes('SSL')) {
        errorMessage = "Error de certificado SSL. En desarrollo, puedes ignorar los warnings de certificados auto-firmados.";
      }
      
      setShowAlert({
        show: true,
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-4 relative overflow-hidden">
      {/* ✅ Renderizar la alerta personalizada */}
      <CustomAlert />
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-12 border border-emerald-200/60">
          {/* Header (sin cambios) */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div 
                className="relative transition-all duration-500 hover:scale-105 transform"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur-md transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-20'}`}></div>
                <img
                  src="/logo-soluciones-agrotec.png"
                  alt="Soluciones Agrotec S.A de C.V"
                  className="h-16 w-auto relative z-10 transition-all duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = document.getElementById('logo-fallback');
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div id="logo-fallback" className="hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white py-3 px-6 rounded-2xl shadow-lg relative z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-xl font-bold tracking-tight">Soluciones Agrotec</h1>
                        <p className="text-emerald-100 text-xs font-medium">S.A de C.V</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-emerald-900 mb-3 tracking-tight">
              Crear Cuenta Nueva
            </h2>
            <p className="text-emerald-700 text-base font-normal">
              Únete a Soluciones Agrotec y maximiza tu potencial agrícola
            </p>
          </div>

          {/* Formulario de Registro (sin cambios en la UI) */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* ✅ Sección de Imagen de Perfil (sin cambios) */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {/* Preview de la imagen */}
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview de perfil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center shadow-lg">
                    <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Botón para seleccionar imagen */}
              <div className="text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  id="profileImage"
                />
                <label
                  htmlFor="profileImage"
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                </label>
                <p className="text-xs text-emerald-600 mt-2">
                  Formatos: JPEG, PNG, GIF, WebP • Máx. 5MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="first_name" className="block text-sm font-semibold text-emerald-800">
                  Nombre *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400"
                    placeholder="Juan"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Apellido Paterno */}
              <div className="space-y-2">
                <label htmlFor="paternal_surname" className="block text-sm font-semibold text-emerald-800">
                  Apellido Paterno
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="paternal_surname"
                    name="paternal_surname"
                    type="text"
                    value={formData.paternal_surname}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400"
                    placeholder="Pérez"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Apellido Materno */}
              <div className="space-y-2">
                <label htmlFor="maternal_surname" className="block text-sm font-semibold text-emerald-800">
                  Apellido Materno
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="maternal_surname"
                    name="maternal_surname"
                    type="text"
                    value={formData.maternal_surname}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400"
                    placeholder="García"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-emerald-800">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400"
                    placeholder="nombre@empresa.com"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-emerald-800">
                  Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400"
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-emerald-800">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400"
                    placeholder="Repite tu contraseña"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información de campos */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-700 text-center">
                <strong>Nota:</strong> Los campos marcados con * son obligatorios. Los apellidos y la imagen de perfil son opcionales.
              </p>
            </div>

            {/* Botón de Registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:from-emerald-300 disabled:to-emerald-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {loading ? (
                <span className="flex items-center justify-center space-x-2 relative z-10">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>CREANDO CUENTA...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2 relative z-10">
                  <svg className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>CREAR CUENTA</span>
                </span>
              )}
            </button>

            {/* Enlace para volver al login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors duration-200 hover:underline"
                disabled={loading}
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </form>

          {/* Mensaje de error del formulario (validaciones frontend) */}
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
                disabled={loading}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}