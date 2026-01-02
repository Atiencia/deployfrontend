import { create } from "zustand";
import type { User } from "../components/UserItem";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { API_URL, AUTH_URL } from '../config/api';

interface UsuarioItemState {
    usuarios: User[]
    roles: Rol[]
    busqueda: string;
    paginaActual: number;
    usuariosPorPagina: number;

    setPaginaActual: (nroPagina: number) => void;
    setNroUsuariosPorPagina: (nroUsuarios: number) => void;
    setRol: (rol: string, usuarioId: number) => void;
    setBusqueda: (busqueda: string) => Promise<void>;
    fetchRoles: () => Promise<Rol[]>;
    useFetchRoles: () => { status: "error" | "success" | "pending"; data: Rol[] | undefined; error: Error | null; };
    fetchUsuarios: (search?: string) => Promise<void>
}

export type Rol = {
    id_rol: number,
    nombre: string,
}

let timeout: ReturnType<typeof setTimeout>;

export const useUsuarioItemStore = create<UsuarioItemState>((set, get) => ({
    //estado incial,
    usuarios: [],
    roles: [],
    busqueda: '',
    paginaActual: 1,
    usuariosPorPagina: 50,


    setRol: async (rol, usuarioId) => {
        try {
            const response = await fetch(`${API_URL}/roles/asignar`,
                {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: '',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ usuarioId, rol })
                });
            console.log(response)
            if (!response.ok) throw new Error('Fallo el fetch de los datos')
            //const data: { usuario: User } = await response.json();
        } catch (error) {
            console.log(error)
        }
    },

    //
    setBusqueda: async (busqueda) => {
        set({ busqueda });

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            get().fetchUsuarios(busqueda);
        }, 500);
    },

    fetchUsuarios: async (search = "") => {
        try {
            const response = await fetch(
                `${AUTH_URL}/usuarios${search ? `?search=${search}` : ""}`
            )
            if (!response.ok) throw new Error('Fallo el fetch de los datos');
            const data: { usuarios: User[] } = await response.json()
            set({ usuarios: data.usuarios })
        } catch (error) {
            console.log(error)
        }
    },

    fetchRoles: async () => {
        const response = await fetch(`${API_URL}/roles`);
        if (!response.ok) throw new Error('Fallo el fetch de los datos');
        const data: Rol[] = await response.json();
        const roles = data;
        set({ roles: roles });
        return roles
    },

    useFetchRoles() {
        const { status, data, error } = useQuery({
            queryKey: ['listaRoles'],
            queryFn: async () => {
                const response = await fetch(`${API_URL}/roles`);
                if (!response.ok) throw new Error('Ocurrio un error al traer las tareas ')
                const data: Rol[] = await response.json()
                return data
            }
        });

        useEffect(() => {
            if (status === "pending") {
                //setLoading(true);
                //setError(null);
            }

            if (status === "error" && error) {
                //setError(error.message);
                //setLoading(false);
            }

            if (status === "success" && data) {
                setTimeout(() => {
                  //  setLoading(false);
                    set({roles: data})
                },2000)
            }
        }, [status, data, error]);

        return { status, data, error };
    },

    setPaginaActual(nroPagina) {
        set({ paginaActual: nroPagina })
    },

    setNroUsuariosPorPagina(nroUsuarios) {
        set({ usuariosPorPagina: nroUsuarios })
    },
}))


