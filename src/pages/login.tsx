import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputField from "../components/input";
import logo from "../assets/Logo-IM.png";
import { useLogin } from "../queries/listaQueries";
import { LoadingButton } from "../components/LoadingButton";
import { clearAllCache } from "../hooks/useCachedData";
import { useSetAtom } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { useNavigate } from "react-router-dom";
import { clearAuthData, setAuthToken } from "../utils/authUtils";
import { AUTH_URL } from '../config/api';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarReenvio, setMostrarReenvio] = useState(false);
  const [enviandoVerificacion, setEnviandoVerificacion] = useState(false);
  const setUserRol = useSetAtom(userRolAtom)
  const navigate = useNavigate();
  
  // Limpiar sesión al cargar login (silenciosamente)
  useEffect(() => {
    // Solo limpiar si hay datos de sesión previos
    const hasOldSession = localStorage.getItem('userRol') || localStorage.getItem('userName');
    if (hasOldSession) {
      clearAuthData();
      setUserRol(0);
    }
  }, [setUserRol]);
  const { isPending, mutate } = useLogin({
    onSuccess: (data: any) => {
      // Limpiar cualquier dato de sesión anterior antes de establecer los nuevos
      clearAuthData();
      
      // Guardar el token si viene en la respuesta (solución híbrida)
      if (data.token) {
        setAuthToken(data.token);
        console.log('✅ Token guardado en localStorage');
      }
      
      toast.success(`Bienvenido, ${data.nombre}`)
      setUserRol(data.rol)
      localStorage.setItem('userRol', data.rol.toString());
      localStorage.setItem('userName', data.nombre);
      clearAllCache();
      navigate('/home')
    },
    onError: (error: any) => {
      if (error.emailNoVerificado) {
        setMostrarReenvio(true);
        toast.error(error.message, { autoClose: 5000 });
        return;
      }
      console.error('Error en login:', error.message);
      toast.error(error.message || 'Ocurrió un error en el inicio de sesión')
    }
  })

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("El usuario es obligatorio");
      return;
    }
    if (!password.trim()) {
      toast.error("La contraseña es obligatoria");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    mutate({ username, password })
  };

  const handleReenviarVerificacion = async () => {
    if (!username.trim()) {
      toast.error("Por favor, ingresa tu correo electrónico");
      return;
    }

    setEnviandoVerificacion(true);

    try {
      const response = await fetch(`${AUTH_URL}/reenviar-verificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setMostrarReenvio(false);
      } else {
        toast.error(data.message || "Error al reenviar el correo");
      }
    } catch (error) {
      toast.error("No se pudo conectar al servidor");
    } finally {
      setEnviandoVerificacion(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-red-100">
        <div className="w-full px-4 max-w-md flex flex-col items-center justify-center">
          <div className="flex flex-col items-center mb-4 mt-2">
            <img src={logo} alt="Logo" className="w-24 h-24 drop-shadow-lg" />
          </div>
          <form onSubmit={handleLogin} className="w-full flex flex-col items-center gap-2">
            <InputField
              type="text"
              placeholder="EMAIL"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            />
            <InputField
              type="password"
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            {isPending ?
              <LoadingButton loading={true} loadingText="Cargando" children></LoadingButton>
              :
              <button
                type="submit"
                className="w-full bg-red-700 text-white py-3 rounded-xl font-bold text-xl shadow-lg focus:outline-none mt-4"
              >
                Login
              </button>
            }
          </form>

          {/* Mensaje y botón para reenviar verificación */}
          {mostrarReenvio && (
            <div className="mt-4 w-full bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="text-yellow-800 text-sm mb-2">
                Tu correo electrónico no ha sido verificado. Por favor, revisa tu bandeja de entrada.
              </p>
              <button
                onClick={handleReenviarVerificacion}
                disabled={enviandoVerificacion}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {enviandoVerificacion ? "Enviando..." : "Reenviar correo de verificación"}
              </button>
            </div>
          )}

          <div className="mt-3 flex justify-between w-full text-sm">
            <a href="/register" className="text-red-600 hover:underline">Registrarme</a>
            <a href="/recuperar-contrasena" className="text-red-600 hover:underline">¿Olvidaste tu contraseña?</a>
          </div>
          <div className="mt-6 flex justify-center w-full">
            <a href="/home" className="px-4 py-2 bg-white border border-red-600 text-red-700 rounded-lg font-medium shadow hover:bg-red-50 transition text-sm">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </>
  );
}