import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearPreferenciaDonacion, obtenerDonaciones } from "../Services/donacionesService";
import { crearPreferenciaPago } from "../Services/eventoService";
import { donantesFijosService } from "../Services/donantesFijosService";
import { toast } from "sonner";

export function useDonaciones(rolUsuario: number) {
  return useQuery({
    queryKey: ['donaciones'],
    queryFn: () => obtenerDonaciones(rolUsuario),
    enabled: !!rolUsuario
  })
}

// En /queries/eventosQueries.ts

// 1. El hook ahora recibe 'onSuccessCallback' y 'onErrorCallback'
export function useCrearPreferenciaEventos({
  onSuccessCallback,
  onErrorCallback,
}: {
  onSuccessCallback?: (data: any) => void;
  onErrorCallback?: (error: Error) => void;
}) {

  return useMutation({
    mutationFn: crearPreferenciaPago, // Tu función de servicio que llama a la API

    onSuccess: (data) => {
      // 2. Cuando la API responde OK, llama al callback que te pasó el componente
      if (onSuccessCallback) {
        onSuccessCallback(data);
        console.log("Preferencia de pago creada con éxito:", data);
      }
    },

    onError: (error: Error) => {
      // 3. Cuando la API falla, llama al otro callback
      if (onErrorCallback) {
        onErrorCallback(error);
        console.error("Error al crear la preferencia de pago:", error);
      }
    }
  });
}

export function useCrearPreferenciaDonacion(options = {}) {
  return useMutation({
    mutationFn: crearPreferenciaDonacion,
    ...options
  });
}

export function useDonadores(enabled: boolean = true) {
  return useQuery({
    queryKey: ['donadores'],
    queryFn: donantesFijosService.obtenerDonantes,
    enabled: enabled,
  })
}

export function useDonadoresGrupo(grupoId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['donadores', grupoId],
    queryFn: donantesFijosService.obtenerDonantesPorGrupo,
    enabled: enabled,
  })
}

export function useEliminarDonantes(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: donantesFijosService.eliminarDonante,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donadores'] });
      toast.success('Donante eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar donante');
    }
  })
}

export function useCrearDonante(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: donantesFijosService.crearDonante,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donadores'] });
      toast.success('Donante creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear donante');
    }
  })
}

export function useActualizarDonante(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number, datos: any }) => 
      donantesFijosService.actualizarDonante(id, datos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donadores'] });
      toast.success('Donante actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar donante');
    }
  })
}
 
