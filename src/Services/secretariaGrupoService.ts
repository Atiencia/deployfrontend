import { axiosInstance } from "../config/axiosConfig";
import type { SecretariaInfo, InfoSecretariaGrupal } from '../../types/secretariaGrupo'
import type { evento } from "../../types/evento";
import { API_URL as BASE_API_URL } from '../config/api';

const API_URL = `${BASE_API_URL}/secretaria-grupo`;

/**
 * Admin: Asignar una secretaria a un grupo
 */
export const asignarSecretariaAGrupo = async ({ usuarioId, grupoId }: { usuarioId: number, grupoId: number }): Promise<any> => {
  const response = await axiosInstance.post(
    `${API_URL}/asignar`,
    { usuarioId, grupoId }
  );

  return response.data;
};

/**
 * Admin: Remover una secretaria de un grupo
 * CONSIDERAR SI SE USA
 */
export const removerSecretariaDeGrupo = async ({ usuarioId, grupoId }: { usuarioId: number, grupoId: number }): Promise<any> => {
  const response = await axiosInstance({
    method: 'delete',
    url: `${API_URL}/remover`,
    data: { usuarioId, grupoId }
  });

  return response.data;
};

/**
 * Admin: Obtener todos los grupos asignados a una secretaria
 * //NO SE USA 
 */
export const obtenerGruposDeSecretaria = async (usuarioId: number): Promise<{ grupos: number[] }> => {
  const response = await axiosInstance.get<{ grupos: number[] }>(
    `${API_URL}/usuario/${usuarioId}/grupos`,
    { withCredentials: true }
  );
  );
};

/**
 * Admin/Secretaria General: Obtener todas las secretarias de un grupo
 */
export const obtenerSecretariasDeGrupo = async (grupoId: number): Promise<{ secretarias: SecretariaInfo[] }> => {
  const response = await axiosInstance.get<{ secretarias: SecretariaInfo[] }>(
    `${API_URL}/grupo/${grupoId}/secretarias`,
    { withCredentials: true }
  );
  );
};

/**
 * Secretaria Grupal: Obtener mis grupos asignados
 * CAMBIO LOGICA CAMBIAR DEMAS
 */
export const obtenerMisGrupos = async (): Promise<InfoSecretariaGrupal> => {
  const response = await axiosInstance.get<InfoSecretariaGrupal>(
    `${API_URL}/mis-grupos`
  );

  return response.data;
};

/**
 * Secretaria Grupal: Obtener eventos de un grupo específico
 */
export const obtenerEventosDeGrupo = async (grupoId: number): Promise<{ eventos: evento[] }> => {
  const response = await axiosInstance.get<{ eventos: any[] }>(
    `${API_URL}/grupo/${grupoId}/eventos`,
    { withCredentials: true }
  );
  );
};


export const asociarEventoAGrupo = async ({ eventoId, grupoId }: { eventoId: number, grupoId: string }) => {
  const grupoRes = await fetch(`${BASE_API_URL}/evento_grupo`, { //acafetch
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id_evento: eventoId, id_grupo: grupoId, rol_grupo: "miembro" })
  });

  if (!grupoRes.ok) {
    throw new Error(`El evento se creo correctamente, pero no se pudo asociar al grupo: ${grupoRes.statusText}`);
  }

  const data = await grupoRes.json()

  return data
}