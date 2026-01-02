import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activarGrupo, crearGrupo, editarGrupo, eliminarMiembro, inactivarGrupo, manejarSolicitud, obtenerGrupo, obtenerGrupos, obtenerGruposActivos, obtenerGruposSeguidos, obtenerSeguidoresGrupo, obtenerSolicitudesPendientes, seguirGrupo } from "../Services/grupoService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useGrupos() {
    return useQuery({
        queryKey: ['grupos'],
        queryFn: obtenerGrupos,
    })
}

export function useGruposActivos() {
    return useQuery({
        queryKey: ['gruposActivos'],
        queryFn: obtenerGruposActivos,
    })
}

export function useGrupo(grupoId: string) {
    return useQuery({
        queryKey: ['grupos', 'id', grupoId],
        queryFn: () => obtenerGrupo(grupoId),
        enabled: !!grupoId
    })
}

export function useCrearGrupo() {
    const navigate = useNavigate()
    const qc = useQueryClient()

    return useMutation({
        mutationFn: crearGrupo, // ⬅️ aceptar FormData
        onSuccess: async (data) => {
            console.log(data)

            await Promise.all([
                qc.invalidateQueries({ queryKey: ['grupos'] }),
                qc.invalidateQueries({ queryKey: ['gruposActivos'] }),
            ])

            toast.success(`Grupo ${data.nombre} creado exitosamente`)
            navigate('/grupos')
        },
        onError: (error: any) => {
            toast.error('No se pudo crear el grupo', { description: error.message })
        }
    })
}

export function useEditarGrupo() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: editarGrupo,
        onSuccess: async (data) => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['grupos'] }),
                qc.invalidateQueries({ queryKey: ['gruposActivos'] }),
                qc.invalidateQueries({ queryKey: ['grupos', 'id', data.id_grupo] })
            ]);
            toast.success('Grupo editado correctamente')
        },
        onError: (error) => {
            toast.error('No se pudo editar el grupo', { description: error.message })
        }
    })
}


export function useInactivarGrupo() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: inactivarGrupo,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['grupos'] }),
                qc.invalidateQueries({ queryKey: ['gruposActivos'] }),
            ]);
            toast.success('Grupo inactivado exitosamente')
        },
        
        onError: (error) => {
            toast.error('No se pudo inactivar el grupo', { description: error.message })
        }
    })
}

export function useActivarGrupo() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: activarGrupo,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['grupos'] }),
                qc.invalidateQueries({ queryKey: ['gruposActivos'] }),
            ]);
            toast.success('Grupo activado exitosamente')
        },
        
        onError: (error) => {
            toast.error('No se pudo activar el grupo', { description: error.message })
        }
    })
}

export function useSeguirGrupo() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: seguirGrupo,
        onMutate:() => {
            const toastId = toast.loading('Procesando solicitud...')
            return toastId
        },
        onSuccess: async (data, _variables, toastId) => {
            toast.dismiss(toastId)
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['gruposSeguidos'] }),
            ]);
            console.log(data)
            if (data.siguiendo.status === 'pendiente') {toast.success('Tu solicitud se envio exitosamente a ' + data.siguiendo.nombre)}
            else if(data.siguiendo.status === 'aprobado') toast.success('Ahora sigues a ' + data.siguiendo.nombre)
            else toast.success('Has dejado de seguir a ' + data.siguiendo.nombre)
        },
        onError: (error) => {
            toast.error('No se pudo seguir al grupo elegido', { description: error.message })
        }
    })
}

export function useEliminarMiembro() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: eliminarMiembro,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['seguidoresGrupo'] }),
            ]);
            toast.success('Miembro eliminado con exito')
        },
        onError: (error) => {
            toast.error('No se pudo eliminar el miembro', { description: error.message })
        }
    })
}

export function useGruposSeguidos(rolUsuario: number) {
    return useQuery({
        queryKey: ['gruposSeguidos'],
        queryFn: obtenerGruposSeguidos,
        enabled: rolUsuario !== 0
    })
}

export function useSeguidoresDeGrupo(grupoId: number) {
    return useQuery({
        queryKey: ['seguidoresGrupo', 'grupo', grupoId],
        queryFn: () => obtenerSeguidoresGrupo(grupoId)
    })
}

export function useSolicitudesPendientes(grupoId: number) {
    return useQuery({
        queryKey: ['solicitudesPendientes', 'grupo', grupoId],
        queryFn: () => obtenerSolicitudesPendientes(grupoId)
    })
}

export function useManejarSolicitud() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: manejarSolicitud,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['seguidoresGrupo'] }),
                qc.invalidateQueries({ queryKey: ['solicitudesPendientes'] }),
                qc.invalidateQueries({ queryKey: ['gruposSeguidos'] })
            ]);
            toast.success('Solicitud procesada con exito')
        },
        onError: (error) => {
            toast.error('No se pudo procesar la solicitud', { description: error.message })
        }
    })
}

