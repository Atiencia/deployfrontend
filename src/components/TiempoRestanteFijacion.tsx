// src/components/TiempoRestanteFijacion.tsx (nuevo archivo)
import { useState, useEffect } from 'react';
import { parseISO, differenceInSeconds } from 'date-fns';

interface Props {
  fijadaHasta: string | null | undefined;
}

export const TiempoRestanteFijacion: React.FC<Props> = ({ fijadaHasta }) => {
  const [tiempoRestante, setTiempoRestante] = useState<string | null>(null);

  useEffect(() => {
    if (!fijadaHasta) {
      setTiempoRestante(null);
      return;
    }

    const fechaExpiracion = parseISO(fijadaHasta);
    let intervalId: ReturnType<typeof setTimeout> | null = null;

    const calcularTiempo = () => {
      const ahora = new Date();
      if (fechaExpiracion > ahora) {
        const segundosDiferencia = differenceInSeconds(fechaExpiracion, ahora);
        
        // Convertir segundos a días, horas, minutos y segundos
        const dias = Math.floor(segundosDiferencia / 86400); // 86400 = 24 * 60 * 60
        const horas = Math.floor((segundosDiferencia % 86400) / 3600);
        const minutos = Math.floor((segundosDiferencia % 3600) / 60);
        const segundos = segundosDiferencia % 60;

        // Formatear tiempo restante
        let formatoTiempo = '';
        if (dias > 0) formatoTiempo += `${dias}d `;
        if (horas > 0 || dias > 0) formatoTiempo += `${horas}h `;
        if (minutos > 0 || horas > 0 || dias > 0) formatoTiempo += `${minutos}min `;
        formatoTiempo += `${segundos}seg`;

        setTiempoRestante(formatoTiempo.trim());
      } else {
        setTiempoRestante(null);
        if (intervalId) clearInterval(intervalId);
      }
    };

    calcularTiempo(); // Calcular al inicio
    intervalId = setInterval(calcularTiempo, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };

  }, [fijadaHasta]);

  if (!tiempoRestante) {
    return null; // No mostrar nada si no hay tiempo o ya expiró
  }

  // Estilo similar al badge 'Fijada'
  return (
    <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium whitespace-nowrap">
      ⏳ {tiempoRestante}
    </span>
  );
};