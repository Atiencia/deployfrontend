interface DonanteFijo {
    id_donante_fijo: number;
    nombre: string;
    apellido: string;
    dni: number;
    email: string;
    id_grupo: number | null;
    nombre_grupo?: string;
}

interface CrearDonanteDTO {
    nombre: string;
    apellido: string;
    dni: number;
    email: string;
    id_grupo: number | null;
}

interface ActualizarDonanteDTO {
    nombre?: string;
    apellido?: string;
    dni?: number;
    email?: string;
    id_grupo?: number | null;
}

const BASE_URL = 'http://localhost:5000/api';

export const donantesFijosService = {
    // Obtener todos los donantes (Admin y Secretaría General)
    obtenerDonantes: async (): Promise<DonanteFijo[]> => {
        const response = await fetch(`${BASE_URL}/donantes-fijos`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`Error al obtener donantes: ${response.statusText}`);
        return response.json();
    },

    // Obtener donantes por grupo (Secretaría Grupal)
    obtenerDonantesPorGrupo: async (): Promise<DonanteFijo[]> => {
        const response = await fetch(`${BASE_URL}/donantes-fijos/por-grupo`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Error al obtener donantes del grupo');
        return response.json();
    },

    // Obtener un donante específico
    obtenerDonante: async (id: number): Promise<DonanteFijo> => {
        const response = await fetch(`${BASE_URL}/donantes-fijos/${id}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener donante');
        return response.json();
    },

    // Crear nuevo donante
    crearDonante: async (donante: CrearDonanteDTO): Promise<DonanteFijo> => {
        const response = await fetch(`${BASE_URL}/donantes-fijos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(donante),
        });
        if (!response.ok) throw new Error(`Error al crear donante: ${response.statusText}`);
        return response.json();
    },

    // Actualizar donante existente
    actualizarDonante: async (id: number, datos: ActualizarDonanteDTO): Promise<DonanteFijo> => {
        const response = await fetch(`${BASE_URL}/donantes-fijos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error('Error al actualizar donante');
        return response.json();
    },

    // Eliminar donante
    eliminarDonante: async (id: number): Promise<void> => {
        const response = await fetch(`${BASE_URL}/donantes-fijos/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Error al eliminar donante');
    }
};

export type { DonanteFijo, CrearDonanteDTO, ActualizarDonanteDTO };
