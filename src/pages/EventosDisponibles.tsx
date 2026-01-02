import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import type { evento } from "../../types/evento";
import { NoAutorizado } from "./NoAutorizado";
import { LoadingSpinner } from "../components/LoadingComponents";
import { esFechaInscripcionVencida, formatearFecha } from "../utils/fechaUtils";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { useEventosDisponibles } from "../queries/eventosQueries";

export default function EventosDisponiblesPage() {
  const rolUsuario = useAtomValue(userRolAtom)
  const {data: eventos, isPending: loading, error} = useEventosDisponibles()


  // Mostrar loading mientras se carga el rol o los eventos
  if (loading && rolUsuario === null) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-56">
          <main className="pt-10 px-8">
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Verificar autorización - Solo usuarios (rol 3) pueden ver esta página
  if (rolUsuario !== 3) {
    return <NoAutorizado />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-56">
        <main className="pt-10 px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Eventos Disponibles</h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error.message}</p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
              <p className="text-gray-500 text-lg mb-4">No hay eventos disponibles en este momento</p>
              <Link 
                to="/mis-eventos" 
                className="inline-block bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded transition-colors"
              >
                Ver Mis Eventos
              </Link>
            </div>
          ) : (
            <>
              {/* Verificar si hay eventos con inscripción abierta */}
              {(() => {
                // Asegurarse de que eventos sea un array antes de usar filter
                const eventosArray = Array.isArray(eventos) ? eventos : [];
                
                const eventosConInscripcionAbierta = eventosArray.filter(
                  event => !esFechaInscripcionVencida(event.fecha_limite_inscripcion.toString()) && 
                  ((event.cupos_disponibles ?? 0) > 0 || (event.suplentes_disponibles ?? 0) > 0)
                );
                
                const eventosConInscripcionCerrada = eventosArray.filter(
                  event => esFechaInscripcionVencida(event.fecha_limite_inscripcion.toString()) || 
                  ((event.cupos_disponibles ?? 0) === 0 && (event.suplentes_disponibles ?? 0) === 0)
                );

                return (
                  <>
                    {/* Mensaje si no hay eventos con inscripción abierta */}
                    {eventosConInscripcionAbierta.length === 0 && eventosConInscripcionCerrada.length > 0 && (
                      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-sm">
                        <div className="flex items-start">
                          <svg className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">
                              No hay eventos con inscripción activa en este momento
                            </h3>
                            <p className="text-blue-700 mb-3">
                              Actualmente no existen eventos disponibles para inscribirte, pero puedes ver los próximos eventos programados más abajo.
                            </p>
                            <div className="flex gap-3 mt-4">
                              <Link 
                                to="/mis-eventos" 
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Ver Mis Eventos
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

            <ul>
              {eventosArray
                // Ordenar: primero eventos con inscripción abierta, luego cerrada
                .sort((a, b) => {
                  const aVencida = esFechaInscripcionVencida(a.fecha_limite_inscripcion.toString());
                  const bVencida = esFechaInscripcionVencida(b.fecha_limite_inscripcion.toString());
                  
                  // Si a está vencida y b no, b va primero
                  if (aVencida && !bVencida) return 1;
                  // Si b está vencida y a no, a va primero
                  if (!aVencida && bVencida) return -1;
                  // Si ambas tienen el mismo estado, mantener orden original
                  return 0;
                })
                .map((event: evento) => {
                const fechaInscripcionVencida = esFechaInscripcionVencida(event.fecha_limite_inscripcion.toString());
                
                if (fechaInscripcionVencida) {
                  // Evento con inscripción cerrada - sin link
                  return (
                    <motion.li
                      key={event.id_evento}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="list-none"
                    >
                      <div className="flex items-start p-4 mb-4 bg-gray-100 rounded-lg shadow-sm w-full opacity-60 cursor-not-allowed">
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-gray-500 mb-1">
                            {event.nombre}
                          </h2>
                          <p className="text-gray-500 text-sm leading-relaxed mb-1 w-2/3">
                            {event.descripcion}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Fecha:</strong> {new Date(event.fecha).toLocaleDateString("es-AR")} |{" "}
                            <strong>Lugar:</strong> {event.lugar}
                          </p>
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-600 font-medium">
                              ⚠️ Fecha de inscripción cerrada
                            </p>
                            <p className="text-xs text-red-500">
                              Venció el {formatearFecha(event.fecha_limite_inscripcion.toString())}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                } else {
                  // Evento con inscripción abierta
                  const sinCuposTitulares = (event.cupos_disponibles ?? 0) === 0;
                  const haySuplentesDisponibles = (event.suplentes_disponibles ?? 0) > 0;
                  
                  if (sinCuposTitulares && !haySuplentesDisponibles) {
                    // Sin cupos titulares ni suplentes - sin link
                    return (
                      <motion.li
                        key={event.id_evento}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="list-none"
                      >
                        <div className="flex items-start p-4 mb-4 bg-gray-100 rounded-lg shadow-sm w-full opacity-60 cursor-not-allowed">
                          <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-500 mb-1">
                              {event.nombre}
                            </h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-1 w-2/3">
                              {event.descripcion}
                            </p>
                            <p className="text-sm text-gray-500">
                              <strong>Fecha:</strong> {new Date(event.fecha).toLocaleDateString("es-AR")} |{" "}
                              <strong>Lugar:</strong> {event.lugar}
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
                        </div>
                      </motion.li>
                    );
                  }
                  
                  if (sinCuposTitulares && haySuplentesDisponibles) {
                    // Sin cupos titulares pero hay suplentes - CON link
                    return (
                      <motion.li
                        key={event.id_evento}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        whileHover={{ scale: 1.02 }}
                        className="list-none"
                      >
                        <Link
                          to={`/eventos/${event.id_evento}`}
                          className="flex items-start p-4 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-full border-l-4 border-yellow-500"
                        >
                          <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-800 mb-1">
                              {event.nombre}
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-1 w-2/3">
                              {event.descripcion}
                            </p>
                            <p className="text-sm text-gray-500">
                              <strong>Fecha:</strong> {new Date(event.fecha).toLocaleDateString("es-AR")} |{" "}
                              <strong>Lugar:</strong> {event.lugar}
                            </p>
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-yellow-700 font-medium">
                                    📋 Puedes inscribirte como suplente
                                  </p>
                                  <p className="text-xs text-yellow-600">
                                    Lista de espera disponible hasta el {formatearFecha(event.fecha_limite_inscripcion.toString())}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
                                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span className="text-sm font-semibold text-yellow-700">
                                    {event.suplentes_disponibles} lugares en espera
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.li>
                    );
                  }
                  
                  // Con cupos disponibles - con link
                  return (
                    <motion.li
                      key={event.id_evento}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      whileHover={{ scale: 1.02 }}
                      className="list-none"
                    >
                      <Link
                        to={`/eventos/${event.id_evento}`}
                        className="flex items-start p-4 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-full border-l-4 border-green-500"
                      >
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-gray-800 mb-1">
                            {event.nombre}
                          </h2>
                          <p className="text-gray-600 text-sm leading-relaxed mb-1 w-2/3">
                            {event.descripcion}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Fecha:</strong> {new Date(event.fecha).toLocaleDateString("es-AR")} |{" "}
                            <strong>Lugar:</strong> {event.lugar}
                          </p>
                          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-green-600 font-medium">
                                  ✅ Puedes inscribirte
                                </p>
                                <p className="text-xs text-green-500">
                                  Hasta el {formatearFecha(event.fecha_limite_inscripcion.toString())}
                                </p>
                              </div>
                              {event.cupos_disponibles !== undefined && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-green-700">
                                      {event.cupos_disponibles} {event.cupos_disponibles === 1 ? 'cupo' : 'cupos'}
                                    </span>
                                  </div>
                                  {(event.cupos_suplente ?? 0) > 0 && (
                                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                                      <span className="text-xs font-medium text-yellow-700">
                                        +{event.cupos_suplente} suplentes
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.li>
                  );
                }
              })}
            </ul>
                  </>
                );
              })()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
