import { useAtomValue, useSetAtom } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { NoAutorizado } from "../pages/NoAutorizado";
import { useEffect } from "react";
import { clearAuthData } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  requireAuth = true 
}: ProtectedRouteProps) => {
  const rolUsuario = useAtomValue(userRolAtom);
  const setUserRol = useSetAtom(userRolAtom);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar consistencia entre localStorage y Jotai
    const storedRol = localStorage.getItem('userRol');
    const storedName = localStorage.getItem('userName');
    
    // Si requiere autenticación pero no hay datos válidos
    if (requireAuth) {
      if (!storedRol || !storedName || parseInt(storedRol) === 0) {
        console.warn('Datos de sesión inconsistentes. Limpiando...');
        clearAuthData();
        setUserRol(0);
        navigate('/login', { replace: true });
      }
    }
  }, [requireAuth, navigate, setUserRol]);

  // Si requiere autenticación y no hay rol (usuario no autenticado)
  if (requireAuth && (!rolUsuario || rolUsuario === 0)) {
    return <NoAutorizado />;
  }

  // Si se especificaron roles permitidos y el usuario no tiene uno de ellos
  if (allowedRoles && allowedRoles.length > 0) {
    if (!rolUsuario || !allowedRoles.includes(rolUsuario)) {
      return <NoAutorizado />;
    }
  }

  return <>{children}</>;
};
