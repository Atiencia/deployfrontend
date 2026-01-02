import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import AdminCard from "../components/admin/AdminCard";
import { UsersIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useLogout } from "../queries/listaQueries";
import { LoadingButton } from "../components/LoadingButton";

export default function AdminHome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const logout= useLogout()

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
          <div /> {/* Espacio izquierdo vacío o para navegación futura */}

          <div className="flex items-center gap-3">
            {userName && (
              <>
                <span className="text-gray-700 font-medium">
                  Hola <span className="font-semibold text-red-700">{userName}</span>!
                </span>
                {logout.isPending ?
                  <LoadingButton loading={true} loadingText="Cargando" children></LoadingButton>
                  :
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-700 text-white rounded-md shadow focus:outline-none"
                    onClick={() => logout.mutate()}
                  >
                    Logout
                  </button>
                }
              </>
            )}
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="pt-20 px-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>

          <section className="grid md:grid-cols-2 gap-6 mb-12">
            <AdminCard
              title="Gestión de Usuarios"
              description="Crear, editar y eliminar usuarios del sistema."
              icon={<UsersIcon className="h-6 w-6 text-red-700" />}
              onClick={() => navigate("/admin/gestion-roles")}
            />
            <AdminCard
              title="Gestión de Eventos"
              description="Organiza y edita los eventos misioneros."
              icon={<CalendarIcon className="h-6 w-6 text-red-700" />}
              onClick={() => navigate("/eventos")}
            />
          </section>
        </main>
      </div>
    </div>
  );
}