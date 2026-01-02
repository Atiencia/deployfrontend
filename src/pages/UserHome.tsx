import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import GrupoCard from "../components/user/GrupoCard";
import SalidaCard from "../components/user/SalidaCard";
import { LoadingSpinner } from "../components/LoadingComponents";
import NoticiaDetalleModal from "../components/NoticiasDetalleModal";
import PinIcon from "../components/icons/PinIcon";
import { toast } from "react-toastify";
import { API_URL } from '../config/api';

import { verificarInscripcionUsuario } from "../Services/eventoService";
import type { evento, grupo } from "../../types/evento";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";

import CalendarioEventos from "../components/user/CalendarioEventos";
import { useLogout } from "../queries/listaQueries";
import { useGruposSeguidos } from "../queries/gruposQueries";
import { useEventosVigentes } from "../queries/eventosQueries";

type Noticia = {
  id_noticia: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagen_path?: string | null;
  autor?: string;
  grupo_id?: number | null;
  fijada?: boolean;
};

export default function UserHome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [eventos, setEventos] = useState<evento[]>([]); // Para "Salidas próximas"
  const [todosLosEventos, setTodosLosEventos] = useState<evento[]>([]); // Para el calendario
  const [eventosInscritos, setEventosInscritos] = useState<Set<number>>(new Set());
  const [loadingEventos, setLoadingEventos] = useState(true);
  const logoutAction = useLogout();
  const rolUsuario = useAtomValue(userRolAtom)

  const {data: grupos, isLoading: loadingGrupos} = useGruposSeguidos(rolUsuario)
  const {data: eventosData, isSuccess : eventosSuccess} = useEventosVigentes()

  // Noticias
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loadingNoticias, setLoadingNoticias] = useState(true);
  const [errorNoticias, setErrorNoticias] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedNoticiaId, setSelectedNoticiaId] = useState<number | null>(null);

  const [loadingCalendario, setLoadingCalendario] = useState(true);

  useEffect(() => {
    const nombreLocal = localStorage.getItem("userName");
    if (nombreLocal) {
      setUserName(nombreLocal);
    }

    setLoadingCalendario(true);

    async function getEventosYGruposYNoticias() {
      setLoadingEventos(true)
      try {
        // --- INSCRIPCIONES ---
        const inscritosSet = new Set<number>();
        if(!eventosData) throw new Error('No se han cargado aun los datos')
        for (const evento of eventosData) {
          try {
            const estaInscrito = await verificarInscripcionUsuario(evento.id_evento);
            if (estaInscrito) inscritosSet.add(evento.id_evento);
          } catch (err) {
            console.error(`Error verificando inscripción del evento ${evento.id_evento}`, err);
          }
        }
        setEventosInscritos(inscritosSet);

        // Guardar TODOS los eventos para el calendario (incluye pasados)
        setTodosLosEventos(eventosData);

        // Filtrar eventos VIGENTES para "Salidas próximas"
        const now = new Date().toISOString()
        const eventosFiltrados = eventosData.filter((e) => {
          const inscrito = inscritosSet.has(e.id_evento);
          const hayCupos = (e.cupos_disponibles ?? 0) > 0;
          const haySuplentes = (e.suplentes_disponibles ?? 0) > 0;
          console.log(now, '  ', e.fecha_limite_inscripcion)
          //const fechaInscripcionVencida = (e.fecha_limite_inscripcion ?? 0) > now as Date ;
          const salida = (e.categoria == 'salida');
          return (inscrito || hayCupos || haySuplentes) /*&& fechaInscripcionVencida*/ && salida;
        });
        const eventosOrdenados = eventosFiltrados.sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );

        setEventos(eventosOrdenados.slice(0, 6));
      } catch (err) {
        console.error("Error cargando datos del UserHome:", err);
        toast.error("No se pudieron cargar los eventos o grupos.");
      } finally {
        setLoadingCalendario(false);
        setLoadingEventos(false);
      }
    }

    async function loadNoticias() {
      setLoadingNoticias(true);
      setErrorNoticias(null);
      try {
        const res = await fetch(`${API_URL}/noticias`, { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setNoticias(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error cargando noticias:", err);
        setErrorNoticias("No se pudieron cargar las noticias");
      } finally {
        setLoadingNoticias(false);
      }
    }

    getEventosYGruposYNoticias();
    loadNoticias();
  }, [eventosSuccess]);

  // --- CALENDARIO: derivar listas (INCLUYE EVENTOS PASADOS) ---
  // Solo mostrar eventos donde el usuario está inscrito
  const misEventos = todosLosEventos.filter((e) => eventosInscritos.has(e.id_evento));
  const eventosIM: evento[] = [];

  // Noticias
  const handleCargarMasNoticias = () => {
    setVisibleCount((prev) => Math.min(prev + 6, 18, noticias.length));
  };
  const puedeCargarMasInline = visibleCount < 18 && visibleCount < noticias.length;
  const tieneMasDe18 = noticias.length > 18 && visibleCount >= 18;

  const handleNoticiaClick = (id: number) => setSelectedNoticiaId(id);
  const handleCloseModal = () => setSelectedNoticiaId(null);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-56">
        {/* Topbar */}
        <nav className="flex justify-between items-center px-20 py-4 bg-white shadow fixed top-0 right-0 left-0 md:left-56 z-30">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium text-base">
              Hola <span className="font-semibold text-red-700">{userName ?? "Usuario"}</span>!
            </span>
            <button
              type="button"
              className="px-4 py-2 bg-red-700 text-white rounded-md shadow focus:outline-none disabled:opacity-60 min-w-[100px]"
              onClick={() => {
                logoutAction.mutate();
              }}
              disabled={logoutAction.isPending}
            >
              {logoutAction.isPending ? "Cerrando..." : "Logout"}
            </button>
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="pt-20 px-8 pb-12">
          {/* CALENDARIO DE EVENTOS */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Calendario de Eventos</h2>

              {/* Leyenda */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500"></span>
                  <span className="text-gray-600">Mis Inscripciones</span>
                </div>
              </div>
            </div>

            {loadingCalendario ? (
              <div className="flex justify-center items-center bg-white p-6 rounded-lg shadow-md border h-64">
                <LoadingSpinner message="Cargando calendario..." />
              </div>
            ) : (
              <CalendarioEventos misEventos={misEventos} eventosIM={eventosIM} />
            )}
          </section>

          {/* MIS GRUPOS */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Mis grupos</h2>
            {!loadingGrupos ? grupos && grupos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {grupos.map((g: grupo) => (
                  <GrupoCard
                    key={g.id_grupo}
                    grupo={g}
                    onClick={() => navigate(`/grupos/${g.id_grupo}`)}
                  />
                ))}
              </div>
            ) : (
              <div>
                <p className="text-gray-400 text-lg text-center">
                  ¡Comenzá a seguir grupos y aparecerán acá!
                </p>
              </div>
            )
          :
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner message="Cargando grupos seguidos..." />
              </div>
          }

          </section>

          {/* SALIDAS PRÓXIMAS */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Salidas próximas</h2>
            {loadingEventos ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner message="Cargando salidas próximas..." />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {eventos.length > 0 ? (
                  eventos.map((evento) => (
                    <SalidaCard
                      key={evento.id_evento}
                      evento={evento}
                    />
                  ))
                ) : (
                  <p className="text-gray-400 text-lg col-span-2 text-center p-5">
                    No hay salidas programadas por el momento
                  </p>
                )}
              </div>
            )}
          </section>

          {/* NOTICIAS */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Noticias</h2>

            {loadingNoticias && (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner message="Cargando noticias..." />
              </div>
            )}
            {errorNoticias && !loadingNoticias && (
              <div className="text-center py-12 text-red-600">{errorNoticias}</div>
            )}
            {!loadingNoticias && !errorNoticias && noticias.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No hay noticias publicadas por el momento.
              </div>
            )}

            {!loadingNoticias && !errorNoticias && noticias.length > 0 && (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {noticias.slice(0, visibleCount).map((n) => (
                    <article
                      key={n.id_noticia}
                      className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition duration-200 cursor-pointer"
                      onClick={() => handleNoticiaClick(n.id_noticia)}
                    >
                      {n.fijada && (
                        <div
                          className="absolute top-2 right-2 p-1 bg-white/70 rounded-full backdrop-blur-sm"
                          title="Noticia Fijada"
                        >
                          <PinIcon />
                        </div>
                      )}
                      {n.imagen_path && (
                        <img
                          src={
                            n.imagen_path.startsWith("http")
                              ? n.imagen_path
                              : n.imagen_path
                          }
                          alt={n.titulo}
                          className="w-full h-44 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(n.fecha).toLocaleDateString()}
                        </p>
                        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">
                          {n.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {n.descripcion}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="flex justify-center mt-10">
                  {puedeCargarMasInline && (
                    <button
                      className="px-6 py-2 bg-white border border-red-700 text-red-700 rounded-md shadow hover:bg-red-50 transition"
                      onClick={handleCargarMasNoticias}
                    >
                      Cargar más...
                    </button>
                  )}
                  {tieneMasDe18 && (
                    <button
                      className="px-6 py-2 bg-red-700 border border-red-700 text-white rounded-md shadow hover:bg-red-800 transition"
                      onClick={() => navigate("/noticias")}
                    >
                      Ver todas las noticias
                    </button>
                  )}
                </div>
              </>
            )}
          </section>

          {selectedNoticiaId !== null && (
            <NoticiaDetalleModal noticiaId={selectedNoticiaId} onClose={handleCloseModal} />
          )}
        </main>
      </div>
    </div>
  );
}