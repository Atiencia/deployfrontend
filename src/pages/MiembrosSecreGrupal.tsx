import { useAtomValue } from "jotai";
import { useState, useEffect } from "react";
import UserrList from "../components/UserList";
import { userRolAtom } from "../store/jotaiStore";
import { NoAutorizado } from "./NoAutorizado";
import { obtenerMisGrupos } from "../Services/secretariaGrupoService";
import type { grupo } from "../../types/evento";
import { useManejarSolicitud, useSolicitudesPendientes } from "../queries/gruposQueries";

function SolicitudCard({ usuario, grupo}: any) {
    const { mutate, isPending } = useManejarSolicitud()

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">

            {/* Datos del usuario */}
            <div className="flex items-center gap-3 overflow-hidden">
                {/* Avatar */}
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-lg shrink-0">
                    {usuario.nombre.charAt(0).toUpperCase()}{usuario.apellido.charAt(0).toUpperCase()}
                </div>

                {/* Textos con 'truncate' para que si el email es gigante no rompa todo */}
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {usuario.nombre} {usuario.apellido}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
                </div>
            </div>

            {/* Botones */}
            {/* CAMBIO: 'w-full sm:w-auto'. En móvil los botones ocupan todo el ancho para ser fáciles de tocar */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                {!isPending ? (
                    <>
                        <button
                            onClick={() => mutate({ id_grupo: grupo.id_grupo, id_usuario: usuario.id_usuario, accion: 'rechazado' })}
                            className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                        >
                            Rechazar
                        </button>
                        <button
                            onClick={() => mutate({ id_grupo: grupo.id_grupo, id_usuario: usuario.id_usuario, accion: 'aprobado' })}
                            className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-300 shadow-sm transition-colors"
                        >
                            Aceptar
                        </button>
                    </>
                ) : (
                    <div className="text-sm text-gray-300 mx-auto">Procesando...</div>
                )}
            </div>
        </div>
    );
}



export function SolicitudesComponente({ grupo }: { grupo: grupo }) {
    //const [solicitudes, setSolicitudes] = useState<User[]>([]);
    const { data: solicitudes } = useSolicitudesPendientes(grupo.id_grupo)



    return (
        <>
            <div className="max-w-6xl mx-auto">
                {/* Encabezado */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Ingreso</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Gestiona quien puede entrar a <span className="font-medium text-gray-800">{grupo.nombre}</span>
                        </p>
                    </div>
                    {solicitudes && (
                        <span className="self-start sm:self-center bg-red-50 text-red-300 px-3 py-1 rounded-full text-xs font-bold border border-red-100 whitespace-nowrap">
                            {solicitudes.length} pendientes
                        </span>
                    )}
                </div>

                {/* LISTA: Cambié a 'xl:grid-cols-2' para que en laptops normales sea 1 sola columna y no se aplaste */}
                {solicitudes && solicitudes.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {solicitudes.map((s: any) => (
                            <SolicitudCard
                                key={s.id_usuario}
                                usuario={s}
                                grupo = {grupo}
                            />
                        ))}
                    </div>
                ) : (
                    // ... (Tu estado vacío aquí) ...
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p>No hay solicitudes</p>
                    </div>
                )}
            </div>
        </>
    )
}


export default function UsuariosSecreGrupal() {
    const [_, setUserName] = useState<string | null>(null);
    const [grupos, setGrupos] = useState<grupo[]>([]);
    const rolUsuario = useAtomValue(userRolAtom)


    if (rolUsuario !== 5) {
        return <NoAutorizado></NoAutorizado>
    }

    useEffect(() => {
        const nombreGuardado = localStorage.getItem("userName");
        if (nombreGuardado) setUserName(nombreGuardado);

        const fetchGrupos = async () => {
            const response = await obtenerMisGrupos();
            setGrupos(response.grupos);
        };

        fetchGrupos();

    }, []);

    return (
        <div>
            { //contenido principal
                grupos.length > 0 ? (
                    grupos.map((grupo) => (
                        <>
                            <div key={grupo.id_grupo} className="mb-8">
                                <UserrList grupo_id={grupo.id_grupo} />
                            </div>
                            <div>
                                <div className="max-w-6xl mx-auto p-5">
                                    <SolicitudesComponente grupo={grupo} />
                                </div>
                            </div>
                        </>
                    ))
                ) : (
                    <p>No hay grupos asignados.</p>
                )}
        </div>

    );
}