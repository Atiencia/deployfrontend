import axios from 'axios';
import type { EstadisticasEvento, Suplente } from '../../types/evento';

// API base - prefer VITE_API_URL if set, otherwise default to backend API port 5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const suplenteService = {
  /**
   * Obtiene estadísticas de cupos de un evento (titulares y suplentes)
   */
  async obtenerEstadisticas(eventoId: number): Promise<EstadisticasEvento> {
    const token = localStorage.getItem('token');
    const response = await axios.get<EstadisticasEvento>(
      `${API_URL}/eventos/estadisticas/${eventoId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      }
    );

    // En axios, si llega aquí es porque fue exitoso (200-299)
    return response.data;
  },

  /**
   * Obtiene la lista de suplentes de un evento ordenados por posición
   */
  async obtenerSuplentes(eventoId: number): Promise<Suplente[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get<Suplente[]>(
      `${API_URL}/eventos/suplentes/${eventoId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      }
    );

    return response.data;
  },

  /**
   * Dar de baja a un inscrito y promover al primer suplente (admin/secretaria)
   */
  async darDeBajaYPromover(eventoId: number, usuarioId: number): Promise<string> {
    const token = localStorage.getItem('token');
    const response = await axios.delete<{ message: string }>(
      `${API_URL}/eventos/${eventoId}/inscrito/${usuarioId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      }
    );

    return response.data.message;
  }
  ,
  async eliminarSuplente({ eventoId, usuarioId }: { eventoId: number, usuarioId: number }): Promise<string> {
    const token = localStorage.getItem('token');
    const response = await axios.delete<{ message: string }>(
      `${API_URL}/eventos/${eventoId}/suplente/${usuarioId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      }
    );

    return response.data.message;
  }
};
