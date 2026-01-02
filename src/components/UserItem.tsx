import { type Rol } from "../store/usuarioItemStore"
import { Popover } from "./poptsx/Popover"
import { toast } from "sonner"
import { LoadingSpinner } from "./LoadingComponents"
import { useAtomValue } from "jotai"
import { userRolAtom } from "../store/jotaiStore"
import { useAsignarRol, useRoles } from "../queries/listaQueries"
import { useEliminarMiembro } from "../queries/gruposQueries"


export type User = {
    nombre: string,
    apellido: string,
    id_usuario: number,
    dni: number,
    id_rol: number,
    email?: string,
}

type UsuarioItemProp =
    {
        user: User,
        grupo_id?: number
    }



export default function UsuarioItem({ user, grupo_id }: UsuarioItemProp) {
    const rolUsuario = useAtomValue(userRolAtom);
    const roles = useRoles();
    const setRol = useAsignarRol();
    const eliminarMiembro = useEliminarMiembro()

    const id = (rolId: number) => `${user.id_usuario}-${rolId}`;
    const userRol = roles.data ? roles.data.find((r: Rol) => r.id_rol === user.id_rol) : 'cargando...';

    const handleEliminarMiembro = async () => {
        if (!grupo_id) return toast.error('No se proporciono el id del grupo')
        eliminarMiembro.mutate({ id_grupo: grupo_id, id_usuario: user.id_usuario })
    }

    return (
        <div>
            <div className="flex items-start p-3 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex  w-full gap-6 items-center">
                    <p className="text-gray-600 text-sm leading-relaxed mb-1">{user.id_usuario}</p>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex-col w-full">
                            <h2 className="text-lg font-semibold text-gray-800 mb-1 w-2/3">
                                {user.nombre} {user.apellido}
                            </h2>
                            {userRol && rolUsuario == 5 &&
                                <div className="">
                                    <p className="text-xs">{userRol.nombre}</p>
                                </div>
                            }
                        </div>
                        <div className="flex items-center gap-4 w-full justify-around">
                            <p className="text-gray-600 text-sm leading-relaxed mb-1">{user.dni}</p>
                            {
                                (rolUsuario == 2 || rolUsuario == 3) &&
                                <Popover triggerLabel={userRol ? userRol.nombre : 'Cargando...'} >
                                    {
                                        roles.isLoading ? (
                                            <div className="flex items-center justify-center p-2">
                                                <LoadingSpinner size="sm" message="" />
                                            </div>
                                        ) : (
                                            roles.data.map((r: Rol) => (
                                                <button
                                                    key={id(r.id_rol)}
                                                    className="hover:bg-[#C04A4A] hover:text-white rounded-sm w-full flex justify-center p-0.5 items-center"
                                                    onClick={() => { setRol.mutate({ rol: r.nombre, usuarioId: user.id_usuario }); }} // revisar ese reload, podria ser un query
                                                >
                                                    {r.nombre}
                                                </button>
                                            ))
                                        )
                                    }
                                </Popover>
                            }
                            {
                                (rolUsuario === 5) && (
                                    <button className="bg-gray-400 hover:bg-red-400 text-white px-4 py-2 rounded ml-2 text-sm"
                                        onClick={handleEliminarMiembro}>
                                        Eliminar miembro
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}