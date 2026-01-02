import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { asignarSecretariaAGrupo, asociarEventoAGrupo, obtenerEventosDeGrupo, obtenerGruposDeSecretaria, obtenerMisGrupos, obtenerSecretariasDeGrupo, removerSecretariaDeGrupo } from "../Services/secretariaGrupoService";
import { toast } from "sonner";
import { useCrearEvento } from "./eventosQueries";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";

export function useAsignacionSecretaria() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: asignarSecretariaAGrupo,
        onSuccess: async (data) => {
            console.log(data)
            await qc.invalidateQueries({ queryKey: ['secretariaDeGrupos', 'grupo', data.grupoId] })
            await qc.invalidateQueries({ queryKey: ['usuarios'] })
            // No mostramos toast aquí, se mostrará desde el componente
        },
        onError: (error) => {
            toast.error('No se pudo asignar el grupo a la secretaria', { description: error.message })
        }
    })
}

export function useRemoverSecretariaGrupo() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: removerSecretariaDeGrupo,
        onSuccess: async (data) => {
            console.log(data)
            await qc.invalidateQueries({ queryKey: ['secretariaDeGrupos', 'grupo', data.grupoId] })
            toast.success('Secretario removido correctamente')
        },
        onError: (error) => {
            toast.error('No se pudo remover a la secretaria del grupo', { description: error.message })
        }
    })
}

export function useGruposSecretaria(usuarioId: number) {
    return useQuery({
        queryKey: ['gruposAsignadosASecretaria', 'secretaria', usuarioId],
        queryFn: () => obtenerGruposDeSecretaria(usuarioId)

    })
}

export function useSecretariaDeGrupo(grupoId: number) {
    return useQuery({
        queryKey: ['secretariaDeGrupos', 'grupo', grupoId],
        queryFn: () => obtenerSecretariasDeGrupo(grupoId)
    })
}

export function useMisGruposSecretaria(rolUsuario: number) {
    return useQuery({
        queryKey: ['misGruposSecretaria'],
        queryFn: obtenerMisGrupos,
        enabled: rolUsuario === 5
    })
}

export function useEventosGrupo(grupoId: number) {
    const rolUsuario =  useAtomValue(userRolAtom)
    return useQuery({
        queryKey: ['eventosGrupo', 'grupo', grupoId],
        queryFn: () => obtenerEventosDeGrupo(grupoId),
        enabled: !!grupoId && grupoId > 0 && rolUsuario === 5,
        retry: 1
    })
}

export function useAsociarEventoGrupo() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: asociarEventoAGrupo,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['eventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['eventosVigentes'] })
            ])
        },
        onError: (error) => {
            toast.error('No se pudo asociar el evento al grupo', { description: error.message })
        }
    })
}

export function useCrearYAsociarEvento() {
    const qc = useQueryClient()
    const navigate = useNavigate()
    const crearEvento = useCrearEvento();
    const asociarEvento = useAsociarEventoGrupo();

    return useMutation({
        mutationFn: async (data: { evento: any; grupoId: any }) => {
            const eventoCreado = await crearEvento.mutateAsync(data.evento);
            await asociarEvento.mutateAsync({ eventoId: eventoCreado.id_evento, grupoId: data.grupoId })
        },
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['eventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['eventosVigentes'] })]);
            toast.success('Evento creado exitosamente', { duration: 1500 });
            setTimeout(() => {
                navigate('/eventos')
            }, 1500);
        },
        onError: (error) => {
            toast.error('Hubo un error al crear o asociar el evento', { description: error.message })
        }
    })
}