import { useNavigate } from "react-router-dom"
import type { grupo, grupoSeguido } from "../../types/evento"
import instaIcon from "../assets/instagram blanco.png"
import whatsIcon from "../assets/whatsapp blanco.png"
import seguir from "../assets/add.png"
import siguiendo from "../assets/check-circle.png"
import { toast } from "sonner"
import Sidebar from "./Sidebar"
import { useAtomValue } from "jotai"
import { userRolAtom } from "../store/jotaiStore"
import { useGrupos, useGruposSeguidos, useSeguirGrupo } from "../queries/gruposQueries"
import LoadingSpinner from "./LoadingComponents"

interface grupoItemProps {
    grupo: grupo
}

//arreglar para tener vista biewer

export function GruposItem({ grupo }: grupoItemProps) {
    const rolUsuario = useAtomValue(userRolAtom);
    const navigate = useNavigate();
    //if(!grupo.activo && rolUsuario !== 2) return
    const { data: gruposSeguidos } = useGruposSeguidos(rolUsuario);
    const { mutate: seguirGrupo } = useSeguirGrupo();

    const seguido =
        Array.isArray(gruposSeguidos) &&
        gruposSeguidos.some((g) => g.id_grupo === grupo.id_grupo);

    const handleClick = () => {
        if (rolUsuario === 3) navigate(`/grupos/${grupo.id_grupo}`);
    };

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (rolUsuario === 0)
            return toast.message("Para seguir un grupo debes loguearte", {
                style: { backgroundColor: "firebrick" },
            });
        seguirGrupo(grupo.id_grupo);
    };

    return (
        <div
            className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:scale-[1.02] group cursor-pointer"
        >
            <div
                className="h-48 bg-cover bg-center flex flex-col justify-end p-5"
                style={{ backgroundImage: `url(${grupo.imagen_url})` }}
                onClick={handleClick}
            >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/70 transition-colors duration-300" />

                <div className="relative z-10 text-white">
                    <h1 className="text-2xl font-bold">{grupo.nombre}</h1>

                    <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-32">
                        <p className="mt-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
                            {grupo.descripcion}
                        </p>
                    </div>

                    <div className="flex justify-between gap-3 mt-4 opacity-100 group-hover:opacity-80 transition-opacity duration-500">
                        <div className="flex gap-3">
                            <a
                                href={`https://instagram.com/${grupo.usuario_instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img src={instaIcon} width={28} className="hover:scale-110 transition-transform" />
                            </a>

                            <a
                                href={grupo.contacto_whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img src={whatsIcon} width={28} className="hover:scale-110 transition-transform" />
                            </a>
                        </div>

                        <div onClick={handleFollow}>
                            <img
                                src={seguido ? siguiendo : seguir}
                                width={28}
                                className="hover:scale-110 transition-transform"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function GruposListUser() {
    const rolUsuario = useAtomValue(userRolAtom)
    const { data: grupos, isLoading: loading } = useGrupos()
    const { data: gruposSeguidos } = useGruposSeguidos(rolUsuario)

    if (loading) {
        return (
            <div className="min-h-screen flex bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col md:ml-56">
                    <main className="pt-10 px-8 flex-1 flex justify-center items-center">
                        <LoadingSpinner size="lg" message="Cargando grupos..." />
                    </main>
                </div>
            </div>
        );
    }

    const gruposAprobados = gruposSeguidos ? gruposSeguidos.filter((g: grupoSeguido) => g.status === 'aprobado') : [];
    const gruposPendientes = gruposSeguidos ? gruposSeguidos.filter((g: grupoSeguido) => g.status === 'pendiente') : [];

    //obtenemos el objeto grupo a partir de cada uno de los gruposSeguidos, que tienen otros atributos
    const misGrupos =  gruposAprobados.reduce((acc: any, g: grupoSeguido) => {
        const grupoEncontrado = grupos?.find(grupo => grupo.id_grupo === g.id_grupo);
        if (grupoEncontrado) {
            acc.push(grupoEncontrado);
        }
        return acc;
    }, [] as grupo[]);

    const gruposPend = gruposPendientes.reduce((acc: any, g: grupoSeguido) => {
        const grupoEncontrado = grupos?.find(grupo => grupo.id_grupo === g.id_grupo);
        if (grupoEncontrado) {
            acc.push(grupoEncontrado);
        }
        return acc;
    }, [] as grupo[]);

    const restoGrupos = grupos && gruposSeguidos? grupos.filter(g => !gruposSeguidos.some((sg: grupoSeguido) => sg.id_grupo === g.id_grupo)) : [];


    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-56 p-8">
                    <div className="max-w-6xl mx-auto p-5">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 ">
                            Mis grupos
                        </h2>

                        {misGrupos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {misGrupos.map((g: grupo) => <GruposItem grupo={g} key={g.id_grupo} />)}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 col-span-2">Los grupos a los que sigas apareceran aca!</p>
                        )}
                    </div>

                    <div className="max-w-6xl mx-auto p-5">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 ">
                            Solicitudes pendientes
                        </h2>

                        {gruposPend && gruposPend.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {gruposPend.map((g: grupo) => <GruposItem grupo={g} key={g.id_grupo} />)}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 col-span-2">No hay solicitudes pendientes.</p>
                        )}

                    </div>
                    <div className="max-w-6xl mx-auto p-5">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 ">
                            Otros grupos
                        </h2>


                        {restoGrupos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8"
                            >
                                {restoGrupos.map((g) => <GruposItem grupo={g} key={g.id_grupo} />)}
                            </div>)
                            : (
                                <p className="text-center text-gray-500 col-span-2">Cargando...</p>
                            )}

                    </div>
                </main >
            </div >
        </>
    )
}