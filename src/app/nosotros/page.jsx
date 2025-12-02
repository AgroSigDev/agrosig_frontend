"use client";
import { useState, useEffect } from "react";
import { removeAuthTokens, checkAuthStatus, getOwnProfile, isAuthenticated } from "../../../services/api/index";
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

            const authenticated = isAuthenticated();

            if (authenticated) {
                console.log('Usuario autenticado, obteniendo datos...');
                notificationService.init();

                const currentUser = await getOwnProfile();
                console.log('Datos del usuario desde API:', currentUser);

                setUserData({
                    name: currentUser.first_name || "Usuario AGROSIG",
                    email: currentUser.email || "usuario@agrosig.com",
                    role: "Usuario",
                    userId: currentUser.user_id || currentUser.id,
                    profileImage: currentUser.image_user || currentUser.profile_image || currentUser.avatar_url || null
                });
            } else {
                console.log('Usuario no autenticado, mostrando página pública');
            }

        } catch (error) {
            console.error('Error inicializando página:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (userData) {
            notificationService.showSuccessNotification('Has cerrado sesión correctamente. ¡Hasta pronto!');
            removeAuthTokens();
            setUserData(null);
        }
    };

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

    const sections = {
        mision: {
            title: "Misión",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            content: "Empoderar a los agricultores mediante el desarrollo de herramientas tecnológicas personalizadas que optimicen sus procesos agrícolas, mejoren la toma de decisiones, incrementen los rendimientos y reduzcan costos. Existimos para transformar la agricultura en una actividad más eficiente y sostenible, respondiendo a las necesidades de los agricultores y del medio ambiente.",

        },
        vision: {
            title: "Visión",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            items: [
                {
                    name: "Sostenibilidad",
                    description: "Actuamos con responsabilidad social y ambiental, fomentando un impacto positivo en nuestro entorno.",
                    color: "from-green-500 to-emerald-500",
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    )
                },
                {
                    name: "Compromiso",
                    description: "Estamos profundamente enfocados en cumplir nuestros objetivos y los de nuestros clientes con profesionalismo y dedicación.",
                    color: "from-blue-500 to-cyan-500",
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                },
                {
                    name: "Colaboración",
                    description: "Fomentamos el trabajo en equipo y las alianzas estratégicas como pilares para el éxito colectivo.",
                    color: "from-purple-500 to-pink-500",
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    )
                },
                {
                    name: "Integridad",
                    description: "Actuamos con ética y transparencia en todas nuestras acciones, asegurando relaciones de confianza con nuestros clientes, colaboradores y socios.",
                    color: "from-orange-500 to-red-500",
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    )
                },
                {
                    name: "Calidad",
                    description: "Garantizamos herramientas confiables y efectivas mediante estándares de desarrollo rigurosos.",
                    color: "from-indigo-500 to-purple-500",
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                }
            ]
        },
        equipo: {
            title: "Equipo",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            ),
            miembros: [
                {
                    nombre: "David de Jesús Chavarría Hernández",
                    puesto: "Product Owner & FullStack Móvil",
                    foto: "/equipo/hernadez.png",
                    descripcion: "Líder del proyecto con expertise en desarrollo móvil. Responsable de definir la visión del producto y priorizar el backlog.",
                    habilidades: ["Aleteo", "Node.js", "PHP ", "PostgreSQL", "Mongo", "MySQL ", "postman", "VS Code", "HTML 5", "Javascript", "Bootstrap", "Docker", "Git", "Flutter", "Linux", "Android Studio", "Dart", "Insomnia", "PostgreSQL"],
                    email: "david087hdz@gmail.com",
                    github: "https://github.com/Dave0097-hdz",
                    linkedin: "https://www.linkedin.com/in/david-hernandez-dev"
                },
                {
                    nombre: "Yolanda Avendaño Estrada",
                    puesto: "Scrum Master",
                    foto: "/equipo/yolanda.png",
                    descripcion: "Facilitadora del proceso Scrum, asegurando que el equipo siga las prácticas ágiles y elimina impedimentos.",
                    habilidades: ["Scrum", "Agile", "Facilitación", "Gestión de Procesos"],
                    email: "yolanda.avendano@utselva.edu.mx",
                    github: "",
                    linkedin: ""
                },
                {
                    nombre: "Luis Arturo Villarreal López",
                    puesto: "Desarrollador FullStack Web",
                    foto: "/equipo/villarreal.png",
                    descripcion: "Especializado en desarrollo web full stack. Crea aplicaciones modernas y responsivas con las últimas tecnologías.",
                    habilidades: ["PHP", "windsurf", "livewire", "Laravel", "Next.js", "Node.js", "MongoDB", "JavaScript", "mongoDB", "Tailwind CSS", "flowbite", "Docker", "Git", "Linux", "Android Studio", "Kotlin", "PostgreSQL", "HTML 5", "CSS 3", "Bootstrap"],
                    email: "villarreallopoez@gmail.com",
                    github: "https://github.com/GIMPRODUCTION",
                    linkedin: "https://www.linkedin.com/in/luis-arturo-villarreal-lopez-588519391/?trk=public-profile-join-page"
                },
                {
                    nombre: "David Ordoñez Estrada",
                    puesto: "QA Tester",
                    foto: "/equipo/wafle.png",
                    descripcion: "Especialista en aseguramiento de calidad. Garantiza que el producto cumpla con los más altos estándares de calidad.",
                    habilidades: ["Testing", "Cypress", "Jest", "Control de Calidad"],
                    email: "david.ordonez@utselva.edu.mx",
                    github: "",
                    linkedin: ""
                },
                {
                    nombre: "Dulce Yuridia Chavarría Hernández",
                    puesto: "Diseñadora UI/UX",
                    foto: "/equipo/dulce.png",
                    descripcion: "Creativa especializada en diseño de interfaces e experiencia de usuario. Combina estética y funcionalidad.",
                    habilidades: ["Figma", "UI/UX", "Design Thinking", "Prototipado"],
                    email: "dulce.chavarria@utselva.edu.mx",
                    github: "",
                    linkedin: ""
                },
                {
                    nombre: "Abistrain Hernández Suarez",
                    puesto: "Especialista en Marketing",
                    foto: "/equipo/avistrain.png",
                    descripcion: "Responsable de estrategias de marketing digital y posicionamiento del producto en el mercado agrícola.",
                    habilidades: ["Marketing Digital", "Estrategia", "Análisis de Mercado", "Branding"],
                    email: "abistrain.hernandez@utselva.edu.mx",
                    github: "",
                    linkedin: ""
                },
                {
                    nombre: "Daniel Uriel Trujillo Delgadillo",
                    puesto: "Especialista en Marketing",
                    foto: "/equipo/uriel.png",
                    descripcion: "Especializado en estrategias de marketing y comunicación. Enfocado en expandir el alcance del proyecto AGROSIG.",
                    habilidades: ["Comunicación", "Estrategias de Mercado", "Publicidad", "Redes Sociales"],
                    email: "daniel.trujillo@utselva.edu.mx",
                    github: "",
                    linkedin: ""
                }
            ]
        }
    };

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
            <Navigation
                userData={userData}
                onLogout={handleLogout}
            />

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

            {/* Navegación Fija - No sticky */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-6">
                    <div className="flex overflow-x-auto space-x-2 py-6 scrollbar-hide">
                        {Object.entries(sections).map(([key, section]) => (
                            <button
                                key={key}
                                onClick={() => setActiveSection(key)}
                                className={`flex items-center space-x-3 px-5 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 ${activeSection === key
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <div className={`${activeSection === key ? 'text-white' : 'text-green-600'}`}>
                                    {section.icon}
                                </div>
                                <span className="text-sm">{section.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="max-w-6xl mx-auto">

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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                {sections.meta.metrics.map((metric, index) => (
                                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
                                        <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                                        <div className="text-lg font-semibold text-green-600 mb-2">{metric.label}</div>
                                        <p className="text-sm text-gray-600">{metric.description}</p>
                                    </div>
                                ))}
                            </div>

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

                    {activeSection === "equipo" && (
                        <div className="space-y-12">
                            <div className="text-center max-w-3xl mx-auto">
                                <div className="flex items-center justify-center space-x-4 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                                        {sections.equipo.icon}
                                    </div>
                                    <h2 className="text-4xl font-bold text-gray-900">Nuestro Equipo Estudiantil</h2>
                                </div>
                                <p className="text-xl text-gray-600">
                                    Jóvenes talentos de la Universidad Tecnológica de la Selva, Chiapas.
                                    Futuros Ingenieros en Desarrollo y Gestión de Software.
                                </p>
                            </div>

                            {/* Grid de Miembros del Equipo - TODOS LOS INTEGRANTES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {sections.equipo.miembros.map((miembro, index) => {
                                    // Verificar si el miembro tiene cuentas
                                    const tieneGitHub = miembro.github && miembro.github !== "#" && miembro.github !== "";
                                    const tieneLinkedIn = miembro.linkedin && miembro.linkedin !== "#" && miembro.linkedin !== "";

                                    return (
                                        <div key={index} className="group perspective" style={{ perspective: '1000px' }}>
                                            <div className="relative w-full h-[500px] transition-all duration-500 preserve-3d group-hover:rotate-y-180">
                                                {/* FRENTE de la card - SOLO información básica */}
                                                <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                                                    {/* Header con foto MÁS GRANDE y centrada */}
                                                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex-shrink-0">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            {miembro.foto ? (
                                                                <img
                                                                    src={miembro.foto}
                                                                    alt={miembro.nombre}
                                                                    className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg object-center"
                                                                    style={{ objectPosition: 'center top' }}
                                                                />
                                                            ) : (
                                                                <div className="w-36 h-36 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                                                    <span className="text-white text-3xl font-bold">
                                                                        {miembro.nombre.split(' ').map(n => n[0]).join('')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Badge de estudiante */}
                                                        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                                            Ingeniero
                                                        </div>
                                                    </div>

                                                    {/* Información básica con más espacio */}
                                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                                        <div className="text-center">
                                                            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                                                                {miembro.nombre}
                                                            </h3>
                                                            <p className="text-green-600 font-semibold text-base mb-4">
                                                                {miembro.puesto}
                                                            </p>

                                                            {/* Universidad */}
                                                            <div className="mb-6">
                                                                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded-full font-medium">
                                                                    UTS, Chiapas
                                                                </span>
                                                            </div>

                                                            {/* Habilidades principales con más espacio */}
                                                            <div className="mb-4">
                                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Habilidades Principales</h4>
                                                                <div className="flex flex-wrap gap-2 justify-center">
                                                                    {miembro.habilidades.slice(0, 4).map((habilidad, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full border border-gray-200"
                                                                        >
                                                                            {habilidad}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Indicador de hover más visible */}
                                                        <div className="flex items-center justify-center text-gray-500 text-sm mt-4 p-3 bg-gray-50 rounded-lg">
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Click para más información
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* REVERSO de la card - MÁS ESPACIO PARA TODO EL CONTENIDO */}
                                                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg rotate-y-180 p-6 text-white flex flex-col">
                                                    {/* Header más compacto */}
                                                    <div className="text-center mb-4 flex-shrink-0 border-b border-white/20 pb-4">
                                                        <h3 className="text-xl font-bold mb-1">{miembro.nombre}</h3>
                                                        <p className="text-indigo-200 text-base">{miembro.puesto}</p>
                                                    </div>

                                                    {/* Contenido principal con scroll suave */}
                                                    <div className="flex-1 overflow-y-auto pr-2">
                                                        <div className="space-y-5">
                                                            {/* Descripción completa */}
                                                            <div>
                                                                <h4 className="text-base font-semibold text-white mb-3 flex items-center">
                                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Sobre Mí
                                                                </h4>
                                                                <p className="text-indigo-100 text-sm leading-relaxed bg-white/10 rounded-lg p-4">
                                                                    {miembro.descripcion}
                                                                </p>
                                                            </div>

                                                            {/* Información académica MEJORADA */}
                                                            <div>
                                                                <h4 className="text-base font-semibold text-white mb-3 flex items-center">
                                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                                    </svg>
                                                                    Formación Académica
                                                                </h4>
                                                                <div className="bg-white/10 rounded-lg p-4 space-y-3">
                                                                    <div className="flex items-start">
                                                                        <svg className="w-5 h-5 mr-3 text-indigo-200 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                        </svg>
                                                                        <div>
                                                                            <p className="text-indigo-100 text-sm font-semibold">Universidad Tecnológica de la Selva</p>
                                                                            <p className="text-indigo-200 text-xs mt-1">Chiapas, México</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-start">
                                                                        <svg className="w-5 h-5 mr-3 text-indigo-200 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                                        </svg>
                                                                        <div>
                                                                            <p className="text-indigo-100 text-sm font-semibold">Ingeniería en Desarrollo y Gestión de Software</p>
                                                                            <p className="text-indigo-200 text-xs mt-1">Carrera: IDGS</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Competencias Técnicas con más espacio */}
                                                            <div>
                                                                <h4 className="text-base font-semibold text-white mb-3 flex items-center">
                                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                    </svg>
                                                                    Competencias Técnicas
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {miembro.habilidades.map((habilidad, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="inline-block bg-white/20 text-white text-sm px-3 py-2 rounded-full backdrop-blur-sm border border-white/10"
                                                                        >
                                                                            {habilidad}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Contacto fijo en la parte inferior */}
                                                    <div className="border-t border-white/20 pt-4 mt-4 flex-shrink-0">
                                                        <h4 className="text-base font-semibold text-white mb-3 flex items-center">
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            Contacto
                                                        </h4>
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-indigo-100 text-sm truncate" title={miembro.email}>
                                                                    {miembro.email}
                                                                </p>
                                                            </div>
                                                            <div className="flex space-x-3 ml-4">
                                                                {/* Botón GitHub - CONDICIONAL */}
                                                                {tieneGitHub ? (
                                                                    <a
                                                                        href={miembro.github}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 backdrop-blur-sm group relative"
                                                                        title="GitHub"
                                                                    >
                                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                                        </svg>
                                                                    </a>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => notificationService.showInfoNotification('Este integrante del equipo no cuenta con una cuenta de GitHub por el momento')}
                                                                        className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 backdrop-blur-sm cursor-pointer group relative"
                                                                        title="Cuenta de GitHub no disponible"
                                                                    >
                                                                        <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                                        </svg>
                                                                        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                            Sin cuenta
                                                                        </span>
                                                                    </button>
                                                                )}

                                                                {/* Botón LinkedIn - CONDICIONAL */}
                                                                {tieneLinkedIn ? (
                                                                    <a
                                                                        href={miembro.linkedin}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 backdrop-blur-sm group relative"
                                                                        title="LinkedIn"
                                                                    >
                                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                                        </svg>
                                                                    </a>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => notificationService.showInfoNotification('Este integrante del equipo no cuenta con una cuenta de LinkedIn por el momento')}
                                                                        className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 backdrop-blur-sm cursor-pointer group relative"
                                                                        title="Cuenta de LinkedIn no disponible"
                                                                    >
                                                                        <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                                        </svg>
                                                                        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                            Sin cuenta
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Información de la universidad */}
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold mb-2">Universidad Tecnológica de la Selva</h3>
                                    <p className="text-blue-100">Formando a los próximos líderes en tecnología</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                    <div>
                                        <div className="text-3xl font-bold mb-2">7</div>
                                        <div className="text-blue-100">Miembros del Equipo</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold mb-2">IDGS</div>
                                        <div className="text-blue-100">Ingeniería en Desarrollo y Gestión de Software</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold mb-2">2025</div>
                                        <div className="text-blue-100">Generación de Innovadores</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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