import type { inscripcionEventoRequest } from "../../types/evento";

const API_URL = 'http://localhost:5000/api/subgrupos';

export const crearSubgrupo = async ({ id_grupo, nombre, descripcion }: { id_grupo: number, nombre: string, descripcion: string }) => {
  const response = await fetch(`${API_URL}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_grupo, nombre, descripcion })
    }
  )
    if (!response.ok) {
    const e = await response.json()
    throw new Error(`Error al editar grupo: ${e.error}`)
  }

  return response
}

export const obtenerSubgruposPorGrupo = async (id_grupo: number) => {
  const response = await fetch(`${API_URL}/grupo/${id_grupo}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) throw new Error(`Error al obtener subgrupos: ${response.statusText}`)

  const data = await response.json()

  return data
}

export const obtenerSubgruposPorId = async (id_subgrupo: number) => {
  const response = await fetch(`${API_URL}/${id_subgrupo}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) throw new Error(`Error al obtener el subgrupo: ${response.statusText}`)
  const data = await response.json()

  return data
}

export const editarSubgrupo = async ({ id_subgrupo, nombre, descripcion }: { id_subgrupo: number, nombre?: string, descripcion?: string }) => {
  const response = await fetch(`${API_URL}/${id_subgrupo}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion }),
      credentials: 'include'
    }
  )

  if (!response.ok) throw new Error(`Error al editar el subgrupo: ${response.statusText}`)
  const data = await response.json()

  return data
}

//no se elimina el campo activo pasa a estar en falso
export const eliminarSubgrupo = async (id_subgrupo: number) => {
  const response = await fetch(`${API_URL}/${id_subgrupo}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    }
  )

  if (!response.ok) throw new Error(`Error al eliminar el subgrupo: ${response.statusText}`)
  const data = await response.json()

  return data
}

export const obtenerSubgruposPorEvento = async (id_evento: number) => {
  const response = await fetch(`${API_URL}/evento/${id_evento}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) throw new Error(`Error al obtener subgrupos: ${response.statusText}`)

  const data = await response.json()

  return data
}

export const inscribirUsuarioEnSubgrupo = async ({ id_subgrupo, payload }: { id_subgrupo: number, payload: inscripcionEventoRequest }) => {
  const response = await fetch(`${API_URL}/inscripcion/${id_subgrupo}`, {
    method: 'POST',
    credentials: 'include',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify(payload)
  });

  if (!response.ok){
    const errorData = await response.json();
    throw new Error(`${errorData.error}`)
  } 

  const data = await response.json()
  return data
}

export const obtenerSuplentesDeSubevento = async (id_evento: number, id_subgrupo: number) => {
  const response = await fetch(`${API_URL}/suplentes/${id_evento}`, {
    method: 'GET',
    credentials: 'include',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify({id_subgrupo})
  });

  if (!response.ok) throw new Error(`Error al obtener suplentes del subevento: ${response.statusText}`) 
  const data = await response.json()
  return data
}


export const eliminarSuplenteDeSubevento = async ({id_subgrupo, id_evento, id_usuario}:{id_subgrupo: number, id_evento: number, id_usuario: number}) => {
  const response = await fetch(`${API_URL}/suplentes/${id_subgrupo}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify({id_evento, id_usuario})
  }); 

  if (!response.ok) throw new Error(`Error al eliminar suplente del subevento: ${response.statusText}`)
  const data = await response.json()
  return data
} 
