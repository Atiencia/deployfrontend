import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import type { evento } from "../../types/evento";
import { toast } from "sonner";
import { LoadingSpinner, ErrorState } from "../components/LoadingComponents";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { formatearFecha } from "../utils/fechaUtils";
import { useCancelarEvento, useEliminarEvento, useEventosVigentes, useVerificarInscripcion } from "../queries/eventosQueries";
import { LoadingButton } from "../components/LoadingButton";
import { useEventosGrupo, useMisGruposSecretaria } from "../queries/secretariaGrupoQueries";

interface eventComponentProps {
  event: evento
}

export function EventComponent({ event }: eventComponentProps) {
  const rolUsuario = useAtomValue(userRolAtom);
  const navigate = useNavigate();
  const { data: inscripto, isLoading } = useVerificarInscripcion(event.id_evento);
  const mutationCancelar = useCancelarEvento();
  const mutationEliminar = useEliminarEvento();

  let tarjetaEvento;

  // Determinar si es admin o secretaria
  const esAdminOSecretaria = rolUsuario === 1 || rolUsuario === 2 || rolUsuario === 4 || rolUsuario === 5;

  // === Vista para Admin/Secretaria ===
  if (esAdminOSecretaria) {
    tarjetaEvento = (
      <div className="flex items-start p-4 mb-4 bg-white rounded-lg shadow-sm w-full">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            {event.nombre}
          </h2>
          <div className="text-gray-600 text-sm leading-relaxed mb-1">
            {event.descripcion}
          </div>
          <div className="text-sm text-gray-500 mb-2">
            <strong>Grupo:</strong> {event.nombre_grupo || "Sin grupo asignado"} |{" "}
            <strong>Fecha:</strong>{" "}
            {new Date(event.fecha).toLocaleDateString("es-AR")} |{" "}
            <strong>Lugar:</strong> {event.lugar}
          </div>
          <div className="text-sm text-gray-700 mb-2">
            <strong>Cupos disponibles:</strong> {event.cupos_disponibles ?? 0} / {event.cupos} {event.cupos_disponibles === 0 ? '(Lleno)' : ''}
            {event.cupos_suplente > 0 && (
              <>
                {' | '}
                <strong>Lista de espera:</strong> {(event.cupos_suplente - (event.suplentes_disponibles ?? event.cupos_suplente))} / {event.cupos_suplente}
              </>
            )}
          </div>
          <span className="inline-block mt-3 px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded">
            Vigente
          </span>
        </div>
      </div>
    );
  }
  // === Variante 1: inscrito pero fecha de baja vencida ===
  else if (inscripto && event.fecha_limite_baja && new Date(event.fecha_limite_baja) < new Date() && !isLoading) {
    tarjetaEvento = (
      <Link
        to={`/eventos/${event.id_evento}?inscrito=true`}
        className="flex items-start p-4 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-full border-l-4 border-purple-500"
      >
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            {event.nombre}
          </h2>
          <div className="text-gray-600 text-sm leading-relaxed mb-1 w-2/3">
            {event.descripcion}
          </div>
          <div className="text-sm text-gray-500">
            <strong>Grupo:</strong> {event.nombre_grupo || "Sin grupo asignado"} |{" "}
            <strong>Fecha:</strong>{" "}
            {new Date(event.fecha).toLocaleDateString("es-AR")} |{" "}
            <strong>Lugar:</strong> {event.lugar}
          </div>
          <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
            <div className="text-sm text-purple-600 font-medium">
              🎉 ¡Te esperamos en el evento!
            </div>
            <div className="text-xs text-purple-500">
              Haz clic para ver detalles del evento
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // === Variante 2: inscrito pero aún puede darse de baja ===
  else if (inscripto && !isLoading) {
    tarjetaEvento = (
      <Link
        to={`/eventos/${event.id_evento}?inscrito=true`}
        className="flex items-start p-4 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-full border-l-4 border-blue-500"
      >
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            {event.nombre}
          </h2>
          <div className="text-gray-600 text-sm leading-relaxed mb-1 w-2/3">
            {event.descripcion}
          </div>
          <div className="text-sm text-gray-500">
            <strong>Grupo:</strong> {event.nombre_grupo || "Sin grupo asignado"} |{" "}
            <strong>Fecha:</strong>{" "}
            {new Date(event.fecha).toLocaleDateString("es-AR")} |{" "}
            <strong>Lugar:</strong> {event.lugar}
          </div>
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="text-sm text-blue-600 font-medium">✅ Ya estás inscrito</div>
            <div className="text-xs text-blue-500">
              Puedes darte de baja hasta el{" "}
              {formatearFecha(event.fecha_limite_baja.toString())}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // === Variante 3: inscripción abierta ===
  else {
    tarjetaEvento = (
      <div
        onClick={() => {
          if (rolUsuario === 0) {
            toast.dismiss();
            toast.info('Debes loguearte primero para inscribirte a eventos', {
              duration: 3000
            });
          }
        }}
        className="flex items-start p-6 mb-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full border border-gray-100 cursor-pointer"
      >
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 flex-1">
              {event.nombre}
            </h2>
            <span className="ml-4 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
              Vigente
            </span>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {event.descripcion}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Grupo:</span>&nbsp;{event.nombre_grupo || "Sin grupo"}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Fecha:</span>&nbsp;{new Date(event.fecha).toLocaleDateString("es-AR")}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Lugar:</span>&nbsp;{event.lugar}
            </div>
          </div>

          {rolUsuario !== 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-700 font-semibold mb-1">
                    Inscripciones abiertas
                  </div>
                  <div className="text-xs text-green-600">
                    Fecha límite: {formatearFecha(new Date(event.fecha_limite_inscripcion).toLocaleDateString("es-AR"))}
                  </div>
                </div>
                <Link
                  to={`/eventos/${event.id_evento}`}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 bg-red-700 hover:bg-red-800 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Inscribirse
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Eliminar evento al click en eliminar
  const handleDelete = async (id: number) => {
    toast("¿Eliminar este evento?", {
      description: "Esta acción no se puede deshacer",
      action: {
        label: "Eliminar evento",
        onClick: async () => {
          mutationEliminar.mutate(id)
        }
      },
      closeButton: true
    })
  };

  // Cancelar evento
  const handleCancel = async (id: number, nombreEvento: string) => {
    toast(`¿Seguro que quieres cancelar el evento ${nombreEvento}`, {
      description: "Esta acción no se puede deshacer",
      action: {
        label: "Cancelar evento",
        onClick: async () => {
          mutationCancelar.mutate(id)
        }
      },
      closeButton: true
    })
  };

  // Redirigir a página de edición al click en modificar.
  const handleEdit = (id: number) => {
    navigate(`/modificar-evento/${id}`);
  };

  return (
    <motion.li
      key={event.id_evento}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="list-none relative flex items-center w-full"
    >

      {/* botón de opciones solo si es admin o secretaría */}
      {(rolUsuario === 2 || rolUsuario === 4 || rolUsuario === 5) && (
        <div className="absolute top-0 right-0 z-10 flex gap-2 justify-end p-4">
          {/* 'Ver Detalles' button removed */}

          {/* Botón Modificar */}
          <button
            onClick={() => handleEdit(event.id_evento)}
            className="group relative px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            title="Modificar evento"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="hidden sm:inline">Modificar</span>
          </button>

          {/* Botón Cancelar */}
          {!mutationCancelar.isPending ?
            <button
              onClick={() => handleCancel(event.id_evento, event.nombre)}
              className="group relative px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              title="Cancelar evento y notificar inscriptos"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="hidden sm:inline">Cancelar</span>
            </button>
            :
            <LoadingButton children={undefined} loading={true}></LoadingButton>
          }

          {/* Botón Eliminar */}
          {!mutationEliminar.isPending ?
            <button
              onClick={() => handleDelete(event.id_evento)}
              className="group relative px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              title="Eliminar evento permanentemente"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="hidden sm:inline">Eliminar</span>
            </button>
            :
            <LoadingButton children={undefined} loading={true} ></LoadingButton>
          }
        </div>
      )}

      {/* Tarjeta de evento - Renderizar directamente sin envoltura adicional */}
      {tarjetaEvento}
    </motion.li>
  )
}

export default function EventosComponent() {
  const navigate = useNavigate();
  const rolUsuario = useAtomValue(userRolAtom)
  const { data: eventosVigentes, isLoading: loading, isError: error, error: errorMsg } = useEventosVigentes()
  const { data: infoSecretaria } = useMisGruposSecretaria(rolUsuario)
  const grupoId = infoSecretaria?.grupos?.[0]?.id_grupo || 0;
  const { data: eventosGrupo } = useEventosGrupo(grupoId);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const [eventos, setEventos] = useState<evento[]>([])

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState(initialCategory);
  const [filterGroup, setFilterGroup] = useState("");

  useEffect(() => {
    // Para secretaria grupal (rol 5), usar solo los eventos de su grupo
    if (rolUsuario === 5 && eventosGrupo?.eventos) {
      setEventos(eventosGrupo.eventos);
    } 
    // Para otros roles, usar todos los eventos vigentes
    else if (rolUsuario !== 5 && eventosVigentes) {
      setEventos(eventosVigentes);
    }
  }, [eventosGrupo, eventosVigentes, rolUsuario])

  // Filtrar eventos
  const filteredEvents = eventos ? eventos.filter((event: evento) => {
    const matchesSearch =
      event.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGroup =
      filterGroup === "" || event.nombre_grupo?.toLowerCase().includes(filterGroup.toLowerCase());

    const matchesStatus =
      filterStatus === "" || event.estado === filterStatus;

    const matchesCategories =
      filterCategory === "" || event.categoria === filterCategory;

    return matchesSearch && matchesGroup && matchesStatus && matchesCategories;
  }) : [];

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-56">
          <main className="pt-10 px-8">
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          </main>
        </div>
      </>
    );
  }

  // Mostrar error si hay problemas cargando eventos
  if (error) {
    return (
      <>
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-56">
          <main className="pt-10 px-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Eventos</h1>
            <ErrorState
              message={errorMsg.message.includes('401') ? 'Logueate para poder acceder a los eventos! ' : errorMsg.message}
              onRetry={() => window.location.reload()}
            />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-56">
        <main className="pt-10 px-8">
          {/* Banner de registro para usuarios no logueados */}
          {rolUsuario === 0 && (
            <div className="mb-8 p-6 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border-2 border-red-200 rounded-xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    ¿Quieres participar en este evento?
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Crea una cuenta gratuita para inscribirte a eventos, recibir notificaciones y ser parte de nuestra comunidad.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate('/register')}
                      className="px-8 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Registrarme ahora
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-3 bg-white hover:bg-gray-50 text-red-700 font-semibold rounded-lg border-2 border-red-200 hover:border-red-300 transition-all duration-200"
                    >
                      Ya tengo cuenta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Eventos</h1>
            <div className="flex gap-4">
              {/* Botón de exportar listas solo para admin (rol 2) y secretarias (rol 4 y 5) */}
              {(rolUsuario === 2 || rolUsuario === 4 || rolUsuario === 5) && (
                <button
                  onClick={() => navigate("/eventos/lista/participantes")}
                  className="px-6 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition duration-200 shadow-md flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Exportar Listas
                </button>
              )}
            </div>
          </div>

          {/* Filtros BUSCADOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="px-4 py-2 border rounded w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <input
              type="text"
              placeholder="Filtrar por grupo..."
              className="px-4 py-2 border rounded w-full"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
            />
          </div>

          {/* Filtro de estado solo para admin o secretaría */}
          {(rolUsuario === 2 || rolUsuario === 4 || rolUsuario === 5) && (
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <label className="text-sm text-gray-600">Filtrar por estado:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded w-40"
              >
                <option value="">Todos</option>
                <option value="vigente">Vigentes</option>
                <option value="transcurrido">Transcurridos</option>
                <option value="cancelado">Cancelados</option>
              </select>

              <label className="text-sm text-gray-600">Filtrar por categoría:</label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilterCategory(v);
                  if (v) setSearchParams({ category: v });
                  else setSearchParams({});
                }}
                className="px-3 py-2 border rounded w-40"
              >
                <option value="">Todos</option>
                <option value="salida">Salida Misionera</option>
                <option value="normal">Normal</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          )}

          {/* Lista de eventos */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{filteredEvents.length}</span> eventos
              {(searchTerm || filterGroup || filterCategory || filterStatus) && (
                <span> (filtrados de {eventos?.length})</span>
              )}
            </p>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron eventos.</p>
            </div>
          ) : (
            <ul>
              {filteredEvents.map((e: evento) =>
                <EventComponent key={e.id_evento} event={e} />
              )}
            </ul>
          )}
        </main>
      </div>
    </>
  );
}