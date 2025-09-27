"use client";
import { useState, useEffect } from "react";
import { getUsers, removeAuthTokens, checkAuthStatus } from "../../../services/api";
import { useRouter } from 'next/navigation';
import styles from '../../styles/Dashboard.module.css';

export default function DashboardPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
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

    // Simular datos del usuario logueado
    setUserData({
      name: "Usuario AGROSIG",
      email: status.tokens.accessToken ? "usuario@agrosig.com" : "Invitado"
    });

    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsuarios(data);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      if (err.message.includes("Sesión expirada") || err.message.includes("No hay token")) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthTokens();
    router.push('/login');
  };

  const handleDownload = () => {
    alert('¡Gracias por tu interés! La descarga estará disponible pronto.');
  };

  if (!isClient) {
    return <div className={styles.loading}>Cargando AGROSIG...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <span className={styles.navLogo}>AGROSIG</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#inicio" className={styles.navLink}>INICIO</a>
          <a href="#quienes-somos" className={styles.navLink}>QUIÉNES SOMOS</a>
          <a href="#comentarios" className={styles.navLink}>COMENTARIOS</a>
          <button onClick={handleLogout} className={styles.loginButton}>
            CERRAR SESIÓN
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>AGROSIG</h1>
          <p className={styles.heroSubtitle}>
            Soluciones tecnológicas innovadoras para el sector agrícola. 
            Optimiza tus cultivos, controla plagas y mejora tu productividad 
            con nuestra plataforma integral.
          </p>
          <button onClick={handleDownload} className={styles.downloadButton}>
            DESCARGAR AHORA
          </button>
        </div>
      </section>

      {/* Welcome Section */}
      <section className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeIcon}>🌱</div>
          <h2 className={styles.welcomeTitle}>¡Bienvenido a AGROSIG!</h2>
          <p className={styles.welcomeText}>
            Has iniciado sesión correctamente en nuestra plataforma de 
            gestión agrícola. Aquí podrás administrar tus cultivos, 
            monitorear el crecimiento y optimizar tu producción.
          </p>
          
          <div className={styles.userInfo}>
            <p>Sesión activa para: <span className={styles.userEmail}>{userData?.email}</span></p>
            <p className={styles.sessionInfo}>
              Tu sesión estará activa por <strong>7 días</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Actions Grid */}
      <div className={styles.actionsGrid}>
        <div className={styles.actionCard}>
          <div className={styles.actionIcon}>📊</div>
          <h3 className={styles.actionTitle}>Dashboard de Cultivos</h3>
          <p className={styles.actionDescription}>
            Monitorea el crecimiento y salud de tus cultivos en tiempo real
          </p>
          <button className={styles.actionButton}>Ver Dashboard</button>
        </div>

        <div className={styles.actionCard}>
          <div className={styles.actionIcon}>🐛</div>
          <h3 className={styles.actionTitle}>Control de Plagas</h3>
          <p className={styles.actionDescription}>
            Sistema inteligente de detección y control de plagas
          </p>
          <button className={styles.actionButton}>Gestionar Plagas</button>
        </div>

        <div className={styles.actionCard}>
          <div className={styles.actionIcon}>💧</div>
          <h3 className={styles.actionTitle}>Riego Inteligente</h3>
          <p className={styles.actionDescription}>
            Optimiza el consumo de agua con nuestro sistema de riego
          </p>
          <button className={styles.actionButton}>Configurar Riego</button>
        </div>
      </div>

      {/* Users Section */}
      {!loading && usuarios.length > 0 && (
        <section className={styles.usersSection}>
          <h2 className={styles.sectionTitle}>Usuarios del Sistema</h2>
          <div className={styles.usersGrid}>
            {usuarios.map((usuario, index) => (
              <div key={usuario.user_id || index} className={styles.userCard}>
                <div className={styles.userAvatar}>
                  {usuario.first_name?.charAt(0)}{usuario.paternal_surname?.charAt(0)}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>
                    {usuario.first_name} {usuario.paternal_surname}
                  </div>
                  <div className={styles.userEmail}>{usuario.email}</div>
                </div>
                <div className={styles.userRole}>
                  {usuario.role_id === 1 ? 'Admin' : 'Usuario'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Logout Section */}
      <section className={styles.logoutSection}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </section>
    </div>
  );
}