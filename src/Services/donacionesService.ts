interface Donacion {
    id_donacion: number;
    monto: number;
    fecha: string;
    id_donante: number;
    nombre_donante?: string;
    apellido_donante?: string;
    id_grupo?: number;
    nombre_grupo?: string;
}

interface FiltroDonaciones {
    fechaInicio?: string;
    fechaFin?: string;
    nombreDonante?: string;
    idGrupo?: number;
}

import { API_URL as BASE_URL } from '../config/api';
import { axiosInstance } from '../config/axiosConfig';

export const donacionesService = {
    // Obtener todas las donaciones con filtros
    obtenerDonaciones: async (filtros?: FiltroDonaciones): Promise<Donacion[]> => {
        let url = `${BASE_URL}/donaciones`;
        
        if (filtros) {
            const params = new URLSearchParams();
            if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
            if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
            if (filtros.nombreDonante) params.append('nombreDonante', filtros.nombreDonante);
            if (filtros.idGrupo) params.append('idGrupo', filtros.idGrupo.toString());
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
        }

        const response = await fetch(url, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener donaciones');
        return response.json();
    },

    // Obtener donaciones por grupo
    obtenerDonacionesPorGrupo: async (idGrupo: number, filtros?: Omit<FiltroDonaciones, 'idGrupo'>): Promise<Donacion[]> => {
        let url = `${BASE_URL}/donaciones/grupo/${idGrupo}`;
        
        if (filtros) {
            const params = new URLSearchParams();
            if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
            if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
            if (filtros.nombreDonante) params.append('nombreDonante', filtros.nombreDonante);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
        }

        const response = await fetch(url, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener donaciones del grupo');
        return response.json();
    },

    // Obtener una donación específica
    obtenerDonacion: async (id: number): Promise<Donacion> => {
        const response = await fetch(`${BASE_URL}/donaciones/${id}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener donación');
        return response.json();
    },

    // Registrar nueva donación
    registrarDonacion: async (donacion: { monto: number; id_donante: number }): Promise<Donacion> => {
        const response = await fetch(`${BASE_URL}/donaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(donacion),
        });
        if (!response.ok) throw new Error('Error al registrar donación');
        return response.json();
    },

    // Obtener estadísticas de donaciones
    obtenerEstadisticas: async (idGrupo?: number): Promise<{
        totalDonaciones: number;
        montoTotal: number;
        promedioDonacion: number;
    }> => {
        let url = `${BASE_URL}/donaciones/estadisticas`;
        if (idGrupo) url += `?idGrupo=${idGrupo}`;

        const response = await fetch(url, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener estadísticas');
        return response.json();
    }
};

export type { Donacion, FiltroDonaciones };

export const crearPreferenciaDonacion = async ({ monto, descripcion, id_grupo, email, nombre }: { monto: string, descripcion: string, id_grupo?: number, email?: string, nombre?: string }) => {
    try {
        const response = await axiosInstance.post('/donaciones/crear_preferencia_donacion', {
            monto,
            descripcion,
            id_grupo,
            email,
            nombre
        });

        console.log("SI SE CREO LA PREFERENCIA CORRECTAMENTE ", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error al crear preferencia de donación:", error);
        throw new Error(error.response?.data?.error || 'Error al crear la preferencia');
    }
}

export const obtenerDonaciones = async (rolUsuario: number) => {
    let endpoint = '/donaciones/mis-donaciones'; // Default para usuarios

    if (rolUsuario === 3) {
        endpoint = '/donaciones/mis-donaciones';
    } else if (rolUsuario === 1 || rolUsuario === 2) {
        endpoint = '/donaciones/todas'; // Admin y superadmin ven todas
    } else if (rolUsuario === 4) {
        endpoint = '/donaciones/todas'; // Secretaria General ve todas
    } else if (rolUsuario === 5) {
        endpoint = '/donaciones/por-grupo'; // Secretaria Grupal ve solo de su grupo
    }

    try {
        const response = await axiosInstance.get(endpoint);
        return response.data;
    } catch (error: any) {
        // Si es error 500 en por-grupo, probablemente no tiene grupo asignado
        if (error.response?.status === 500 && rolUsuario === 5) {
            console.error('Error: El usuario no tiene un grupo asignado o hay un problema en el backend');
            return []; // Retornar array vacío en lugar de error
        }
        throw new Error(error.response?.data?.error || 'Error al obtener donaciones');
    }
}
