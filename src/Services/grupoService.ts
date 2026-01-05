import axios from "axios";
import type { grupo } from "../../types/evento";
import type { CrearGrupoRequest } from "../../types/secretariaGrupo";
import { API_URL } from '../config/api';

export const obtenerGrupos = async () => {
  try {
    const response = await axios.get<grupo[]>(`${API_URL}/grupos`, {
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener grupos:', error);
    console.error('API_URL:', API_URL);
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar grupos');
  }
};

export const obtenerGruposActivos = async () => {
  const response = await axios.get<grupo[]>(`${API_URL}/grupos`, {
    withCredentials: true
  });
  if (response.statusText !== 'OK') throw new Error(`Error al obtener grupos activos: ${response.statusText}`)

  return response.data;
};

export const obtenerGrupo = async (id: string) => {
  const response = await axios.get<grupo>(`${API_URL}/grupos/${id}`,
    {
      withCredentials: true
    }
  );
  if (response.statusText !== 'OK') throw new Error(`Error al obtener grupo: ${response.statusText}`)

  return response.data
}

export const crearGrupo = async (data: FormData) => {
  const response = await fetch(`${API_URL}/grupos`, { //acafetch
    method: "POST",
    /*headers: {
      "Content-Type": "application/json",
    },*/
    credentials: 'include',
    body: data,
  });

  if (!response.ok) throw new Error(`Error al crear el grupo: ${response.statusText}`)
  const result = await response.json()

  return result
}

export const editarGrupo = async ({ grupoId, datosEditados }: { grupoId: string, datosEditados: CrearGrupoRequest }) => {
  const response = await fetch(`${API_URL}/grupos/${grupoId}`, { //aca fetch
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datosEditados }),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const e = await response.json()
    throw new Error(`Error al editar grupo: ${e.error}`)
  }

  const data = await response.json()

  return data
}


export const inactivarGrupo = async (id: number) => {
  const response = await fetch(`${API_URL}/grupos/${id}`,
    {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_grupo: id, activo: false })
    }
  )
  if (!response.ok) throw new Error(`Error al inactivar grupo: ${response.statusText}`)

  const data = await response.json()
  return data
}

export const activarGrupo = async (id: number) => {
  const response = await fetch(`${API_URL}/grupos/${id}`,
    {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_grupo: id, activo: true })
    }
  )
  if (!response.ok) throw new Error(`Error al activar grupo: ${response.statusText}`)

  const data = await response.json()
  return data
}


export const seguirGrupo = async (id_grupo: number) => {
  const response = await fetch(`${API_URL}/grupos/seguir/${id_grupo}`,
    {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
    }
  )

  if (!response.ok) throw new Error(`Error al seguir grupo: ${response.statusText}`)
  const data = await response.json()
  return data
}

export const eliminarMiembro = async ({ id_grupo, id_usuario }: { id_grupo: number, id_usuario: number }) => {
  const response = await fetch(`${API_URL}/grupos/${id_grupo}/miembros/${id_usuario}`,
    {
      method: 'DELETE',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
    }
  )
  if (!response.ok) throw new Error(`Error al eliminar miembro: ${response.statusText}`)

  const data = await response.json()
  return data
}

export const obtenerGruposSeguidos = async () => {
  const response = await fetch(`${API_URL}/grupos/seguidos`,
    {
      method: 'GET',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
    }
  )

  if (!response.ok) throw new Error(`Error al obtener grupos seguidos: ${response.statusText}`)
  const data = await response.json()
  return data
}

export const obtenerSeguidoresGrupo = async (id_grupo: number) => {
  const response = await fetch(`${API_URL}/grupos/${id_grupo}/seguidores`,
    {
      method: 'GET',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
    }
  )
  if (!response.ok) throw new Error(`Error al obtener seguidores: ${response.statusText}`)

  const data = await response.json()
  return data
}

export const obtenerSolicitudesPendientes = async (id_grupo: number) => {
  const response = await fetch(`${API_URL}/grupos/${id_grupo}/solicitudes`,
    {
      method: 'GET',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
    }
  )
  if (!response.ok) throw new Error(`Error al obtener solicitudes pendientes: ${response.statusText}`)

  const data = await response.json()
  return data
}

export const manejarSolicitud = async ({ id_grupo, id_usuario, accion }: { id_grupo: number, id_usuario: number, accion: 'aprobado' | 'rechazado' }) => {
  const response = await fetch(`${API_URL}/grupos/${id_grupo}/solicitudes`,
    {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario, accion })
    }
  )
  if (!response.ok) throw new Error(`Error al manejar solicitud: ${response.statusText}`)

  const data = await response.json()
  return data
}
