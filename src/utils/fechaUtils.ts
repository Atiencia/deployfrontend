// Función para verificar si la fecha límite de inscripción ha pasado
export const esFechaInscripcionVencida = (fechaLimiteInscripcion: string): boolean => {
  const fechaActual = new Date();
  const fechaLimite = new Date(fechaLimiteInscripcion);
  return fechaActual > fechaLimite;
};
//si 
// Función para verificar si la fecha límite de baja ha pasado
export const esFechaBajaVencida = (fechaLimiteBaja: string): boolean => {
  const fechaActual = new Date();
  const fechaLimite = new Date(fechaLimiteBaja);
  return fechaActual > fechaLimite;
};

// Función para formatear fecha de forma legible
export const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};