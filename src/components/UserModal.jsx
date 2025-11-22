// components/UserModal.jsx
"use client";
import { useState, useEffect, useRef } from "react";

const UserModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user = null, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    paternal_surname: "",
    maternal_surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    oldPassword: ""
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const fileInputRef = useRef(null);

  // Resetear formulario cuando se abre/cierra el modal o cambia el usuario
  useEffect(() => {
    if (isOpen) {
      if (user) {
        console.log("Cargando datos del usuario para edición:", user);
        setFormData({
          first_name: user.first_name || '',
          paternal_surname: user.paternal_surname || '',
          maternal_surname: user.maternal_surname || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          oldPassword: ''
        });
        
        if (user.profileImage) {
          setImagePreview(user.profileImage);
        } else {
          setImagePreview(null);
        }
        
        setProfileImage(null);
        setShowPasswordFields(false);
      } else {
        setFormData({
          first_name: "",
          paternal_surname: "",
          maternal_surname: "",
          email: "",
          password: "",
          confirmPassword: "",
          oldPassword: ""
        });
        setProfileImage(null);
        setImagePreview(null);
        setShowPasswordFields(true);
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setError(null);
    }
  }, [isOpen, user]);

  // Manejar selección de imagen
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Por favor, selecciona una imagen válida (JPEG, PNG, GIF, WebP)");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("La imagen debe ser menor a 5MB");
        return;
      }

      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Eliminar imagen seleccionada
  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(user?.profileImage || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  // Toggle para mostrar/ocultar campos de contraseña en edición
  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    if (showPasswordFields) {
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        password: '',
        confirmPassword: ''
      }));
    }
  };

  // Validación de campos mejorada - 8 CARACTERES MÍNIMO
  const validateFields = () => {
    const errors = [];

    if (!formData.first_name?.trim()) {
      errors.push("El nombre es obligatorio");
    }

    if (!formData.email?.trim()) {
      errors.push("El email es obligatorio");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("El formato del email no es válido");
    }

    // Validar contraseña para nuevo usuario (OBLIGATORIO)
    if (!user) {
      if (!formData.password) {
        errors.push("La contraseña es obligatoria");
      } else if (formData.password.length < 8) {
        errors.push("La contraseña debe tener al menos 8 caracteres");
      }

      if (!formData.confirmPassword) {
        errors.push("Confirma tu contraseña");
      } else if (formData.password !== formData.confirmPassword) {
        errors.push("Las contraseñas no coinciden");
      }
    }

    // Validar contraseña para edición solo si se muestran los campos (OPCIONAL)
    if (user && showPasswordFields) {
      // Si el usuario decide cambiar la contraseña, validar todos los campos
      if (formData.oldPassword || formData.password || formData.confirmPassword) {
        if (!formData.oldPassword) {
          errors.push("La contraseña actual es obligatoria para cambiar la contraseña");
        }

        if (!formData.password) {
          errors.push("La nueva contraseña es obligatoria");
        } else if (formData.password.length < 8) {
          errors.push("La nueva contraseña debe tener al menos 8 caracteres");
        }

        if (!formData.confirmPassword) {
          errors.push("Confirma tu nueva contraseña");
        } else if (formData.password !== formData.confirmPassword) {
          errors.push("Las nuevas contraseñas no coinciden");
        }

        if (formData.oldPassword && formData.password && formData.oldPassword === formData.password) {
          errors.push("La nueva contraseña debe ser diferente a la actual");
        }
      }
      // Si no se llenó ningún campo de contraseña, no hay problema (es opcional)
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    const submitData = {
      ...formData,
      profileImage: profileImage,
      updatePassword: user && showPasswordFields && formData.oldPassword && formData.password // Solo actualizar si hay datos
    };

    console.log(" Enviando datos del modal:", submitData);
    onSubmit(submitData);
  };

  // Prevenir el cierre al hacer clic en el contenido del modal
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 animate-slideUp max-h-[90vh] overflow-y-auto"
        onClick={handleModalContentClick}
      >
        {/* Header del Modal */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 px-8 py-6 rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                {user ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {user ? 'Editar Usuario' : 'Agregar Usuario'}
                </h2>
                <p className="text-emerald-100 text-sm font-medium mt-1">
                  {user ? 'Actualiza la información del usuario' : 'Completa los datos del nuevo usuario'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-all duration-200 p-2 rounded-xl hover:bg-white/10 backdrop-blur-sm"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del Formulario */}
        <div className="p-8 bg-white">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Sección de Imagen de Perfil */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
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
                        disabled={loading}
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
                    disabled={loading}
                  />
                  <label
                    htmlFor="profileImage"
                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                      loading 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
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
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="nombre@empresa.com"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Botón para mostrar campos de contraseña en edición */}
                {user && (
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={togglePasswordFields}
                      className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200"
                      disabled={loading}
                    >
                      <svg className={`w-4 h-4 transform transition-transform ${showPasswordFields ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span>
                        {showPasswordFields ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Campos de contraseña para nuevo usuario o cuando se muestran en edición */}
                {(!user || showPasswordFields) && (
                  <>
                    {/* Contraseña actual (solo para edición) */}
                    {user && (
                      <div className="space-y-2">
                        <label htmlFor="oldPassword" className="block text-sm font-semibold text-emerald-800">
                          Contraseña Actual {showPasswordFields && '*'}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <input
                            id="oldPassword"
                            name="oldPassword"
                            type="password"
                            value={formData.oldPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Tu contraseña actual (solo si quieres cambiarla)"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Nueva contraseña */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-emerald-800">
                        {user ? 'Nueva Contraseña' : 'Contraseña *'}
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
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder={user ? "Nueva contraseña (mín. 8 caracteres)" : "Mínimo 8 caracteres"}
                          disabled={loading}
                          required={!user} // Solo obligatorio para nuevo usuario
                        />
                      </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-emerald-800">
                        {user ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}
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
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 placeholder-emerald-400 bg-white text-emerald-900 shadow-sm hover:border-emerald-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder={user ? "Repite la nueva contraseña" : "Repite tu contraseña"}
                          disabled={loading}
                          required={!user} // Solo obligatorio para nuevo usuario
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Información de campos */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-700 text-center">
                  <strong>Nota:</strong> Los campos marcados con * son obligatorios. 
                  {!user && " La contraseña es obligatoria y debe tener al menos 8 caracteres."}
                  {user && " Para cambiar la contraseña, haz clic en 'Cambiar contraseña'. Los campos de contraseña son opcionales."}
                </p>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 animate-fade-in">
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

            {/* Botones de Acción */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 py-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold shadow-md hover:shadow-lg border border-gray-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-br from-emerald-600 to-green-600 text-white py-4 rounded-xl hover:from-emerald-700 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="font-medium">
                      {user ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;