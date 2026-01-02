import { useAtomValue, useSetAtom } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { lazy, Suspense, useEffect } from "react";
import LoadingSpinner from "../components/LoadingComponents";
import { clearAuthData } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";

const ViewerHome = lazy(() => import("./ViewerHome"));
const AdminHome = lazy(() => import("./AdminHome"));
const SecretaryHome = lazy(() => import("./SecretaryHome"));
const UserHome = lazy(() => import("./UserHome"));
const SecretariaGrupalHome = lazy(() => import("./SecretariaGrupalHome"));


const LoadingScreen = () => (
  <div className="h-lvh flex justify-center">
    <LoadingSpinner></LoadingSpinner>
 </div> 
);

export default function Home() {
  const rolUsuario = useAtomValue(userRolAtom);
  const setUserRol = useSetAtom(userRolAtom);
  const navigate = useNavigate();
  
  console.log('Rol usuario actual:', rolUsuario, typeof rolUsuario);

  useEffect(() => {
    // Verificar consistencia de datos al cargar
    const storedRol = localStorage.getItem('userRol');
    const storedName = localStorage.getItem('userName');
    
    // Si hay inconsistencia entre el estado y el localStorage
    if (rolUsuario && (!storedRol || !storedName)) {
      console.warn('Datos de sesión inconsistentes. Limpiando...');
      clearAuthData();
      setUserRol(0);
    }
    
    // Si el rol en localStorage no coincide con Jotai
    if (storedRol && parseInt(storedRol) !== rolUsuario) {
      console.warn('Rol inconsistente entre localStorage y estado. Sincronizando...');
      const parsedRol = parseInt(storedRol);
      if (parsedRol > 0 && storedName) {
        setUserRol(parsedRol);
      } else {
        clearAuthData();
        setUserRol(0);
      }
    }
  }, [rolUsuario, setUserRol, navigate]);
  const getRoleComponent = () => {
    switch (rolUsuario) {
      case 1: 
      case 2:
        return <AdminHome />;
      case 3:
        return <UserHome />;
      case 4:
        return <SecretaryHome />;
      case 5:
        return <SecretariaGrupalHome />;
      default:
        return <ViewerHome />;
    }
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {getRoleComponent()}
    </Suspense>
  );
}