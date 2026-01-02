// src/components/SalidaCard.tsx

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { evento } from "../../../types/evento";
import { esFechaInscripcionVencida, esFechaBajaVencida, formatearFecha } from "../../utils/fechaUtils";
import { obtenerDetallesInscripcion } from "../../Services/eventoService";
interface SalidaCardProps {
  evento: evento
}

export default function SalidaCard({ evento }: SalidaCardProps) {
  const fechaRender = new Date(evento.fecha).toLocaleDateString('es-AR');
  const fechaInscripcionVencida = esFechaInscripcionVencida(evento.fecha_limite_inscripcion.toString());
  const [estaInscrito, setEstaInscrito] = useState<boolean>(false);
  const [esSuplente, setEsSuplente] = useState<boolean>(false);
  const [ordenSuplente, setOrdenSuplente] = useState<number | null>(null);
  const [verificandoInscripcion, setVerificandoInscripcion] = useState<boolean>(true);

  useEffect(() => {
    const verificarInscripcion = async () => {
      try {
        if (evento.id_evento) {
          const detalles = await obtenerDetallesInscripcion(evento.id_evento);
          
          if (detalles && detalles.inscrito) {
            setEstaInscrito(true);
            setEsSuplente(detalles.esSuplente);
            setOrdenSuplente(detalles.ordenSuplente);
          } else {
            setEstaInscrito(false);
            setEsSuplente(false);
            setOrdenSuplente(null);
          }
        }
      } catch (error) {
        console.error('Error verificando inscripción:', error);
        setEstaInscrito(false);
        setEsSuplente(false);
        setOrdenSuplente(null);
      } finally {
        setVerificandoInscripcion(false);
      }
    };

    verificarInscripcion();
  }, [evento.id_evento]);

  // Si la fecha de inscripción ya pasó y NO está inscrito, mostrar card sin enlace
  if (fechaInscripcionVencida && !estaInscrito) {
    return (
      <div className="bg-gray-100 rounded-lg shadow p-4 opacity-60 cursor-not-allowed">
        <h3 className="text-lg font-semibold text-gray-500">{evento.nombre}</h3>
        <p className="text-sm text-gray-500">
          <strong>Lugar:</strong> {evento.lugar}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Fecha:</strong> {fechaRender}
        </p>
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600 font-medium">
            Fecha de inscripción cerrada
          </p>
          <p className="text-xs text-red-500">
            Venció el {formatearFecha(evento.fecha_limite_inscripcion.toString())}
          </p>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se verifica la inscripción
  if (verificandoInscripcion) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-red-700">{evento.nombre}</h3>
        <p className="text-sm text-gray-600">
          <strong>Lugar:</strong> {evento.lugar}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Fecha:</strong> {fechaRender}
        </p>
        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded">
          <p className="text-sm text-gray-600">
            Verificando estado...
          </p>
        </div>
      </div>
    );
  }

  // Si ya está inscrito, manejar diferentes estados según las fechas
  if (estaInscrito) {
    const fechaBajaVencida = esFechaBajaVencida(evento.fecha_limite_baja.toString());
    
    // Si la fecha de baja ya pasó, mostrar botón "Ver" para ir a la página de confirmación
    if (fechaBajaVencida) {
      return (
        <Link to={`/eventos/${evento.id_evento}?inscrito=true`}>
          <div className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition border-l-4 ${esSuplente ? 'border-yellow-500' : 'border-purple-500'}`}>
            <h3 className="text-lg font-semibold text-red-700">{evento.nombre}</h3>
            
            {/* Mostrar badge de suplente si corresponde */}
            {esSuplente && (
              <div className="inline-block mb-2">
                <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Suplente
                </span>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              <strong>Lugar:</strong> {evento.lugar}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Fecha:</strong> {fechaRender}
            </p>
            
            {esSuplente ? (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded">
                <p className="text-sm text-yellow-700 font-medium">
                  📋 Estás inscrito como suplente
                </p>
                <p className="text-xs text-yellow-600">
                  Tu posición en la lista: #{ordenSuplente} - Te avisaremos si se libera un cupo
                </p>
              </div>
            ) : (
              <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
                <p className="text-sm text-purple-600 font-medium">
                  ¡Te esperamos en el evento!
                </p>
                <p className="text-xs text-purple-500">
                  Haz clic para ver detalles del evento
                </p>
              </div>
            )}
          </div>
        </Link>
      );
    }
    
    // Si aún puede darse de baja, mostrar botón "Ver"
    return (
      <Link to={`/eventos/${evento.id_evento}?inscrito=true`}>
        <div className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition border-l-4 ${esSuplente ? 'border-yellow-500' : 'border-blue-500'}`}>
          <h3 className="text-lg font-semibold text-red-700">{evento.nombre}</h3>
          
          {/* Mostrar badge de suplente si corresponde */}
          {esSuplente && (
            <div className="inline-block mb-2">
              <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Suplente
              </span>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            <strong>Lugar:</strong> {evento.lugar}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Fecha:</strong> {fechaRender}
          </p>
          
          {esSuplente ? (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded">
              <p className="text-sm text-yellow-700 font-medium">
                📋 Estás inscrito como suplente
              </p>
              <p className="text-xs text-yellow-600">
                Tu posición en la lista: #{ordenSuplente} - Te avisaremos si se libera un cupo
              </p>
            </div>
          ) : (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-600 font-medium">
                Ya estás inscrito
              </p>
              <p className="text-xs text-blue-500">
                Puedes darte de baja hasta el {formatearFecha(evento.fecha_limite_baja.toString())}
              </p>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Si no está inscrito y la fecha de inscripción aún no ha pasado, mostrar card normal con enlace
  const sinCuposTitulares = (evento.cupos_disponibles ?? 0) === 0;
  const haySuplentesDisponibles = (evento.suplentes_disponibles ?? 0) > 0;
  
  // Si no hay cupos titulares pero SÍ hay cupos de suplente - mostrar tarjeta amarilla con link
  if (sinCuposTitulares && haySuplentesDisponibles) {
    return (
      <Link to={`/eventos/${evento.id_evento}`}>
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-red-700">{evento.nombre}</h3>
          <p className="text-sm text-gray-600">
            <strong>Lugar:</strong> {evento.lugar}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Fecha:</strong> {fechaRender}
          </p>
          
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">
                  📋 Puedes inscribirte como suplente
                </p>
                <p className="text-xs text-yellow-600">
                  Lista de espera disponible hasta el {formatearFecha(evento.fecha_limite_inscripcion.toString())}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs font-semibold text-yellow-700">
                  {evento.suplentes_disponibles}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }
  
  // Si no hay cupos titulares NI suplentes - mostrar card deshabilitada sin link
  if (sinCuposTitulares && !haySuplentesDisponibles) {
    return (
      <div className="bg-gray-100 rounded-lg shadow p-4 opacity-60 cursor-not-allowed">
        <h3 className="text-lg font-semibold text-gray-500">{evento.nombre}</h3>
        <p className="text-sm text-gray-500">
          <strong>Lugar:</strong> {evento.lugar}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Fecha:</strong> {fechaRender}
        </p>
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600 font-medium">
            ⚠️ Sin cupos disponibles
          </p>
          <p className="text-xs text-red-500">
            Ya no puedes inscribirte en este evento (ni en lista de espera)
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Link to={`/eventos/${evento.id_evento}`}>
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
        <h3 className="text-lg font-semibold text-red-700">{evento.nombre}</h3>
        <p className="text-sm text-gray-600">
          <strong>Lugar:</strong> {evento.lugar}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Fecha:</strong> {fechaRender}
        </p>

        
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                Puedes inscribirte
              </p>
              <p className="text-xs text-green-500">
                Hasta el {formatearFecha(evento.fecha_limite_inscripcion.toString())}
              </p>
            </div>
            {evento.cupos_disponibles !== undefined && (
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs font-semibold text-green-700">
                  {evento.cupos_disponibles}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}