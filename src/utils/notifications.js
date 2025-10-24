class NotificationService {
  constructor() {
    this.isSupported = this.checkSupport();
    this.permission = this.getCurrentPermission();
    this.registration = null;
  }

  checkSupport() {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator;
  }

  getCurrentPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  async init() {
    if (!this.isSupported) {
      console.warn('❌ Las notificaciones no son soportadas en este navegador');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registrado correctamente');
      return true;
    } catch (error) {
      console.error(' Error registrando Service Worker:', error);
      return false;
    }
  }

  // Confirmación para logout
  async showLogoutConfirmation() {
    return this.showModalConfirmation(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión de la plataforma AGROSIG?',
      'Sí, cerrar sesión',
      'Cancelar'
    );
  }

  // Confirmación para eliminar comentarios
  async showDeleteConfirmation() {
    return this.showModalConfirmation(
      'Eliminar Comentario',
      '¿Estás seguro de que quieres eliminar este comentario?\nEsta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar'
    );
  }

  // Confirmación genérica
  async showConfirmation(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
    return this.showModalConfirmation(title, message, confirmText, cancelText);
  }

  // Modal de confirmación reutilizable
  async showModalConfirmation(title, message, confirmText, cancelText) {
    return new Promise((resolve) => {
      const modalBackdrop = document.createElement('div');
      modalBackdrop.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm';
      
      modalBackdrop.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 w-full border border-gray-200 transform transition-all duration-300 scale-95 animate-scale-in">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 rounded-full flex items-center justify-center mr-3">
              <span class="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">${title}</h3>
              <p class="text-sm text-gray-500 mt-1">Plataforma AGROSIG</p>
            </div>
          </div>
          
          <p class="text-gray-600 mb-6 text-base leading-relaxed whitespace-pre-line">
            ${message}
          </p>
          
          <div class="flex space-x-3">
            <button 
              id="cancelAction" 
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              ${cancelText}
            </button>
            <button 
              id="confirmAction" 
              class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      // Agregar el modal al documento
      document.body.appendChild(modalBackdrop);
      document.body.style.overflow = 'hidden';

      // Animación de entrada
      setTimeout(() => {
        const modal = modalBackdrop.querySelector('div');
        modal.classList.remove('scale-95');
        modal.classList.add('scale-100');
      }, 10);

      // Manejar confirmación
      document.getElementById('confirmAction').onclick = () => {
        this.closeModal(modalBackdrop);
        resolve(true);
      };

      // Manejar cancelación
      document.getElementById('cancelAction').onclick = () => {
        this.closeModal(modalBackdrop);
        resolve(false);
      };

      // Cerrar al hacer click fuera del modal
      modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) {
          this.closeModal(modalBackdrop);
          resolve(false);
        }
      };

      // Cerrar con tecla Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          this.closeModal(modalBackdrop);
          document.removeEventListener('keydown', handleEscape);
          resolve(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
    });
  }

  closeModal(modalBackdrop) {
    if (modalBackdrop) {
      const modal = modalBackdrop.querySelector('div');
      modal.classList.remove('scale-100');
      modal.classList.add('scale-95');
      
      setTimeout(() => {
        if (modalBackdrop.parentNode) {
          modalBackdrop.parentNode.removeChild(modalBackdrop);
        }
        document.body.style.overflow = '';
      }, 200);
    }
  }

  // Notificación de éxito
  async showSuccessNotification(message) {
    await this.showNotification('Éxito', message, 'success');
  }

  // Notificación de error
  async showErrorNotification(message) {
    await this.showNotification('Error', message, 'error');
  }

  // Notificación de información
  async showInfoNotification(message) {
    await this.showNotification('Información', message, 'info');
  }

  // Notificación principal
  async showNotification(title, message, type = 'info') {
    // Notificación del navegador
    if (this.registration && this.permission === 'granted') {
      try {
        const icon = type === 'success' ? '/icons/success.png' : 
                    type === 'error' ? '/icons/error.png' : 
                    '/icons/info.png';

        await this.registration.showNotification(title, {
          body: message,
          icon: icon || '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: type,
          requireInteraction: type === 'error'
        });
      } catch (error) {
        console.error('Error mostrando notificación push:', error);
        this.showFallbackNotification(title, message, type);
      }
    } else {
      // Fallback a notificación nativa
      this.showFallbackNotification(title, message, type);
    }
  }

  // Notificación de fallback
  showFallbackNotification(title, message, type) {
    if (typeof window !== 'undefined') {
      const emoji = type === 'success' ? '✅' : 
                   type === 'error' ? '❌' : 'ℹ️';
      
      // Puedes usar alert o console.log como fallback
      console.log(`${emoji} ${title}: ${message}`);
      
      // O mostrar un toast nativo si prefieres
      this.showNativeToast(title, message, type);
    }
  }

  // Toast nativo como alternativa
  showNativeToast(title, message, type) {
    // Buscar si ya existe un contenedor de toasts
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    toast.innerHTML = `
      <div class="flex items-center">
        <span class="font-semibold mr-2">${title}</span>
        <span>${message}</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 10);

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }

  // Solicitar permisos para notificaciones
  async requestNotificationPermission() {
    if (!this.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

  // Verificar si tiene permisos
  hasPermission() {
    return this.permission === 'granted';
  }
}

// Agregar estilos CSS para las animaciones
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes scale-in {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
  `;
  document.head.appendChild(style);
}

const notificationService = new NotificationService();
export default notificationService;