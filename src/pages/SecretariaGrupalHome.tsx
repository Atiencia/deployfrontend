import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SecretaryCard from "../components/SecretaryCard";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import CalendarioEventos from "../components/user/CalendarioEventos";
import { LoadingSpinner } from "../components/LoadingComponents";
import { useEventosGrupo } from "../queries/secretariaGrupoQueries";
import { useLogout } from "../queries/listaQueries";
import { useMisGruposSecretaria } from "../queries/secretariaGrupoQueries";
import { useAtom } from "jotai";
import { userRolAtom } from "../store/jotaiStore";

export default function SecretariaGrupalHome() {
  const navigate = useNavigate();
  const [rolUsuario] = useAtom(userRolAtom);
  const { data: infoSecretaria, isLoading: loading } = useMisGruposSecretaria(rolUsuario)
  const grupoId = infoSecretaria?.grupos?.[0]?.id_grupo || 0;
  const { data: eventosGrupo, isLoading: loadingCalendario } = useEventosGrupo(grupoId);
  const [userName, setUserName] = useState<string | null>(null);

  const logout = useLogout()

  useEffect(() => {
    const nombreLocal = localStorage.getItem("userName");
    if (nombreLocal) {
      setUserName(nombreLocal);
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-56">
        {/* Topbar */}
        <nav className="flex justify-between items-center px-20 py-4 bg-white shadow fixed top-0 right-0 left-0 md:left-56 z-30">
          <div />

          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium text-base">
              Hola <span className="font-semibold text-red-700">{userName ?? "Usuario"}</span>!
            </span>
            <button
              type="button"
              className="px-4 py-2 bg-red-700 text-white rounded-md shadow focus:outline-none disabled:opacity-60 min-w-[100px]"
              onClick={() => {
                logout.mutate();
              }}
              disabled={logout.isPending}
            >
              {logout.isPending ? "Cerrando..." : "Logout"}
            </button>
          </div>
        </nav>

        {/* Contenido principal */}
        < main className="pt-20 px-8 pb-12" >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Panel de Secretaría Grupal</h1>

          {/* Información de grupos asignados */}
          {
            loading ? (
              <p className="text-gray-600 mb-6">Cargando grupos asignados...</p>
            ) : infoSecretaria && infoSecretaria.grupos.length > 0 ? (
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Gestionas {infoSecretaria.grupos.length} {infoSecretaria.grupos.length === 1 ? 'grupo' : 'grupos'}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {infoSecretaria.grupos.map((grupo) => (
                    <span
                      key={grupo.id_grupo}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                    >
                      {grupo.nombre}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  ⚠️ No tienes grupos asignados. Contacta al administrador.
                </p>
              </div>
            )
          }

          {/* CALENDARIO DE EVENTOS */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Calendario de Eventos</h2>

              {/* Leyenda */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500"></span>
                  <span className="text-gray-600">Eventos de Mi Grupo</span>
                </div>
              </div>
            </div>

            {loadingCalendario ? (
              <div className="flex justify-center items-center bg-white p-6 rounded-lg shadow-md border h-64">
                <LoadingSpinner message="Cargando calendario..." />
              </div>
            ) : (
              <CalendarioEventos
                misEventos={eventosGrupo?.eventos || []}
                eventosIM={[]}
              />
            )}
          </section>

          {/* CARDS DE GESTIÓN */}
          <section className="grid md:grid-cols-2 gap-6 mb-12">
            <SecretaryCard
              title="Gestión de Eventos"
              description="Crea, edita y organiza los eventos de tus grupos."
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
              title="Mis Grupos"
              description="Consulta los grupos que administras y sus integrantes."
              icon={<UsersIcon className="h-6 w-6 text-red-700" />}
              onClick={() => navigate("/grupos")}
            />
            <SecretaryCard
              title="Salidas Próximas"
              description="Revisa las salidas programadas de tus grupos."
              icon={<MapPinIcon className="h-6 w-6 text-red-700" />}
              onClick={() => navigate("/eventos")}
            />
          </section>
        </main >
      </div >
    </div >
  );
}