"use client";
import { useState, useEffect } from "react";
import { removeAuthTokens, checkAuthStatus, getCurrentUser } from "../../../services/api/index";
import { useRouter } from 'next/navigation';
import notificationService from "../../utils/notifications";
import Navigation from "../../components/Navigation";
import Image from "next/image";

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

export default function NosotrosPage() {
    const [userData, setUserData] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [activeSection, setActiveSection] = useState("mision");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        initializePage();
    }, [router]);

    const initializePage = async () => {
        try {
            console.log('Inicializando página de nosotros...');
            
            // Verificar si hay usuario autenticado (pero no redirigir si no lo hay)
            const status = checkAuthStatus();
            
            if (status.isAuthenticated) {
                console.log('Usuario autenticado, obteniendo datos...');
                notificationService.init();

                // Obtener datos del usuario actual
                const currentUser = await getCurrentUser();
                console.log('Datos del usuario desde API:', currentUser);

                setUserData({
                    name: currentUser.first_name || "Usuario AGROSIG",
                    email: currentUser.email || "usuario@agrosig.com",
                    role: "Usuario",
                    userId: currentUser.id,
                    profileImage: currentUser.profile_image || currentUser.avatar_url || null
                });
            } else {
                console.log('Usuario no autenticado, mostrando página pública');
                // No hacemos nada, la página se muestra sin datos de usuario
            }

        } catch (error) {
            console.error('Error inicializando página:', error);
            // No mostramos error para no interrumpir la experiencia del usuario
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (userData) {
            notificationService.showSuccessNotification('Has cerrado sesión correctamente. ¡Hasta pronto!');
            removeAuthTokens();
            setUserData(null); // Limpiar datos de usuario
            // No redirigimos para mantener al usuario en la página pública
        }
    };

    // Componente para mostrar el avatar
    const UserAvatar = ({ user, size = "w-8 h-8" }) => {
        if (!user) return null;
        
        if (user.profileImage) {
            return (
                <img
                    src={user.profileImage}
                    alt={`Avatar de ${user.name}`}
                    className={`${size} rounded-lg object-cover shadow-sm border border-gray-200`}
                />
            );
        }

        return (
            <div className={`${size} ${getColorFromId(user.userId || 0)} rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm border border-gray-200`}>
                {getInitialFromName(user.name)}
            </div>
        );
    };

    // Secciones de contenido
    const sections = {
        mision: {
            title: "Misión",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            content: "Empoderar a los agricultores mediante el desarrollo de herramientas tecnológicas personalizadas que optimicen sus procesos agrícolas, mejoren la toma de decisiones, incrementen los rendimientos y reduzcan costos. Existimos para transformar la agricultura en una actividad más eficiente y sostenible, respondiendo a las necesidades de los agricultores y del medio ambiente.",
            highlight: "Empoderamiento y Eficiencia"
        },
        vision: {
            title: "Visión",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ),
            content: "Convertirnos como el referente en innovación tecnológica agrícola, integrando inteligencia artificial, análisis de datos y sostenibilidad para ofrecer soluciones que transformen la agricultura en un sector eficiente, conectado, rentable y responsable con el medio ambiente.",
            highlight: "Referente en Innovación Agrícola"
        },
        meta: {
            title: "Meta",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            content: "Para 2030, impactar positivamente hacia los agricultores a nivel nacional, optimizando sus procesos de cultivo mediante la implementación de inteligencia artificial y gestión avanzada de datos, logrando una reducción promedio del 20% en costos operativos y un incremento del 30% en los rendimientos agrícolas.",
            metrics: [
                {
                    value: "2030",
                    label: "Año Meta",
                    description: "Horizonte temporal para el cumplimiento de nuestros objetivos"
                },
                {
                    value: "20%",
                    label: "Reducción de Costos",
                    description: "Disminución promedio en costos operativos para agricultores"
                },
                {
                    value: "30%",
                    label: "Incremento en Rendimientos",
                    description: "Aumento promedio en productividad agrícola"
                },
                {
                    value: "Nacional",
                    label: "Alcance",
                    description: "Cobertura a nivel nacional para agricultores"
                }
            ]
        },
        valores: {
            title: "Valores",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            items: [
                {
                    name: "Sostenibilidad",
                    description: "Actuamos con responsabilidad social y ambiental, fomentando un impacto positivo en nuestro entorno.",
                    color: "from-green-500 to-emerald-500",
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    )
                },
                {
                    name: "Compromiso",
                    description: "Estamos profundamente enfocados en cumplir nuestros objetivos y los de nuestros clientes con profesionalismo y dedicación.",
                    color: "from-blue-500 to-cyan-500",
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                },
                {
                    name: "Colaboración",
                    description: "Fomentamos el trabajo en equipo y las alianzas estratégicas como pilares para el éxito colectivo.",
                    color: "from-purple-500 to-pink-500",
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    )
                },
                {
                    name: "Integridad",
                    description: "Actuamos con ética y transparencia en todas nuestras acciones, asegurando relaciones de confianza con nuestros clientes, colaboradores y socios.",
                    color: "from-orange-500 to-red-500",
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    )
                },
                {
                    name: "Calidad",
                    description: "Garantizamos herramientas confiables y efectivas mediante estándares de desarrollo rigurosos.",
                    color: "from-indigo-500 to-purple-500",
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                }
            ]
        }
    };

    // Loading state
    if (!isClient || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
                <Navigation userData={userData} onLogout={handleLogout} />
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
            {/* Componente de Navegación */}
            <Navigation
                userData={userData}
                onLogout={handleLogout}
            />

            {/* Header Profesional */}
            <div className="pt-28 pb-20 bg-gradient-to-r from-gray-900 to-green-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="container mx-auto px-6 relative">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span className="text-green-300 text-sm font-medium">AGROSIG - Sobre Nosotros</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Nuestra <span className="text-green-300">Esencia</span>
                        </h1>
                        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
                            Conoce los principios fundamentales que guían nuestra misión de transformar
                            la agricultura mediante tecnología innovadora y compromiso con la excelencia.
                        </p>
                    </div>
                </div>
            </div>

            {/* Navegación Elegante */}
            <div className="sticky top-20 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-6">
                    <div className="flex overflow-x-auto space-x-1 py-4 scrollbar-hide">
                        {Object.entries(sections).map(([key, section]) => (
                            <button
                                key={key}
                                onClick={() => setActiveSection(key)}
                                className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 border ${activeSection === key
                                        ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200'
                                        : 'text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-green-300'
                                    }`}
                            >
                                <div className={`${activeSection === key ? 'text-white' : 'text-green-600'}`}>
                                    {section.icon}
                                </div>
                                <span>{section.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="container mx-auto px-6 py-16">
                <div className="max-w-6xl mx-auto">

                    {/* Misión */}
                    {activeSection === "mision" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white">
                                            {sections.mision.icon}
                                        </div>
                                        <h2 className="text-4xl font-bold text-gray-900">Nuestra Misión</h2>
                                    </div>
                                    <p className="text-xl text-gray-700 leading-relaxed mb-6">
                                        {sections.mision.content}
                                    </p>
                                    <div className="inline-flex items-center space-x-2 bg-green-50 rounded-2xl px-4 py-3 border border-green-200">
                                        <span className="text-green-600 font-semibold">Enfoque principal:</span>
                                        <span className="text-gray-800">{sections.mision.highlight}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold">Resultados Esperados</h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start space-x-3">
                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>Mejora significativa en la toma de decisiones agrícolas</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>Incremento sustancial en rendimientos de cultivos</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>Reducción efectiva de costos operativos</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>Transformación hacia una agricultura sostenible</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Visión */}
                    {activeSection === "vision" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div className="order-2 lg:order-1">
                                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-8 text-white h-full">
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold">Pilares Tecnológicos</h3>
                                        <ul className="space-y-4">
                                            <li className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span>Inteligencia Artificial aplicada a la agricultura</span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span>Análisis avanzado de datos agrícolas</span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span>Integración de principios de sostenibilidad</span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span>Soluciones conectadas y en tiempo real</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 space-y-8">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white">
                                        {sections.vision.icon}
                                    </div>
                                    <h2 className="text-4xl font-bold text-gray-900">Nuestra Visión</h2>
                                </div>
                                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                                    {sections.vision.content}
                                </p>
                                <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-2xl px-4 py-3 border border-blue-200">
                                    <span className="text-blue-600 font-semibold">Aspiración central:</span>
                                    <span className="text-gray-800">{sections.vision.highlight}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Meta 2030 */}
                    {activeSection === "meta" && (
                        <div className="space-y-12">
                            <div className="text-center max-w-4xl mx-auto">
                                <div className="flex items-center justify-center space-x-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center text-white">
                                        {sections.meta.icon}
                                    </div>
                                    <h2 className="text-4xl font-bold text-gray-900">Meta</h2>
                                </div>
                                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                                    {sections.meta.content}
                                </p>
                            </div>

                            {/* Métricas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                {sections.meta.metrics.map((metric, index) => (
                                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
                                        <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                                        <div className="text-lg font-semibold text-green-600 mb-2">{metric.label}</div>
                                        <p className="text-sm text-gray-600">{metric.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Enfoques Estratégicos */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Enfoques Estratégicos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl p-6 border border-orange-200">
                                        <h4 className="text-lg font-bold text-gray-900 mb-3">Inteligencia Artificial</h4>
                                        <p className="text-gray-700">
                                            Implementación de algoritmos predictivos para optimización de riego,
                                            control de plagas y recomendaciones de cultivo personalizadas.
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-orange-200">
                                        <h4 className="text-lg font-bold text-gray-900 mb-3">Gestión Avanzada de Datos</h4>
                                        <p className="text-gray-700">
                                            Recopilación y análisis de datos en tiempo real para toma de decisiones
                                            informada y gestión proactiva de cultivos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Valores */}
                    {activeSection === "valores" && (
                        <div className="space-y-12">
                            <div className="text-center max-w-3xl mx-auto">
                                <div className="flex items-center justify-center space-x-4 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white">
                                        {sections.valores.icon}
                                    </div>
                                    <h2 className="text-4xl font-bold text-gray-900">Nuestros Valores</h2>
                                </div>
                                <p className="text-xl text-gray-600">
                                    Los principios fundamentales que definen nuestra cultura organizacional y guían cada decisión
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sections.valores.items.map((valor, index) => (
                                    <div key={index} className="group">
                                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full transform group-hover:-translate-y-2">
                                            <div className={`w-12 h-12 bg-gradient-to-br ${valor.color} rounded-2xl flex items-center justify-center text-white mb-4`}>
                                                {valor.icon}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3">{valor.name}</h3>
                                            <p className="text-gray-700 leading-relaxed">{valor.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Profesional */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3 mb-6 md:mb-0">
                            <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="text-2xl font-bold">AGROSIG</span>
                        </div>
                        <div className="text-gray-400 text-center md:text-right">
                            <p className="text-sm">© 2024 AGROSIG Technologies. Todos los derechos reservados.</p>
                            <p className="text-xs mt-1">Innovación agrícola para un futuro sostenible</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}