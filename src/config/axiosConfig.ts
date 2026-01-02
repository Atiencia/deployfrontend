import axios from 'axios';
import { redirectToLogin } from '../utils/authUtils';
import { API_BASE_URL } from './api';

// Crear una instancia de axios con configuración base
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de respuestas para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (Unauthorized) o 403 (Forbidden)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Solo redirigir si NO estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        console.warn('Token inválido o expirado. Limpiando sesión...');
        redirectToLogin();
      }
    }
    
    return Promise.reject(error);
  }
);

// Interceptor global para fetch
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    
    // Obtener la URL de la petición
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
    
    // No interceptar rutas de autenticación (login, register, etc.)
    const isAuthRoute = url.includes('/auth/login') || 
                        url.includes('/auth/register');
    
    // Si la respuesta es 401 o 403, NO es una ruta de autenticación, y NO estamos en login
    if ((response.status === 401 || response.status === 403) && 
        !isAuthRoute && 
        !window.location.pathname.includes('/login')) {
      console.warn('Token inválido o expirado (fetch). Limpiando sesión...');
      redirectToLogin();
      // Clonar la respuesta para que pueda ser leída nuevamente
      return response.clone();
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export default axiosInstance;
