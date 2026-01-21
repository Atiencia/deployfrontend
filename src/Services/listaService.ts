import axios from "axios";
import type { registerRequest } from "../../types/Inscripto";
import type { Rol } from "../../types/secretariaGrupo";
import { API_URL, AUTH_URL } from '../config/api';

export const verificarListaDisponible = async (grupoId: number, eventoId: number): Promise<boolean> => {
  const response: { data: { disponible: boolean }, } = await axios.get(`${API_URL}/lista/verificar`, {
    params: {
      grupoId,
      eventoId,
    },
  });

  return response.data.disponible;
};


export const fetchRolesService = async () => {
  const response = await axios.get(`${API_URL}/roles`,
    {
      withCredentials: true,
    }
  );

  // En axios, si llega aquí es porque fue exitoso (200-299)
  // response.data ya contiene los datos parseados
  const data: any = response.data;
  
  // Si viene en un objeto con propiedad roles, extraerla
  if (data && Array.isArray(data.roles)) {
    return data.roles;
  }
  
  // Si es directamente un array
  if (Array.isArray(data)) {
    return data;
  }
  
  return [];
}

export const asignarRolAUsuario = async ({rol: rol, usuarioId: usuarioId}:{rol: string, usuarioId: number}) => {
  const response = await fetch(`${API_URL}/roles/asignar`,
    {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        Authorization: '',
      },
      credentials: 'include',
      body: JSON.stringify({ usuarioId, rol })
    });

  if (!response.ok) throw new Error(`Error al cambiar rol de usuario: ${response.statusText}`)

  const data = await response.json();

  return data
}

export const fetchUsuariosService = async () => {
  //const responses = await axios.get(`${API_URL}/usuarios`);
  const response = await fetch(`${AUTH_URL}/usuarios`,
    {
      method: 'GET',
      credentials: 'include',
    }
  )
  if (!response.ok) throw new Error(`Error obteniendo usuarios: ${response.statusText}`)
  const data = await response.json()
  return data.usuarios
}


export const obtenerRol = async () => {
  const response = await axios.get(`${API_URL}/roles/logeado`,
    {
      withCredentials: true,
    }
  );

  const data: any = response.data
  return data
}

export const obtenerRoles = async () => {
  const response = await fetch(`${API_URL}/roles`);
  if (!response.ok) throw new Error(`Error obteniendo roles: ${response.statusText}`);
  const data: Rol[] = await response.json();
  return data
}

export const logoutService = async () => {
  const result = await fetch(`${AUTH_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!result.ok) {
    const errorText = await result.text();
    throw new Error(`Error al cerrar sesión: ${result.statusText}, ${errorText}`);
  }

  const data = await result.json();

  return data;
}

export const loginService = async ({ username: username, password: password }: { username: string, password: string }) => {
  const response = await fetch(`${AUTH_URL}/login`, { //aca fetch
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: username,
      contrasena: password,
    }),
  });

  const data = await response.json();
  console.log('🔍 Respuesta del backend en login:', data);
  console.log('🔍 ¿Tiene token?', data.token ? 'SÍ' : 'NO');

  if (!response.ok) {
    console.error(data.message)
    // Manejar específicamente el caso de email no verificado
    if (data.emailNoVerificado) {
      const error = new Error(data.message || 'Usuario o contraseña incorrectas');
      (error as any).emailNoVerificado = true;
      throw error;
    }
    throw new Error(data.message || 'Usuario o contraseña incorrectas');
  }

  return data
}

export const registerService = async (payload: registerRequest) => {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // IMPORTANTE para cookies
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data.message)
    return data.message;
  }

  return data
}
