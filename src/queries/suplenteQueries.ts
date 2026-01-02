import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { suplenteService } from "../Services/suplenteService";
import { toast } from "sonner";


export function useEstadisticas(eventoId: number) {
    return useQuery({
        queryKey: ['estadisticas', 'evento', eventoId],
        queryFn: () => suplenteService.obtenerEstadisticas(eventoId),
        enabled: !!eventoId
    })
}

export function useSuplentes(eventoId: number) {
    return useQuery({
        queryKey: ['suplentes', 'evento', eventoId],
        queryFn: () => suplenteService.obtenerSuplentes(eventoId),
        enabled: !!eventoId
    })
}

export function useActualizacionSuplentes(eventoId: number, usuarioId: number) { //revisar si realment se usa
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () => suplenteService.darDeBajaYPromover(eventoId, usuarioId),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['suplentes', 'evento', eventoId] }),
                qc.invalidateQueries({ queryKey: ['estadisticas', 'evento', eventoId] })
            ])
        },
        onError: (error) => {
            toast.error('No se pudo procesar la solicitud', { description: error.message })
        }
    })
}

export function useEliminarSuplente(eventoId: number) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: suplenteService.eliminarSuplente,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['suplentes', 'evento', eventoId] }),
                qc.invalidateQueries({ queryKey: ['estadisticas', 'evento', eventoId] })
            ])
            toast.success('Suplente eliminado correctamente')
        },
        onError: (error) => {
            toast.error('No se pudo eliminar al suplente', { description: error.message })
        }
    })
}