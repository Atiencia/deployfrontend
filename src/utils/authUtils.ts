// Utilidad centralizada para limpiar la autenticación
export const clearAuthData = () => {
  // Limpiar localStorage
  localStorage.removeItem('userRol');
  localStorage.removeItem('userName');
  localStorage.removeItem('authToken'); // ← Nuevo: limpiar token
  
  // Limpiar sessionStorage por si acaso
  sessionStorage.clear();
  
  // Limpiar cookies del lado del cliente (aunque las httpOnly solo se limpian en servidor)
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

// Obtener el token de autenticación
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Decodificar el token JWT sin validar (solo para leer la expiración)
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

// Verificar si el token ha expirado
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // Si no se puede decodificar, considerarlo expirado
  }
  
  // exp está en segundos, Date.now() en milisegundos
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// Guardar el token de autenticación
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Verificar si hay un token válido
export const isAuthenticated = (): boolean => {
  const userRol = localStorage.getItem('userRol');
  const token = getAuthToken();
  
  // Si no hay token ni rol, no está autenticado
  if (!token && (!userRol || parseInt(userRol) === 0)) {
    return false;
  }
  
  // Si hay token, verificar si está expirado
  if (token) {
    if (isTokenExpired(token)) {
      console.warn('⚠️ Token expirado, limpiando sesión...');
      clearAuthData();
      return false;
    }
    return true;
  }
  
  // Si solo hay rol pero no token (compatibilidad con cookies)
  return !!userRol && parseInt(userRol) > 0;
};

// Redirigir al login con limpieza completa
export const redirectToLogin = () => {
  clearAuthData();
  window.location.href = '/login';
};
