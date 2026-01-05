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
    // Si el error es 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Solo redirigir si NO estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        console.warn('Sesión expirada o no autenticado:', error.config?.url);
        console.warn('Status:', error.response?.status, 'Data:', error.response?.data);
        redirectToLogin();
      }
    }
    // Para 403, solo loguear pero NO desloguear (puede ser falta de permisos)
    if (error.response?.status === 403) {
      console.warn('Acceso denegado (403):', error.config?.url);
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
    
    // Solo redirigir en 401, NO en 403
    if (response.status === 401 && 
        !isAuthRoute && 
        !window.location.pathname.includes('/login')) {
      console.warn('Sesión expirada (fetch):', url);
      console.warn('Status:', response.status);
      redirectToLogin();
      // Clonar la respuesta para que pueda ser leída nuevamente
      return response.clone();
    }
    
    // Para 403, solo loguear
    if (response.status === 403) {
      console.warn('Acceso denegado (fetch - 403):', url);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export default axiosInstance;
