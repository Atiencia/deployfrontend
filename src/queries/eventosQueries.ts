import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelarEvento, crearEvento, darDeBajaInscripcion, editarEvento, eliminarEvento, eliminarInscripto, inscribirUsuario, obtenerDetallesInscripcion, obtenerEventoPorId, obtenerEventos, obtenerEventosCancelados, obtenerEventosDisponibles, obtenerEventosPorGrupo, obtenerEventosTranscurridos, obtenerEventosVigentes, obtenerInscriptos, obtenerMisEventos, verificarInscripcionUsuario } from "../Services/eventoService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";

export function useEventos() {
    return useQuery({
        queryKey: ['eventos'],
        queryFn: obtenerEventos,
    })
}

export function useEventosVigentes() {
    return useQuery({
        queryKey: ['eventosVigentes'],
        queryFn: obtenerEventosVigentes,
        // Agregamos esto para refrescar cuando sea necesario:
        staleTime: 0, // Los datos se consideran "stale" inmediatamente
        gcTime: 1000 * 60 * 5, // Cachear por 5 minutos
    })
}

export function useEventosCancelados() {
    return useQuery({
        queryKey: ['eventosCancelados'],
        queryFn: obtenerEventosCancelados,
    })
}

export function useEventosTranscurridos() {
    return useQuery({
        queryKey: ['eventosTranscurridos'],
        queryFn: obtenerEventosTranscurridos,
    })
}

export function useMisEventos() {
    return useQuery({
        queryKey: ['misEventos'],
        queryFn: obtenerMisEventos,
    })
}

export function useEventosDisponibles() {
    return useQuery({
        queryKey: ['eventosDisponibles'],
        queryFn: obtenerEventosDisponibles,
    })
}

export function useEventosPorGrupo(grupoId: number) {
    return useQuery({
        queryKey: ['eventos', 'grupo', grupoId],
        queryFn: () => obtenerEventosPorGrupo(grupoId),
        enabled: !!grupoId
    })
}

export function useEventosPorId(id: number) {
    return useQuery({
        queryKey: ['eventos', 'id', id],
        queryFn: () => obtenerEventoPorId(id),
        enabled: !!id,
    })
}

export function useCrearEvento() {
    const qc = useQueryClient();
    const navigate = useNavigate()

    return useMutation({
        mutationFn: crearEvento,
        onSuccess: async () => {
            // Invalidamos estos queries para que se refresquen los Eventos
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['eventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['eventosVigentes'] }),
            ]);
            toast.success('Evento creado exitosamente', { duration: 1500 });
            setTimeout(() => {
                navigate('/eventos')
            }, 1500);
        },
        onError: (error) => {
            toast.error('No se pudo crear el evento', { description: error.message })
        }
    })
}

export function useEliminarEvento() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: eliminarEvento,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['misEventos'] }),
                qc.invalidateQueries({ queryKey: ['eventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['eventosVigentes'] }),
                qc.invalidateQueries({ queryKey: ['eventosCancelados'] }),
            ]);
            toast.success('Evento eliminado correctamente')
        },
        onError: (error) => {
            if (error.message.includes('inscritos')) {
                toast.error(
                    'No se puede eliminar porque hay usuarios inscritos. Te sugerimos cancelar el evento en su lugar.',
                    { duration: 5000 }
                );
            } else {
                toast.error(error.message || 'No se pudo eliminar el evento', { description: error.name });
            }
        }
    })
}

export function useCancelarEvento() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: cancelarEvento,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['misEventos'] }),
                qc.invalidateQueries({ queryKey: ['eventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['eventosVigentes'] }),
                qc.invalidateQueries({ queryKey: ['eventosCancelados'] }),
            ]);
            toast.success('Evento cancelado y notificaciones enviadas correctamente')
        },
        onError: (error) => {
            toast.error('No se pudo cancelar el evento', { description: error.message })
        }
    })
}

export function useInscriptos(eventoId: number) {
    return useQuery({
        queryKey: ['inscriptos', 'id', eventoId],
        queryFn: () => obtenerInscriptos(eventoId),
        enabled: !!eventoId
    })
}

export function useEliminarInscripto() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: eliminarInscripto,
        onSuccess: async (data) => {
            console.log(data)
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['misEventos'] }),
                qc.invalidateQueries({ queryKey: ['eventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['eventosVigentes'] }),
                qc.invalidateQueries({ queryKey: ['inscriptos', 'id', parseInt(data.id_evento.id_evento)] }),
                qc.invalidateQueries({ queryKey: ['suplentes', 'evento', parseInt(data.id_evento.id_evento)] })
            ]);
            toast.success('Eliminado correctamente')
        },
        onError: (error) => {
            toast.error('No se pudo eliminar el inscripto', { description: error.message })
        }
    })
}

export function useInscribirUsuario() {
    const qc = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: inscribirUsuario,
        onSuccess: async (data) => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['misEventos'] }),
                qc.invalidateQueries({ queryKey: ['eventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['eventosVigentes'] }),
                qc.invalidateQueries({ queryKey: ['inscriptos', 'id', parseInt(data.eventoId)] }),
                qc.invalidateQueries({ queryKey: ['suplentes', 'evento', parseInt(data.eventoId)] }),
                qc.invalidateQueries({ queryKey: ['detallesInscripcion', 'id', parseInt(data.eventoId)] }),
            ]);
            const inscritoComoSuplente = data.message?.includes('suplente');

            if (inscritoComoSuplente) {
                toast.success('¡Inscripción exitosa en la lista de espera! 📋');
            } else {
                toast.success('¡Inscripción exitosa como titular! ✅');
            }

            setTimeout(() => {
                navigate('/mis-eventos');
            }, 5500); // Dar tiempo al toast
        },
        onError: (error) => {
            toast.error('No se pudo inscribir a este evento', { description: error.message })
        }
    })
}

export function useVerificarInscripcion(eventoId: number) {
    const rolUsuario = useAtomValue(userRolAtom)
    return useQuery({
        queryKey: ['verificarInscripcion', 'id', eventoId],
        queryFn: () => verificarInscripcionUsuario(eventoId),
        // Solo verificar si el usuario está logueado (rol existe y no es null/undefined/0)
        enabled: !!eventoId && !!rolUsuario && rolUsuario !== 0
    })
}

export function useDetallesInscripcion(eventoId: number) {
    return useQuery({
        queryKey: ['detallesInscripcion', 'id', eventoId],
        queryFn: () => obtenerDetallesInscripcion(eventoId),
        enabled: !!eventoId
    })
}

export function useDarDeBajaInscripcion(eventoId: number) {
    const qc = useQueryClient();
    const navigate = useNavigate()

    return useMutation({
        mutationFn: darDeBajaInscripcion,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['misEventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['eventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosVigentes'] }),
                qc.invalidateQueries({ queryKey: ['inscriptos', 'id', eventoId] }),
                qc.invalidateQueries({ queryKey: ['suplentes', 'evento', eventoId] }),
                qc.invalidateQueries({ queryKey: ['detallesInscripcion', 'id', eventoId] }),
                qc.invalidateQueries({ queryKey: ['verificarInscripcion', 'id', eventoId] }),
                qc.invalidateQueries({ queryKey: ['estadisticas', 'evento', eventoId] }),
            ]);
            toast.success('Te has dado de baja exitosamente');
            navigate('/mis-eventos');
        },
        onError: (error) => {
            toast.error('No se pudo dar de baja', { description: error.message })
        }
    })
}

export function useEditarEvento() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: editarEvento,
        onSuccess: async (data) => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['eventos'] }),
                qc.invalidateQueries({ queryKey: ['eventosDisponibles'] }),
                qc.invalidateQueries({ queryKey: ['eventosCancelados'] }),
                qc.invalidateQueries({ queryKey: ['eventosVigentes'] }),
                qc.invalidateQueries({ queryKey: ['inscriptos', 'id', data.id_evento] }),
                qc.invalidateQueries({ queryKey: ['suplentes', 'evento', data.id_evento] })
            ])
            toast.success('Evento editado exitosamente', { duration: 1500 });
        },
        onError: (error) => {
            toast.error('No se pudo editar el evento', { description: error.message })
        }
    })
}