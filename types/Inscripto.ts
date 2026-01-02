export type Inscripto = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  dni_usuario: string;
  numeroAlumno: string | null;
  tipo_documento: 'Cedula' | 'DNI' | 'Pasaporte';
  nacionalidad: string;
  fecha_inscripcion: string;
};

export type registerRequest =
  {
    email: string,
    nombre: string,
    apellido: string,
    dni: string,
    numeroAlumno?: number,
    contrasena: string,
    nacionalidad: string,
    tipo_documento: string
  }