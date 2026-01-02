import axios from "axios";
import type { SecretariaInfo, InfoSecretariaGrupal } from '../../types/secretariaGrupo'
import type { evento } from "../../types/evento";
const API_URL = "http://localhost:5000/api/secretaria-grupo";

/**
 * Admin: Asignar una secretaria a un grupo
 */
export const asignarSecretariaAGrupo = async ({ usuarioId, grupoId }: { usuarioId: number, grupoId: number }): Promise<any> => {
  const response = await axios.post(
    `${API_URL}/asignar`,
    { usuarioId, grupoId },
    { withCredentials: true }
  );

  if (response.statusText !== 'OK') throw new Error(`Error al asignar secretaria a grupo: ${response.statusText}`)

  return response.data;
};

/**
 * Admin: Remover una secretaria de un grupo
 * CONSIDERAR SI SE USA
 */
export const removerSecretariaDeGrupo = async ({ usuarioId, grupoId }: { usuarioId: number, grupoId: number }): Promise<any> => {
  const response = await axios({
    method: 'delete',
    url: `${API_URL}/remover`,
    data: { usuarioId, grupoId },
    withCredentials: true
  });
  if (response.statusText !== 'OK') throw new Error(`Error al remover la secretaria: ${response.statusText}`)

  return response.data;
};

/**
 * Admin: Obtener todos los grupos asignados a una secretaria
 * //NO SE USA 
 */
export const obtenerGruposDeSecretaria = async (usuarioId: number): Promise<{ grupos: number[] }> => {
  const response = await axios.get<{ grupos: number[] }>(
    `${API_URL}/usuario/${usuarioId}/grupos`,
    { withCredentials: true }
  );
  if (response.statusText !== 'OK') throw new Error(`Error al obtener grupos asignados: ${response.statusText}`)

  return response.data;
};

/**
 * Admin/Secretaria General: Obtener todas las secretarias de un grupo
 */
export const obtenerSecretariasDeGrupo = async (grupoId: number): Promise<{ secretarias: SecretariaInfo[] }> => {
  const response = await axios.get<{ secretarias: SecretariaInfo[] }>(
    `${API_URL}/grupo/${grupoId}/secretarias`,
    { withCredentials: true }
  );
  if (response.statusText !== 'OK') throw new Error(`Error al obtener secretarias: ${response.statusText}`)

  return response.data;
};

/**
 * Secretaria Grupal: Obtener mis grupos asignados
 * CAMBIO LOGICA CAMBIAR DEMAS
 */
export const obtenerMisGrupos = async (): Promise<InfoSecretariaGrupal> => {
  const response = await axios.get<InfoSecretariaGrupal>(
    `${API_URL}/mis-grupos`,
    { withCredentials: true }
  );

  if (response.statusText !== 'OK') throw new Error(`Error al obtener mis grupos: ${response.statusText}`)

  return response.data;
};

/**
 * Secretaria Grupal: Obtener eventos de un grupo específico
 */
export const obtenerEventosDeGrupo = async (grupoId: number): Promise<{ eventos: evento[] }> => {
  const response = await axios.get<{ eventos: any[] }>(
    `${API_URL}/grupo/${grupoId}/eventos`,
    { withCredentials: true }
  );

  if (response.statusText !== 'OK') throw new Error(`Error al obtener eventos del grupo: ${response.statusText}`)

  return response.data;
};


export const asociarEventoAGrupo = async ({ eventoId, grupoId }: { eventoId: number, grupoId: string }) => {
  const grupoRes = await fetch("http://localhost:5000/api/evento_grupo", { //acafetch
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