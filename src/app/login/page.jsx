"use client";
import { useState, useEffect } from "react";
import { login, checkAuthStatus } from "../../../services/api";
import { useRouter } from 'next/navigation';
import styles from '../../styles/Login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    const status = checkAuthStatus();
    if (status.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, ingresa email y contraseña");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (!isClient) {
    return (
      <div className={styles.container}>
        <div className={styles.authContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>AGROSIG</h1>
            <p className={styles.subtitle}>Sistema de Gestión Agrícola</p>
          </div>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.authContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>AGROSIG</h1>
          <p className={styles.subtitle}>Sistema de Gestión Agrícola</p>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Correo Electrónico</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className={styles.input}
              placeholder="tu@email.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          <div className={styles.rememberGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className={styles.checkbox}
              />
              Recordar
            </label>
          </div>

          <button 
            onClick={handleLogin} 
            disabled={loading}
            className={loading ? styles.loginButtonDisabled : styles.loginButton}
          >
            {loading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
          </button>

          <div className={styles.linksContainer}>
            <a href="/registro" className={styles.link}>Registrarse</a>
            <span className={styles.separator}>•</span>
            <a href="/olvide-contraseña" className={styles.link}>¿Olvidaste tu contraseña?</a>
          </div>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}