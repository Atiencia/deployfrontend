import type { grupo } from "./evento";

export interface SecretariaGrupo {
  id_usuario: number;
  id_grupo: number;
  rol_en_grupo: string;
}

export interface GrupoAsignado extends grupo {
  id_grupo: number;
  nombre: string;
  descripcion: string;
  zona: string;
  imagen_url: string;
  rol_en_grupo: string;
}

export interface InfoSecretariaGrupal {
  es_secretaria: boolean;
  grupos: GrupoAsignado[];
}

export interface SecretariaInfo {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol_en_grupo?: string;
}

export interface CrearGrupoRequest {
  nombre: string,
  zona: string,
  liderGrupo?: string,
  usuario_instagram: string,
  imagen_url: string,
  contacto_whatsapp: string,
  descripcion: string,
  activo?: boolean
}

export type Rol = {
    id_rol: number,
    nombre: string,
}

export type Noticia = {
  id_noticia: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagen_path?: string | null;
  autor_id: number;
  autor_nombre?: string;
  grupo_id?: number | null;
  grupo_nombre?: string | null;
  fijada?: boolean;
  lugar?: string | null;
};

export type grupoSeguido = {
  id_grupo: number, 
  id_usuario: number,
  status: 'aprobado' | 'rechazado' | 'pendiente'
}