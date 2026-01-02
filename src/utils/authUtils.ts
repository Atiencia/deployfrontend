// Utilidad centralizada para limpiar la autenticación
export const clearAuthData = () => {
  // Limpiar localStorage
  localStorage.removeItem('userRol');
  localStorage.removeItem('userName');
  
  // Limpiar sessionStorage por si acaso
  sessionStorage.clear();
  
  // Limpiar cookies del lado del cliente (aunque las httpOnly solo se limpian en servidor)
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

// Verificar si hay un token válido
export const isAuthenticated = (): boolean => {
  const userRol = localStorage.getItem('userRol');
  return !!userRol && parseInt(userRol) > 0;
};

// Redirigir al login con limpieza completa
export const redirectToLogin = () => {
  clearAuthData();
  window.location.href = '/login';
};
