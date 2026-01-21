import { axiosInstance } from '../config/axiosConfig';
import { API_URL } from '../config/api';
import type { EstadisticasEvento, Suplente } from '../../types/evento';

export const suplenteService = {
  /**
   * Obtiene estadísticas de cupos de un evento (titulares y suplentes)
   */
  async obtenerEstadisticas(eventoId: number): Promise<EstadisticasEvento> {
    const response = await axiosInstance.get<EstadisticasEvento>(
      `${API_URL}/eventos/estadisticas/${eventoId}`
    );

    // En axios, si llega aquí es porque fue exitoso (200-299)
    return response.data;
  },

  /**
   * Obtiene la lista de suplentes de un evento ordenados por posición
   */
  async obtenerSuplentes(eventoId: number): Promise<Suplente[]> {
    const response = await axiosInstance.get<Suplente[]>(
      `${API_URL}/eventos/suplentes/${eventoId}`
    );

    return response.data;
  },

  /**
   * Dar de baja a un inscrito y promover al primer suplente (admin/secretaria)
   */
  async darDeBajaYPromover(eventoId: number, usuarioId: number): Promise<string> {
    const response = await axiosInstance.delete<{ message: string }>(
      `${API_URL}/eventos/${eventoId}/inscrito/${usuarioId}`
    );

    return response.data.message;
  }
  ,
  async eliminarSuplente({ eventoId, usuarioId }: { eventoId: number, usuarioId: number }): Promise<string> {
    const response = await axiosInstance.delete<{ message: string }>(
      `${API_URL}/eventos/${eventoId}/suplente/${usuarioId}`
    );

    return response.data.message;
  }
};
