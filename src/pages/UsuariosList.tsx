// src/pages/UsuariosPage.tsx

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import UserrList from "../components/UserList";
import { NoAutorizado } from "./NoAutorizado";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import UsuariosSecreGrupal from "./MiembrosSecreGrupal";

export default function UsuariosPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const rolUsuario = useAtomValue(userRolAtom)

  useEffect(() => {
    const nombreGuardado = localStorage.getItem("userName");
    if (nombreGuardado) setUserName(nombreGuardado);
  }, []);


  if (rolUsuario === 3 || rolUsuario === 0)
  {
    return <NoAutorizado></NoAutorizado>
  }



  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-56">
        {/* Topbar */}
        <nav className="flex justify-between items-center px-20 py-4 bg-white shadow fixed top-0 right-0 left-0 md:left-56 z-30">
          <div />
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-gray-700 font-medium text-base">
                Hola <span className="font-semibold text-red-700">{userName}</span>!
              </span>
            )}
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="pt-20 px-8">
          {rolUsuario == 5 ? <UsuariosSecreGrupal /> : <UserrList />}
        </main>
      </div>
    </div>
  );
}