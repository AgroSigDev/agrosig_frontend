# AgroSig Frontend

Plataforma web frontend para la gestión agrícola, desarrollada con Next.js y React que permite a agricultores, técnicos y administradores gestionar parcelas, cultivos, trazabilidad de producción y cuentas de usuario con control de acceso basado en roles.

## 🚀 Características Principales

- **Autenticación y Gestión de Sesión**: Sistema completo de login, registro y logout con tokens JWT
- **Panel de Administración**: Interfaz diferenciada para administradores y usuarios regulares
- **Gestión de Usuarios**: CRUD completo de usuarios (solo administradores)
- **Datos Agrícolas**: Gestión de parcelas y cultivos con trazabilidad
- **Comunidad**: Sistema de comentarios para interacción entre usuarios
- **Diseño Responsivo**: Interfaz adaptativa para dispositivos móviles y escritorio

## 🛠️ Stack Tecnológico

### Core Framework
- **Next.js** 15.5.9 - Framework React con App Router y Turbopack
- **React** 19.1.0 - Librería de componentes UI
- **Node.js** >=18.14.0 - Runtime JavaScript

### Estilos y UI
- **TailwindCSS** 4.1.13 - Framework CSS utility-first
- **Framer Motion** 12.23.24 - Animaciones para React
- **React Icons** 5.5.0 - Librería de iconos

### Mapping y Visualización
- **Leaflet** 1.9.4 - Mapas interactivos para visualización de parcelas

### Testing
- **Jest** 30.2.0 - Framework de testing
- **@testing-library/jest-dom** 6.9.1 - Matchers personalizados para DOM

## 📦 Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno (ver sección Variables de Entorno)

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 🌐 Variables de Entorno

La aplicación requiere la siguiente variable de entorno:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📁 Estructura del Proyecto

```
src/app/
├── login/                 # Página de autenticación
├── registro/              # Registro de nuevos usuarios
├── dashboard/             # Panel principal (admin/público)
├── perfil/                # Gestión de perfil
├── gestion-usuario/       # Administración de usuarios (admin)
├── comentarios/           # Comunidad y discusiones
├── trazabilidad/          # Historial de producción
├── nosotros/              # Información del equipo
└── globals.css            # Estilos globales

services/api/
├── index.js               # Facade API - exportador principal
├── auth.js                # Funciones de autenticación
├── users.js               # Gestión de usuarios
├── crops.js               # Datos de cultivos
├── plots.js               # Datos de parcelas
├── comments.js            # CRUD de comentarios
└── utils.js               # Configuración y utilidades API

src/components/
└── Navigation.jsx         # Navegación compartida
```

## 🎯 Roles y Permisos

La aplicación implementa control de acceso basado en roles (RBAC):

### Administradores
- Acceso completo a gestión de usuarios
- Métricas y estadísticas del sistema
- Operaciones CRUD en usuarios, parcelas y cultivos
- Panel administrativo mejorado

### Usuarios Regulares
- Gestión de perfil propio
- Participación en comunidad
- Visualización de trazabilidad
- Panel público con contenido promocional

## 🚀 Scripts Disponibles

```json
{
  "dev": "next dev --turbopack",           # Servidor desarrollo
  "build": "next build --turbopack",       # Build producción
  "start": "next start",                   # Servidor producción
  "test": "jest",                          # Ejecutar tests
  "test:watch": "jest --watch",            # Tests en modo watch
  "test:coverage": "jest --coverage"       # Tests con cobertura
}
```

## 🔐 Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Sistema envía POST a `/auth/login`
3. Backend retorna tokens de acceso y refresh
4. Tokens se almacenan en localStorage (`authToken`, `refreshToken`)
5. Páginas protegidas verifican token con `isAuthenticated()`
6. Token de acceso se incluye en requests autenticadas

## 📱 Características Técnicas

- **App Router**: Usa Next.js 15 con enrutamiento basado en archivos
- **Turbopack**: Bundler rápido para desarrollo y producción
- **API Facade Pattern**: Punto único de importación desde `services/api/index.js`
- **Token Management**: Gestión automática de tokens JWT
- **Responsive Design**: Diseño móvil-first con TailwindCSS

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

---
