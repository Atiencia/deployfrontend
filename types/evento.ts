//types/evento.ts
export interface evento {
  id_evento: number;
  nombre: string;
  grupo: string;
  fecha: Date;
  descripcion?: string;
  cupos: number;
  cupos_suplente: number;
  cupos_disponibles?: number; // Cupos titulares disponibles calculados en el backend
  suplentes_disponibles?: number; // Cupos de suplentes disponibles calculados en el backend
  fecha_limite_inscripcion: Date;
  fecha_limite_baja: Date
  categoria: 'salida' | 'normal' | 'pago'
  costo?: number

  lugar: string
  estado: 'vigente' | 'transcurrido' | 'cancelado'
  nombre_grupo?: string; // Nombre del grupo asociado al evento
  // Campos opcionales para cuando se obtienen eventos del usuario
  es_suplente?: boolean;
  orden_suplente?: number;
}

export type CreateEventoRequest =
  {
    nombre: string;
    fecha: Date;
    descripcion?: string;
    cupos: number;
    cupos_suplente: number;
    lugar: string,
    categoria: string,
    costo: number | undefined,
    fecha_limite_inscripcion: Date | undefined,
    fecha_limite_baja: Date | undefined, 
    formSubgrupos: Subevento[] | undefined
    id_grupo: string
  }

export type EditarEventoRequest =
  {
    fecha: Date,
    descripcion: string,
    cupos: number | null,
    cupos_suplente: number | null,
    fecha_limite_inscripcion: string,
    fecha_limite_baja: string
  }

export type inscripcionEventoRequest =
  {
    eventoId: number
    residencia: string;
    rol: string;
    primeraVez: boolean;
    carrera?: string;
    anioCarrera?: number;
    nombreRemitente: string | undefined;
    subgrupo: string;
  }

export interface grupo {
  id_grupo: number,
  nombre: string,
  descripcion: string,
  zona: string
  imagen_url: string,
  usuario_instagram: string,
  contacto_whatsapp: string,
  activo: boolean
}

export interface grupoSeguido {
  id_grupo: number,
  id_usuario: number,
  status: 'pendiente' | 'aprobado' | 'rechazado',
  nombre: string,
  imagen_url: string,
}

export interface Participante {
  nroAlumno: number;
  nombreCompleto: string;
  tipoDoc: string; // O el tipo que necesites
  nroDoc: number;
  nacionalidad: string;
  firmaIda: string;
  firmaVuelta: string;
}

// Nuevas interfaces para suplentes
export interface EstadisticasEvento {
  cupos_totales: number;
  cupos_ocupados: number;
  cupos_disponibles: number;
  cupos_suplente_totales: number;
  suplentes_inscritos: number;
  suplentes_disponibles: number;
}

export interface Suplente {
  id_usuario: number;
  nombre: string;
  apellido: string;
  dni_usuario: number;
  numeroAlumno?: number;
  tipo_documento: string;
  nacionalidad: string;
  fecha_inscripcion: string;
  orden_suplente: number;
}

export interface Subgrupo {
  id_subgrupo: number;
  id_grupo: number;
  nombre: string;
  descripcion: string;
  activo?: boolean;
}


export interface Donante_fijo {
  id_donante_fijo: number;
  id_grupo: number;
  nombre: string;
  apellido: string;
  email?: string;
  dni?: string;
  fecha_registro?: string;
}

export interface Donacion {
  id_donacion: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  monto: number;
  fecha_donacion: string;
  grupo?: string;
}


export interface Subevento  {
  id_evento?: number, 
  id_subgrupo: number, 
  cupos: number, 
  cupos_suplente: number
}