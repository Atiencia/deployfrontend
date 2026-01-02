import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import type { evento } from "../../types/evento";
import { ErrorState, LoadingSpinner } from "../components/LoadingComponents";
import { esFechaBajaVencida, formatearFecha } from "../utils/fechaUtils";
import { useMisEventos } from "../queries/eventosQueries";

export default function MisEventosPage() {
  const {data: eventos, isLoading: loading, error } = useMisEventos()

  // Mostrar loading mientras se cargan los eventos
  if (loading) {
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
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-56">
          <main className="pt-10 px-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Mis eventos
            </h1>
            <ErrorState
              message={error.message}
              onRetry={() => window.location.reload()}
            />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-56">
        <main className="pt-10 px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Mis Eventos</h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : eventos?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-lg p-10">
              <div className="max-w-md mx-auto">
                {/* Icono */}
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                {/* Mensaje principal */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  No estás inscrito a ningún evento
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Explora los eventos disponibles y únete a las actividades que más te interesen.
                </p>
                
                {/* Botón de acción */}
                <Link 
                  to="/eventos-disponibles" 
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Explorar Eventos Disponibles
                </Link>
              </div>
            </div>
          ) : (
            <ul>
              {Array.isArray(eventos) && eventos.map((event: evento) => {
                const fechaBajaVencida = esFechaBajaVencida(event.fecha_limite_baja.toString());
                const esSuplente = event.es_suplente || false;
                
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
                      to={`/eventos/${event.id_evento}?inscrito=true`}
                      className={`flex items-start p-4 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-full ${
                        esSuplente 
                          ? 'border-l-4 border-yellow-500' 
                          : fechaBajaVencida 
                            ? 'border-l-4 border-purple-500' 
                            : 'border-l-4 border-blue-500'
                      }`}
                    >
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">
                          {event.nombre}
                        </h2>
                        
                        {/* Mostrar badge de "Suplente" si corresponde */}
                        {esSuplente && (
                          <div className="inline-block mb-2">
                            <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Suplente
                            </span>
                          </div>
                        )}
                        
                        <p className="text-gray-600 text-sm leading-relaxed mb-1 w-2/3">
                          {event.descripcion}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Fecha:</strong> {new Date(event.fecha).toLocaleDateString("es-AR")} |{" "}
                          <strong>Lugar:</strong> {event.lugar}
                        </p>
                        
                        {esSuplente ? (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded">
                            <p className="text-sm text-yellow-700 font-medium">
                              📋 Estás inscrito como suplente
                            </p>
                            <p className="text-xs text-yellow-600">
                              Tu posición en la lista: #{event.orden_suplente} - Te avisaremos si se libera un cupo
                            </p>
                          </div>
                        ) : fechaBajaVencida ? (
                          <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
                            <p className="text-sm text-purple-600 font-medium">
                              🎉 ¡Te esperamos en el evento!
                            </p>
                            <p className="text-xs text-purple-500">
                              Haz clic para ver detalles del evento
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-600 font-medium">
                              ✅ Ya estás inscrito
                            </p>
                            <p className="text-xs text-blue-500">
                              Puedes darte de baja hasta el {formatearFecha(event.fecha_limite_baja.toString())}
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
