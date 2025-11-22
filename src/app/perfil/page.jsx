"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
    getCurrentUser,
    updateUser,
    updateUserPassword,
    checkAuthStatus,
    removeAuthTokens
} from "../../../services/api/index";
import Navigation from "../../components/Navigation";
import notificationService from "../../utils/notifications";

export default function ProfilePage() {
    const [userData, setUserData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        paternal_surname: "",
        maternal_surname: "",
        email: "",
        password: "",
        confirmPassword: "",
        oldPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const router = useRouter();

    // Cargar datos del usuario actual
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setInitialLoading(true);

                const authStatus = checkAuthStatus();
                if (!authStatus.isAuthenticated) {
                    notificationService.showErrorNotification('Debes iniciar sesión para ver tu perfil');
                    router.push('/login');
                    return;
                }

                const currentUser = await getCurrentUser();
                const userId = currentUser.user_id || currentUser.id;
                const userRole = currentUser.role_name ||
                    (currentUser.role_id === 1 ? "Administrador" : "Usuario");

                setUserData({
                    first_name: currentUser.first_name || "",
                    paternal_surname: currentUser.paternal_surname || "",
                    maternal_surname: currentUser.maternal_surname || "",
                    email: currentUser.email || "",
                    role: userRole,
                    role_id: currentUser.role_id,
                    userId: userId,
                    image_user: currentUser.image_user
                });

                setFormData({
                    first_name: currentUser.first_name || "",
                    paternal_surname: currentUser.paternal_surname || "",
                    maternal_surname: currentUser.maternal_surname || "",
                    email: currentUser.email || "",
                    password: "",
                    confirmPassword: "",
                    oldPassword: ""
                });

            } catch (error) {
                console.error('❌ Error cargando perfil:', error);
                notificationService.showErrorNotification('Error al cargar el perfil: ' + error.message);

                if (error.message.includes('autenticación') || error.message.includes('token')) {
                    removeAuthTokens();
                    router.push('/login');
                }
            } finally {
                setInitialLoading(false);
            }
        };

        loadUserData();
    }, [router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    const validateFields = () => {
        const errors = [];

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.push("El formato del email no es válido");
        }

        if (showPasswordFields) {
            const hasPasswordFields = formData.oldPassword || formData.password || formData.confirmPassword;

            if (hasPasswordFields) {
                if (!formData.oldPassword) {
                    errors.push("La contraseña actual es requerida para cambiar la contraseña");
                }

                if (!formData.password) {
                    errors.push("La nueva contraseña es requerida");
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
        }

        return errors;
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            const validationErrors = validateFields();
            if (validationErrors.length > 0) {
                notificationService.showErrorNotification(validationErrors[0]);
                return;
            }

            if (!userData?.userId) {
                notificationService.showErrorNotification('Error: No se encontró el ID del usuario');
                return;
            }

            const updateData = {};

            if (formData.first_name.trim() !== '') updateData.first_name = formData.first_name;
            if (formData.paternal_surname.trim() !== '') updateData.paternal_surname = formData.paternal_surname;
            if (formData.maternal_surname.trim() !== '') updateData.maternal_surname = formData.maternal_surname;
            if (formData.email.trim() !== '') updateData.email = formData.email;

            if (Object.keys(updateData).length > 0) {
                await updateUser(userData.userId, updateData);
            }

            if (showPasswordFields && formData.oldPassword && formData.password && formData.confirmPassword) {
                await updateUserPassword(
                    userData.userId,
                    formData.oldPassword,
                    formData.password,
                    formData.confirmPassword
                );
            }

            setUserData(prev => ({
                ...prev,
                first_name: formData.first_name || prev.first_name,
                paternal_surname: formData.paternal_surname || prev.paternal_surname,
                maternal_surname: formData.maternal_surname || prev.maternal_surname,
                email: formData.email || prev.email
            }));

            setEditing(false);
            setShowPasswordFields(false);

            const hasProfileChanges = Object.keys(updateData).length > 0;
            const hasPasswordChanges = showPasswordFields && formData.oldPassword;

            if (hasProfileChanges && hasPasswordChanges) {
                notificationService.showSuccessNotification('Perfil y contraseña actualizados correctamente');
            } else if (hasProfileChanges) {
                notificationService.showSuccessNotification('Perfil actualizado correctamente');
            } else if (hasPasswordChanges) {
                notificationService.showSuccessNotification('Contraseña actualizada correctamente');
            } else {
                notificationService.showInfoNotification('No se realizaron cambios');
            }

        } catch (error) {
            console.error('❌ Error guardando perfil:', error);
            notificationService.showErrorNotification('Error al actualizar el perfil: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (userData) {
            setFormData({
                first_name: userData.first_name || "",
                paternal_surname: userData.paternal_surname || "",
                maternal_surname: userData.maternal_surname || "",
                email: userData.email || "",
                password: "",
                confirmPassword: "",
                oldPassword: ""
            });
        }
        setEditing(false);
        setShowPasswordFields(false);
    };

    const handleLogout = () => {
        notificationService.showSuccessNotification('Has cerrado sesión correctamente');
        removeAuthTokens();
        router.push('/');
    };

    const handleLogin = () => {
        router.push('/login');
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation
                    userData={userData}
                    onLogout={handleLogout}
                    onLogin={handleLogin}
                />
                <div className="flex justify-center items-center h-96 pt-16">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <div className="text-2xl font-semibold text-gray-700">
                            Cargando perfil...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation
                    userData={userData}
                    onLogout={handleLogout}
                    onLogin={handleLogin}
                />
                <div className="flex justify-center items-center h-96 pt-16">
                    <div className="text-center">
                        <div className="text-2xl font-semibold text-gray-700 mb-4">
                            No se pudo cargar el perfil
                        </div>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation
                userData={userData}
                onLogout={handleLogout}
                onLogin={handleLogin}
            />

            {/* Contenido principal con padding-top para evitar superposición */}
            <div className="pt-16"> {/* Añade este padding-top igual a la altura del navbar */}

                {/* Header Section */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col lg:flex-row items-center gap-8">
                                {/* Avatar Section */}
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                                            {userData.first_name ? userData.first_name[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info Section */}
                                <div className="flex-1 text-center lg:text-left">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {userData.first_name} {userData.paternal_surname} {userData.maternal_surname}
                                    </h1>
                                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {userData.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {!editing ? (
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                            Editar Perfil
                                        </button>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleCancel}
                                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={loading}
                                                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Guardando...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                        </svg>
                                                        Guardar
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Profile Information Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-blue-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                                            <p className="text-gray-600 text-sm">
                                                {editing ? 'Actualiza tu información personal' : 'Tu información de perfil'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {/* Personal Information Grid */}
                                        <div className="space-y-4">

                                            {/* First Name */}
                                            <div className="space-y-2">
                                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                                    Nombre
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="first_name"
                                                        name="first_name"
                                                        type="text"
                                                        value={formData.first_name}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                        placeholder="Tu nombre"
                                                        disabled={!editing || loading}
                                                    />
                                                </div>
                                            </div>

                                            {/* Paternal Surname */}
                                            <div className="space-y-2">
                                                <label htmlFor="paternal_surname" className="block text-sm font-medium text-gray-700">
                                                    Apellido Paterno
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="paternal_surname"
                                                        name="paternal_surname"
                                                        type="text"
                                                        value={formData.paternal_surname}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                        placeholder="Apellido paterno"
                                                        disabled={!editing || loading}
                                                    />
                                                </div>
                                            </div>

                                            {/* Maternal Surname */}
                                            <div className="space-y-2">
                                                <label htmlFor="maternal_surname" className="block text-sm font-medium text-gray-700">
                                                    Apellido Materno
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="maternal_surname"
                                                        name="maternal_surname"
                                                        type="text"
                                                        value={formData.maternal_surname}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                        placeholder="Apellido materno"
                                                        disabled={!editing || loading}
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-2">
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                    Correo Electrónico
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                        placeholder="tu@email.com"
                                                        disabled={!editing || loading}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Password Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-green-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Cambio de Contraseña</h2>
                                            <p className="text-gray-600 text-sm">
                                                {editing ? 'Actualiza tu contraseña' : 'Gestiona tu seguridad'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-6">
                                    {editing ? (
                                        <div className="space-y-4">
                                            {/* Current Password */}
                                            <div className="space-y-2">
                                                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                                                    Contraseña Actual
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="oldPassword"
                                                        name="oldPassword"
                                                        type="password"
                                                        value={formData.oldPassword}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                                                        placeholder="Contraseña actual"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>

                                            {/* New Password */}
                                            <div className="space-y-2">
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                    Nueva Contraseña
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                                                        placeholder="Nueva contraseña"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="space-y-2">
                                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                                    Confirmar Nueva Contraseña
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type="password"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                                                        placeholder="Confirmar nueva contraseña"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-600">
                                                Haz clic en "Editar Perfil" para cambiar tu contraseña
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
