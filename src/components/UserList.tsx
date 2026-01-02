import UsuarioItem, { type User } from "./UserItem"
import { type Rol } from "../store/usuarioItemStore"
import { useState } from "react"
import { useRoles, useUsuarios } from "../queries/listaQueries"

// en un futuro implementar el paginado correctamente para el correcto renderizado

export default function UserrList({ grupo_id }: { grupo_id?: number }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRol, setFilterRol] = useState('');

    const usuarios = useUsuarios()
    const roles = useRoles()

    const usuariosFiltrados = usuarios.data ? usuarios.data.filter((usuario: User) => {
        const matchesSearch =
            usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase());

        const userRol = roles.data.find((r: Rol) => r.id_rol === usuario.id_rol);

        const matchesRol =
            filterRol === '' || userRol?.nombre === filterRol;

        return matchesSearch && matchesRol;
    }) : [];

    return (
        <>
            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Eventos */}
                <main className="p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Usuarios</h1>

                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o descripción..."
                            className="px-4 py-2 border rounded w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {roles.data ?
                            <select
                                value={filterRol}
                                onChange={(e) => setFilterRol(e.target.value)}
                                className="px-4 py-2 border rounded w-full"
                            >
                                <option value="">Todos los usuarios</option>
                                {[...new Set(roles.data.map((r: Rol) => r.nombre))].map((nombre: any) => (
                                    <option key={nombre} value={nombre}>{nombre}</option>
                                ))}
                            </select>
                            :
                            <select
                                value={filterRol}
                                onChange={(e) => setFilterRol(e.target.value)}
                                className="px-4 py-2 border rounded w-full"
                            >
                                <option value="">Todos los usuarios</option>
                            </select>
                        }
                    </div>

                    {/* Lista de usuarios */}
                    <ul>
                        <div className="flex items-start p-4 rounded-lg">
                            <div className="flex items-baseline-last w-full gap-6">
                                <p className="text-gray-600 text-sm leading-relaxed mb-1">id</p>
                                <div className="flex justify-between items-baseline-last w-full">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-1 w-2/3">
                                        Nombre
                                    </h2>
                                    <div className="flex items-center gap-4 w-full justify-around">
                                        <p className="text-gray-600 text-sm leading-relaxed mb-1">Documento</p>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-1 ">Rol del usuario</p>
                                        <section className="w-1/3"></section>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {usuariosFiltrados.length > 0 ? usuariosFiltrados.map((usuario: User) => (
                            <UsuarioItem key={usuario.id_usuario} user={usuario} grupo_id={grupo_id} />
                        ))
                            :
                            <p className="text-center">No se encontraron usuarios</p>
                        }
                    </ul>
                </main>
            </div>
        </>
    );
}