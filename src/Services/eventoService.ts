import axios from "axios";
import type { CreateEventoRequest, EditarEventoRequest, evento, inscripcionEventoRequest } from '../../types/evento';
import type { Inscripto } from '../../types/Inscripto';
import { API_URL as BASE_API_URL } from '../config/api';

const API_URL = `${BASE_API_URL}/eventos`;

// 1. Obtener todos los eventos
export const obtenerEventos = async (): Promise<evento[]> => {
  try {
    const response = await axios.get<evento[] | { message: string }>(`${API_URL}`,
      {
        withCredentials: true
      }
    );
    // Si el backend devuelve un mensaje en lugar de un array, retornar array vacío
    if (response.data && typeof response.data === 'object' && 'message' in response.data) {
      return [];
    }
    return response.data as evento[];
  } catch (error: any) {
    console.error('Error al obtener eventos:', error);
    console.error('API_URL:', API_URL);
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar eventos');
  }
};

export const obtenerEventosVigentes = async (): Promise<evento[]> => {
  try {
    const response = await axios.get<evento[] | { message: string }>(`${API_URL}-vigentes`,
      {
        withCredentials: true
      }
    );
    console.log('obtenerEventosVigentes response:', response.data);
    // Si el backend devuelve un mensaje en lugar de un array, retornar array vacío
    if (response.data && typeof response.data === 'object' && 'message' in response.data) {
      return [];
    }
    return response.data as evento[];
  } catch (error: any) {
    console.error('Error al obtener eventos vigentes:', error);
    console.error('API_URL:', API_URL);
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar eventos vigentes');
  }
};

export const obtenerEventosTranscurridos = async (): Promise<evento[]> => {
  try {
    const response = await axios.get<evento[] | { message: string }>(`${API_URL}-transcurridos`,
      {
        withCredentials: true
      }
    );
    console.log(response.data)

    // Si el backend devuelve un mensaje en lugar de un array, retornar array vacío
    if (response.data && typeof response.data === 'object' && 'message' in response.data) {
      return [];
    }
    return response.data as evento[];
  } catch (error: any) {
    console.error('Error al obtener eventos transcurridos:', error);
    console.error('API_URL:', API_URL);
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar eventos transcurridos');
  }
};

export const obtenerEventosCancelados = async (): Promise<evento[]> => {
  try {
    const response = await axios.get<evento[] | { message: string }>(`${API_URL}-cancelados`,
      {
        withCredentials: true
      }
    );

    // Si el backend devuelve un mensaje en lugar de un array, retornar array vacío
    if (response.data && typeof response.data === 'object' && 'message' in response.data) {
      return [];
    }
    return response.data as evento[];
  } catch (error: any) {
    console.error('Error al obtener eventos cancelados:', error);
    console.error('API_URL:', API_URL);
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar eventos cancelados');
  }
};

// Obtener eventos donde el usuario está inscrito
export const obtenerMisEventos = async (): Promise<evento[]> => {
  try {
    const response = await axios.get<evento[]>(`${API_URL}/mis-eventos`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener mis eventos:', error);
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar mis eventos');
  }
};

// Obtener eventos disponibles donde el usuario NO está inscrito
export const obtenerEventosDisponibles = async (): Promise<evento[]> => {
  try {
    const response = await axios.get<evento[]>(`${API_URL}/eventos-disponibles`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener eventos disponibles:', error);
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar eventos disponibles');
  }
};

export const obtenerEventosPorGrupo = async (grupoId: number): Promise<evento[]> => {
  console.log(grupoId)
  const response = await fetch(`${BASE_API_URL}/evento-grupo/${grupoId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grupoId }),
    credentials: 'include'
  });

  if (!response.ok) throw new Error(`Error al obtener eventos: ${response.statusText}`)


  const data = await response.json();

  // Si el backend devuelve un mensaje en lugar de un array, retornar array vacío
  if (data && typeof data === 'object' && 'message' in data) {
    console.log('No hay eventos para el grupo:', data.message);
    return [];
  }

  // Si data es un array, retornarlo; si no, retornar array vacío
  return Array.isArray(data) ? data : [];
}

// 2. Obtener un evento por ID
export const obtenerEventoPorId = async (id: number): Promise<evento> => {
  const response = await axios.get<evento>(`${API_URL}/${id}`,
    {
      withCredentials: true
    }
  )

  return response.data;
};

// 3. Crear un nuevo evento
export const crearEvento = async (evento: CreateEventoRequest) => {
  const eventoRes = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      evento
    })
  });

  if (!eventoRes.ok) {
    const errorData = await eventoRes.json();
    throw new Error(errorData.error || "Error al crear el evento");
  }

  const data = await eventoRes.json();
  return data
};

// 4. Eliminar un evento
export const eliminarEvento = async (eventoId: number) => {
  const response = await fetch(`${API_URL}`,
    {
      method: 'DELETE',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventoId }),
      credentials: 'include'
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Error al eliminar evento: ${response.statusText}`);
  }

  const data = await response.json()
  return data
};

// Cancelar un evento
export const cancelarEvento = async (eventoId: number) => {
  const response = await fetch(`${API_URL}/cancelar`,
    {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventoId }),
      credentials: 'include'
    }
  )

  if (!response.ok) throw new Error(`Error al cancelar evento: ${response.statusText}`)

  const data = await response.json()

  return data;

};


// 5. Asignar cupos a un evento
//ojtio que no se usa pero deberia usarse
export const asignarCupos = async (eventoId: number, cupos: number) => {
  const response = await axios.put(`${API_URL}/asignarCupos`, {
    eventoId,
    cupos,
  });

  return response.data;
};

// 6. Contar inscriptos
// se usa en la funcion de inscribir usuarios
export const contarInscriptos = async (eventoId: number): Promise<number> => {
  const response = await axios.post<{ count: number }>(`${API_URL}/inscriptos/count`, {
    eventoId,
  });

  return response.data.count;
};

// 7. Obtener lista de inscriptos
export async function obtenerInscriptos(idEvento: number): Promise<Inscripto[]> {
  const response = await axios.post<Inscripto[]>(`${API_URL}/inscriptos/lista`, {
    eventoId: idEvento,
  }, { withCredentials: true });

  return response.data;
}


// 8. Inscribir un usuario a un evento
export const inscribirUsuario = async (payload: inscripcionEventoRequest) => {
  const response = await fetch(`${BASE_API_URL}/eventos/inscripcion`, { //aca fetch
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  console.log('payload',payload)

  if (!response.ok) throw new Error(`Error al realizar inscripcion: ${response.statusText}`)

  const data = await response.json()

  return data;
};

//9. Eliminar a un inscripto de un evento 
export const eliminarInscripto = async ({ eventoId, usuarioId }: { eventoId: number, usuarioId: number }) => {
  const response = await fetch(`${API_URL}/inscriptos`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventoId, usuarioId })
    }
  )

  if (!response.ok) throw new Error(`Error al eliminar inscripto: ${response.statusText}`)

  const data = await response.json();
  return data
}

//10. Verificar si el usuario actual está inscrito en un evento
export const verificarInscripcionUsuario = async (eventoId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/verificar-inscripcion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventoId: eventoId })
    });

    // Si no está autenticado (401), simplemente retornar false sin lanzar error
    if (response.status === 401) {
      return false;
    }

    if (!response.ok) {
      console.error('Error verificando inscripción:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    return data.inscrito || false;
  } catch (error) {
    console.error('Error en verificarInscripcionUsuario:', error);
    return false;
  }
};

//10.5 Obtener detalles de inscripción (si es suplente, su orden, etc.)
export const obtenerDetallesInscripcion = async (eventoId: number): Promise<{
  inscrito: boolean;
  esSuplente: boolean;
  ordenSuplente: number | null;
  subgrupo: string | null;
} | null> => {
  try {
    const response = await fetch(`${API_URL}/detalles-inscripcion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventoId: eventoId })
    });

    // Si no está autenticado, retornar null
    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      console.error('Error obteniendo detalles de inscripción:', response.status);
      return null;
    }

    const data = await response.json();

    return {
      inscrito: data.inscrito || false,
      esSuplente: data.esSuplente || false,
      ordenSuplente: data.ordenSuplente || null,
      subgrupo: data.subgrupo || null
    };
  } catch (error) {
    console.error('Error en obtenerDetallesInscripcion:', error);
    return null;
  }
};


//11. Dar de baja la inscripción del usuario actual
export const darDeBajaInscripcion = async (eventoId: number) => {
  // Primero necesitamos obtener el ID del usuario actual
  // Por ahora, vamos a usar una llamada directa al endpoint existente
  const response = await fetch(`${API_URL}/mi-baja`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventoId: eventoId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al darse de baja');
  }

  return await response.json();
}

export const crearPreferenciaPago = async (eventoData: evento & { form_data: any }) => {
  const { form_data, ...evento } = eventoData;

  const response = await fetch(`${BASE_API_URL}/mercadopago/crear_preferencia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      title: `Inscripción a ${evento.nombre}`,
      unit_price: parseFloat(String(evento.costo || 0)),
      eventoId: evento.id_evento,
      form_data: form_data // Enviar los datos del formulario
    }),
  })
  console.log('PREFEREIC AI RESPONSE:', response);

  console.log('PREFEREIC AI form:', form_data);



  if (!response.ok) throw new Error(`Error en redireccion de pago: ${response.statusText}`);
  const data = await response.json()

  return data
}

export const editarEvento = async ({ eventoId, datosEditados }: { eventoId: string, datosEditados: EditarEventoRequest }) => {
  const res = await fetch(`${BASE_API_URL}/eventos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_evento: eventoId, ...datosEditados }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Error al editar evento: ${res.statusText}`);
  const data = await res.json();
  return data
}
