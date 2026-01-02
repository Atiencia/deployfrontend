import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import { LoadingSpinner } from "./LoadingComponents";
import type { User } from "./UserItem";
import { SolicitudesComponente } from "../pages/MiembrosSecreGrupal";
import { useEliminarMiembro, useGrupo, useSeguidoresDeGrupo } from "../queries/gruposQueries";

export default function IntegrantesList() {
    const { id } = useParams<{ id: string }>();

    if(!id) return toast.error('No hay un id especificado')

    const { data: grupo, isLoading: loadingGrupo, error: errorGrupo } = useGrupo(id);
    const { data: miembros, isLoading: loadingMiembros, error: errorMiembros } = useSeguidoresDeGrupo(parseInt(id));

    if (loadingGrupo || loadingMiembros) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-56 p-8 flex items-center justify-center">
                    <LoadingSpinner size="lg" message="Cargando integrantes..." />
                </main>
            </div>
        );
    }

    if (errorGrupo || errorMiembros) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-56 p-8">
                    <p className="text-red-500">{errorGrupo?.message || errorMiembros?.message}</p>
                </main>
            </div>
        );
    }

    if (!grupo || !miembros) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-56 p-8">
                    <p className="text-gray-500">No se encontró el grupo</p>
                </main>
            </div>
        );
    }

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-56 p-8">
                    <div className="p-4 max-w-4xl mx-auto space-y-8">
                        <div
                            style={{ backgroundImage: `url(${grupo.imagen_url})` }}
                            className="h-24 bg-cover bg-center rounded-xl mb-6 shadow-lg "
                        >
                            <div className="bg-red-700/60 h-full flex items-center justify-end p-2 w-full rounded-xl">
                                <h2 className="text-white text-3xl font-semibold">{grupo.nombre}</h2>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-8 ">Miembros</h3>

                            {miembros && miembros.length === 0 ? (
                                <p className="text-gray-500 italic text-center">Aun no tenemos miembros. Se el primero!</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    {miembros.map((miembro: User) => (
                                        <IntegrantesCard key={miembro.id_usuario} grupo_id={grupo.id_grupo} usuario= {miembro}/>
                                    ))}
                                </div>
                            )}

                        </div>

                        <div>
                            <div className="max-w-6xl mx-auto ">
                                <SolicitudesComponente grupo={grupo} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}

function IntegrantesCard({ usuario, grupo_id }: any) {
    const eliminarMiembro = useEliminarMiembro()

    const handleEliminarMiembro = async () => {
        eliminarMiembro.mutate({ id_grupo: grupo_id, id_usuario: usuario.id_usuario })
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">

            {/* Datos del usuario */}
            <div className="flex items-center gap-3 overflow-hidden">
                {/* Avatar */}
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-lg shrink-0">
                    {usuario?.nombre.charAt(0).toUpperCase()}{usuario?.apellido.charAt(0).toUpperCase()}
                </div>

                {/* Textos con 'truncate' para que si el email es gigante no rompa todo */}
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {usuario?.nombre} {usuario?.apellido}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{usuario?.email}</p>
                </div>
            </div>

            {/* Botones */}
            {/* CAMBIO: 'w-full sm:w-auto'. En móvil los botones ocupan todo el ancho para ser fáciles de tocar */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                {!eliminarMiembro.isPending ? (
                    <>
                        <button
                            onClick={handleEliminarMiembro}
                            className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-300 shadow-sm transition-colors"
                        >
                            Eliminar miembro
                        </button>
                    </>
                ) : (
                    <div className="text-sm text-gray-300 mx-auto">Procesando...</div>
                )}
            </div>
        </div>
    );
}