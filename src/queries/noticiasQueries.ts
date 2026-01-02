import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearNoticia, editarNoticia, eliminarNoticia, obtenerNoticia, obtenerNoticias } from "../Services/noticiaService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";


export function useNoticia(noticiaId: string) {
    return useQuery({
        queryKey: ['noticias', 'id', noticiaId],
        queryFn: () => obtenerNoticia(noticiaId),
        enabled: !!noticiaId
    })
}

export function useNoticias() {
    return useQuery({
        queryKey: ['noticias'],
        queryFn: obtenerNoticias,
    })
}

export function useCrearNoticia() {
    const qc = useQueryClient();
    const navigate = useNavigate()

    return useMutation({
        mutationFn: crearNoticia,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['noticias'] }),
            ])
            toast.success("Noticia creada con éxito!");
            setTimeout(() => navigate("/noticias/admin"), 1500); // Dar tiempo a leer el toast

        },
        onError: (error) => {
            toast.error('No se pudo crear la noticia', { description: error.message })
        }
    })
}

export function useCrearYFijarNoticia() {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const crearNoticia = useCrearNoticia();
    const editarNoticia = useEditarNoticia();

    return useMutation({
        mutationFn: async (data: { noticia: any; putPayload: any }) => {
            const noticiaCreada = await crearNoticia.mutateAsync(data.noticia);
            await editarNoticia.mutateAsync({ noticiaId: noticiaCreada.id_noticia, putPayload: data.putPayload })
        },
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['noticias'] }),
            ])
            setTimeout(() => navigate("/noticias/admin"), 1500)
        },
        onError: (error) => {
            toast.error('No se pudo crear y fijar la noticia', { description: error.message })
        }
    })
}

export function useEditarNoticia() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: editarNoticia,
        onSuccess: async (data) => {
            console.log(data)
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['noticias', 'id', data.id_noticia] }),
                qc.invalidateQueries({ queryKey: ['noticias'] }),
            ])
            toast.success("Noticia editada / fijada con éxito!");
        },
        onError: (error) => {
            toast.warning("Ocurrio un problema al editar la noticia. Puedes modificarla manualmente.", { description: error.message });
        }
    })
}

export function useEliminarNoticia() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: eliminarNoticia,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['noticias'] }),
            ]);
            toast.success('Noticia eliminada exitosamente.')
        },
        onError: (error) => {
            toast.error('No se pudo eliminar la noticia', { description: error.message })
        }
    })
}
