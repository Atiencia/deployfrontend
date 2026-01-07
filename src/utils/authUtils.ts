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

// Guardar el token de autenticación
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Verificar si hay un token válido
export const isAuthenticated = (): boolean => {
  const userRol = localStorage.getItem('userRol');
  const token = getAuthToken();
  return (!!userRol && parseInt(userRol) > 0) || !!token;
};

// Redirigir al login con limpieza completa
export const redirectToLogin = () => {
  clearAuthData();
  window.location.href = '/login';
};
