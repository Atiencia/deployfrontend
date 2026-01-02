import { Link, useNavigate, useParams } from "react-router-dom"
import type { grupo, Subgrupo } from "../../types/evento"
import instaIcon from "../assets/instagram.png"
import whatsIcon from "../assets/whatsapp.png"
import Sidebar from "../components/Sidebar"
import { useAtomValue } from "jotai"
import { userRolAtom } from "../store/jotaiStore"
import SubgrupoItem from "../components/SubgrupoComponent"
import { motion } from "framer-motion"
import { useGrupo, useSeguidoresDeGrupo } from "../queries/gruposQueries"
import { useEventosPorGrupo } from "../queries/eventosQueries"
import { useSubgruposPorGrupo } from "../queries/subgrupoQueries"
import type { User } from "../components/UserItem"

interface grupoItemProps {
    grupo: grupo
}

export function GruposItem({ grupo }: grupoItemProps) {
    const rolUsuario = useAtomValue(userRolAtom)
    const navigate = useNavigate()

    const handleClick = () => {
        if (rolUsuario === 3) {
            navigate(`/grupos/${grupo.id_grupo}`)
        }
        if (rolUsuario === 5) {
            navigate(`/editar-grupo/${grupo.id_grupo}`)
        }
    }

    return (
        <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:scale-[1.02] group"
            onClick={handleClick}
        >
            <div
                className="h-64 bg-cover bg-center flex flex-col justify-end p-5"
                style={{ backgroundImage: `url(${grupo.imagen_url})` }}
            >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/70 transition-colors duration-300" />

                <div className="relative z-10 text-white">
                    <h1 className="text-2xl font-bold">{grupo.nombre}</h1>
                    <p
                        className="
          mt-2 text-sm opacity-0 group-hover:opacity-100
          transition-opacity duration-500 ease-in-out
        "
                    >
                        {grupo.descripcion}
                    </p>

                    <div className="flex gap-3 mt-4 opacity-100 group-hover:opacity-80 transition-opacity duration-500">
                        <Link to={`https://instagram.com/${grupo.usuario_instagram}`} target="_blank">
                            <img src={instaIcon} width={28} className="hover:scale-110 transition-transform" />
                        </Link>
                        <Link to={grupo.contacto_whatsapp} target="_blank">
                            <img src={whatsIcon} width={28} className="hover:scale-110 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default function GrupoView() {
    const { id } = useParams<{ id: string }>();
    if(!id) return <p>No se proporciono un id valido</p>

    const {data: grupo} = useGrupo(id)
    const {data: eventos} = useEventosPorGrupo(parseInt(id))
    const {data: miembros} = useSeguidoresDeGrupo(parseInt(id))
    const {data: subgrupos} = useSubgruposPorGrupo(parseInt(id))
    const navigate = useNavigate()

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-56 p-8">
                    <div className="p-4 max-w-4xl mx-auto space-y-8">
                        <div
                            style={{ backgroundImage: `url(${grupo?.imagen_url})` }}
                            className="h-24 bg-cover bg-center rounded-xl mb-6 shadow-lg "
                        >
                            <div className="bg-red-700/60 h-full flex items-center justify-end p-2 w-full rounded-xl">
                                <h2 className="text-white text-3xl font-semibold">{grupo?.nombre}</h2>
                            </div>
                        </div>

                        {/* Info del grupo */}
                        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-8 ">{grupo?.nombre} es...</h2>
                                    <p className="text-gray-700">{grupo?.descripcion}</p>
                                    <div>
                                        <label className="block text-gray-600 text-sm font-medium">¿A donde vamos?</label>
                                        <p className="text-gray-700">{grupo?.zona}</p>
                                    </div>
                                    <div className="gap-4">
                                        <div className="flex gap-3 mt-4 opacity-100 group-hover:opacity-80 transition-opacity duration-500">
                                            <Link to={`https://instagram.com/${grupo?.usuario_instagram}`} target="_blank" className="">
                                                <img src={instaIcon} width={35} className="hover:scale-110 transition-transform p-0.5 rounded-md" />
                                            </Link>
                                            <Link to={grupo ? grupo.contacto_whatsapp : ''} target="_blank">
                                                <img src={whatsIcon} width={35} className="hover:scale-110 transition-transform p-0.5 rounded-md" />
                                            </Link>
                                            <p className="text-gray-700 w-2/4 text-xs">Te esperamos! Siguenos y entra al grupo de WhatsApp tambien!</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <img src={grupo?.imagen_url} alt="" className="rounded-full h-64 flex justify-end" />
                                </div>
                            </div>
                        </div>


                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-8 ">Subgrupos</h3>
                            {subgrupos && subgrupos.length === 0 ? (
                                <p className="text-gray-600 italic text-center">Aun no tenemos subgrupos por aca.</p>
                            ) : (
                                <div className="w-full grid grid-cols-1 md:grid-cols-2">
                                    {subgrupos && subgrupos.map((subgrupo: Subgrupo) => (
                                        <SubgrupoItem key={subgrupo.id_subgrupo} subgrupo={subgrupo}></SubgrupoItem>
                                    ))}
                                </div>
                            )}

                        </div>


                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-8 ">Eventos</h3>

                            {eventos && eventos.length === 0 ? (
                                <p className="text-gray-600 italic text-center">No hay eventos programados para este grupo.</p>
                            ) : (

                                <ul>
                                    {eventos?.map((evento: any) => (
                                        <motion.li
                                            key={evento.id_evento}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, ease: "easeOut" }}
                                            whileHover={{ scale: 1.02 }}
                                            className="list-none relative flex items-center w-full"
                                            onClick={() =>navigate(`/eventos/${evento.id_evento}`)}
                                        >
                                            <div className="flex items-start p-4 mb-4 bg-white rounded-lg shadow-sm w-full cursor-default">
                                                <div className="flex-1">
                                                    <h2 className="text-lg font-semibold text-gray-800 mb-1">
                                                        {evento.nombre}
                                                    </h2>
                                                    <p className="text-gray-600 text-sm leading-relaxed mb-1 w-2/3">
                                                        {evento.descripcion}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        <strong>Grupo:</strong> {evento.nombre_grupo || 'Sin grupo asignado'} |{" "}
                                                        <strong>Fecha:</strong> {new Date(evento.fecha).toLocaleDateString("es-AR")} |{" "}
                                                        <strong>Lugar:</strong> {evento.lugar}
                                                    </p>

                                                    <p className="text-sm text-gray-700 mb-2">
                                                        <strong>Cupos disponibles:</strong>{" "}
                                                        <span className={`font-semibold ${(evento.cupos_disponibles || 0) <= 5
                                                            ? 'text-red-600'
                                                            : (evento.cupos_disponibles || 0) <= 10
                                                                ? 'text-yellow-600'
                                                                : 'text-green-600'
                                                            }`}>
                                                            {evento.cupos_disponibles !== undefined ? evento.cupos_disponibles : evento.cupos}
                                                        </span>
                                                        {evento.cupos && ` / ${evento.cupos}`}

                                                        {/* Indicador de suplentes si tiene cupos_suplente */}
                                                        {evento.cupos_suplente && evento.cupos_suplente > 0 && (
                                                            <span className="ml-3 text-yellow-600">
                                                                | 📋 Lista de espera: {evento.cupos_suplente} lugares
                                                            </span>
                                                        )}
                                                    </p>
                                                    <span className="inline-block mt-3 px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded">
                                                        {evento.estado}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </div>


                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-8 ">Miembros</h3>

                            {miembros && miembros.length === 0 ? (
                                <p className="text-gray-600 italic text-center">Aun no tenemos miembros. Se el primero!</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {miembros && miembros.map((miembro: User) => (
                                        <div key={miembro.id_usuario} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                                            <h4 className="text-lg font-semibold text-gray-800">{miembro.nombre} {miembro.apellido}</h4>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}