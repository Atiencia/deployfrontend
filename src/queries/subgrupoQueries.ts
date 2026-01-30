import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearSubgrupo, editarSubgrupo, eliminarSubgrupo, eliminarSuplenteDeSubevento, inscribirUsuarioEnSubgrupo, obtenerSubgruposPorEvento, obtenerSubgruposPorGrupo, obtenerSuplentesDeSubevento } from "../Services/subgrupoService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useSubgruposPorGrupo(grupoId: number) {
    return useQuery({
        queryKey: ['subgrupos', 'grupo', grupoId],
        queryFn: () => obtenerSubgruposPorGrupo(grupoId),
        enabled: !!grupoId
    })
}

export function useCrearSubgrupo(grupoId: number) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: crearSubgrupo,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['subgrupos', 'grupo', grupoId] }),
            ])
            toast.success("Subgrupo creado correctamente",);
        },
        onError: (error) => {
            toast.error('No se pudo crear el grupo', { description: error.message })
        }
    })
}

export function useEditarSubgrupo() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: editarSubgrupo,
        onSuccess: async (data) => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['subgrupos', 'grupos', parseInt(data.id_grupo)] }),
            ])
            toast.success('Subgrupo editado exitosamente')
        },
        onError: (error) => {
            toast.error('No se pudo editar el subgrupo', { description: error.message })
        }
    })
}

//este eliminar es un inactivar (toggle)
export function useEliminarSubgrupo() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: eliminarSubgrupo,
        onSuccess: async (data) => {
            console.log(data)
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['subgrupos', 'grupos', parseInt(data.id_grupo)] }),
            ])
            toast.success('Subgrupo eliminado exitosamente')
        },
        onError: (error) => {
            toast.error('No se pudo eliminar el subgrupo', { description: error.message })
        }
    })
}

export function useSubgruposPorEvento(eventoId: number) {
    return useQuery({
        queryKey: ['subgrupos', 'evento', eventoId],
        queryFn: () => obtenerSubgruposPorEvento(eventoId),
        enabled: !!eventoId
    })
}


export function useInscribirUsuarioSubevento(eventoId: number) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: inscribirUsuarioEnSubgrupo,
        onSuccess: async (data) => {
            console.log(data)
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
            ])
            // No mostrar toast aquí para evitar duplicados - se muestra en el componente

        },
        onError: (error) => {
            error.message.includes('intenta') ?
                toast.warning('Lo sentimos', { description: error.message, duration: 5000 })
                :
                toast.error('No se pudo inscribir a este evento', { description: error.message })
        }
    })
}

export function useSuplentesDeSubevento(eventoId: number, subgrupoId: number) {
    return useQuery({
        queryKey: ['suplentes', 'subgrupo', subgrupoId],
        queryFn: () => obtenerSuplentesDeSubevento(eventoId, subgrupoId),
        enabled: !!eventoId && !!subgrupoId
    })
}

export function useEliminarSuplenteSubevento(eventoId: number) {
    const qc = useQueryClient();
    const navigate = useNavigate()

    return useMutation({
        mutationFn: eliminarSuplenteDeSubevento,
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
            toast.success('Se elimino el suplente exitosamente');
            navigate('/mis-eventos');
        },
        onError: (error) => {
            toast.error('No se pudo eliminar el suplente', { description: error.message })
        }
    })
}