import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SecretaryCard from "../components/SecretaryCard";
import VersiculoDiario from "../components/VersiculoDiario";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useLogout } from "../queries/listaQueries";
import { LoadingButton } from "../components/LoadingButton";

export default function SecretaryHome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const logout = useLogout();

  useEffect(() => {
    const nombreGuardado = localStorage.getItem("userName");
    if (nombreGuardado) setUserName(nombreGuardado);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-56">
        {/* Topbar */}
        <nav className="flex justify-between items-center px-20 py-4 bg-white shadow fixed top-0 right-0 left-0 md:left-56 z-30">
          <div />

          <div className="flex items-center gap-3">
            {userName && (
              <>
                <span className="text-gray-700 font-medium">
                  Hola! <span className="font-semibold text-red-700">{userName}</span>
                </span>
                {logout.isPending ? (
                  <LoadingButton loading={true} loadingText="Cargando" children />
                ) : (
                  <button
                    className="px-4 py-2 bg-red-700 text-white rounded-md transition shadow transform hover:scale-105 duration-200"
                    onClick={() => logout.mutate()}
                  >
                    Logout
                  </button>
                )}
              </>
            )}
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="pt-20 px-8 pb-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Secretaría</h1>

          {/* Cards de funcionalidades */}
          <section className="grid md:grid-cols-2 gap-6 mb-12">
            <SecretaryCard
              title="Gestión de Eventos"
              description="Crea, edita y organiza los eventos misioneros."
              icon={<CalendarIcon className="h-6 w-6 text-red-700" />}
              onClick={() => navigate("/eventos")}
            />
            <SecretaryCard
              title="Generar Listas"
              description="Prepara listas de asistencia, transporte y logística."
              icon={<ClipboardDocumentListIcon className="h-6 w-6 text-red-700" />}
              onClick={() => navigate("/eventos/lista/participantes")}
            />
            <SecretaryCard
              title="Grupos Activos"
              description="Consulta los grupos disponibles y sus integrantes."
              icon={<UsersIcon className="h-6 w-6 text-red-700" />}
              onClick={() => navigate("/grupos")}
            />
            <SecretaryCard
              title="Salidas Próximas"
              description="Revisa las salidas programadas y sus detalles."
              icon={<MapPinIcon className="h-6 w-6 text-red-700" />}
              onClick={() => navigate("/eventos?category=salida")}
            />
          </section>

          {/* Versículo del Día */}
          <VersiculoDiario />

        </main>
      </div>
    </div>
  );
}