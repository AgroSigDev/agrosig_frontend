"use client";
import { useState, useEffect } from "react";
import { removeAuthTokens, checkAuthStatus } from "../../../services/api";
import { useRouter } from 'next/navigation';
import notificationService from "../../utils/notifications";
import Navigation from "../../components/Navigation";
import Image from 'next/image';

export default function NosotrosPage() {
    const [userData, setUserData] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);

        const status = checkAuthStatus();
        if (!status.isAuthenticated) {
            router.push('/login');
            return;
        }

        notificationService.init();
        setUserData({
            name: "Usuario AGROSIG",
            email: status.tokens.accessToken ? "usuario@agrosig.com" : "Invitado"
        });
    }, [router]);

    const handleLogout = () => {
        notificationService.showSuccessNotification('Has cerrado sesión correctamente. ¡Hasta pronto!');
        removeAuthTokens();
        router.push('/login');
    };



    const handleComingSoon = (pageName) => {
        notificationService.showSuccessNotification(`¡${pageName} estará disponible pronto!`);
    };



    if (!isClient) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
                    <div className="text-2xl font-bold text-green-800 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
                        Cargando AGROSIG...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            {/* Componente de Navegación  */}
            <Navigation
                userData={userData}
                onLogout={handleLogout}
            />





            {/* seccion de beneficios  */}
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
                                <li>
                                    <button
                                        onClick={() => handleComingSoon('Administrar Usuarios')}
                                        className="hover:text-white transition-colors cursor-pointer"
                                    >
                                        Administrar Usuarios
                                    </button>
                                </li>
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
        </div >
    );
}