import { useState } from "react";
import Sidebar from "../components/Sidebar";

interface Noticia {
  id_noticia: number;
  titulo: string;
  descripcion?: string;
  fecha: string;
  imagen_path?: string;
  fijada: boolean;
}
import { LoadingSpinner, ErrorState } from "../components/LoadingComponents";
import NoticiaDetalleModal from "../components/NoticiasDetalleModal"; // <-- IMPORTAR MODAL

// ICONO PIN
import PinIcon from "../components/icons/PinIcon";
import { useNoticias } from "../queries/noticiasQueries";

const NOTICIAS_POR_PAGINA = 18; // Máximo antes de cambiar de página
const NOTICIAS_POR_CARGA = 6;  // Cuántas cargar con "Cargar más"

export default function NoticiasUsuario() {
  const { data: noticias, isLoading: loading, error, refetch, isRefetchError } = useNoticias()

  // Estados de paginación
  const [visibleCount, setVisibleCount] = useState(NOTICIAS_POR_CARGA);
  const [currentPage, setCurrentPage] = useState(1);

  // Add new filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDay, setFilterDay] = useState("");

  // --- NUEVO: Estado para controlar qué noticia mostrar en el modal ---
  const [selectedNoticiaId, setSelectedNoticiaId] = useState<number | null>(null);

  /*useEffect(() => {
    loadNoticias();
  }, []);

  async function loadNoticias() {           decir si se usa o no 
    setCurrentPage(1);
    setVisibleCount(NOTICIAS_POR_CARGA);
  }*/

  const sortedData = noticias ? (Array.isArray(noticias) ? noticias : []).sort((a, b) => {
    if (a.fijada && !b.fijada) return -1;
    if (!a.fijada && b.fijada) return 1;
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  }) : [];

  // Add filtering logic before pagination
  const filteredNoticias = sortedData
    .filter((noticia: Noticia) => {
      const matchesSearch =
        noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        noticia.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

      const eventDate = new Date(noticia.fecha);
      const matchesYear =
        filterYear === "" || eventDate.getFullYear().toString() === filterYear;
      const matchesMonth =
        filterMonth === "" ||
        (eventDate.getMonth() + 1).toString().padStart(2, "0") === filterMonth;
      const matchesDay =
        filterDay === "" ||
        eventDate.getDate().toString().padStart(2, "0") === filterDay;

      return matchesSearch && matchesYear && matchesMonth && matchesDay;
    })
    .sort((a: Noticia, b: Noticia) => {
      if (a.fijada && !b.fijada) return -1;
      if (!a.fijada && b.fijada) return 1;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

  // Update pagination logic to use filtered results
  const startIndex = (currentPage - 1) * NOTICIAS_POR_PAGINA;
  const endIndex = Math.min(startIndex + visibleCount, startIndex + NOTICIAS_POR_PAGINA, filteredNoticias.length);
  const noticiasVisibles = filteredNoticias.slice(startIndex, endIndex);

  // Update total pages calculation
  const totalPages = Math.ceil(filteredNoticias.length / NOTICIAS_POR_PAGINA);

  const handleCargarMas = () => {
    setVisibleCount(prev => Math.min(prev + NOTICIAS_POR_CARGA, NOTICIAS_POR_PAGINA));
  };

  const handlePaginaSiguiente = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      setVisibleCount(NOTICIAS_POR_CARGA);
      window.scrollTo(0, 0);
    }
  };

  const handlePaginaAnterior = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setVisibleCount(NOTICIAS_POR_CARGA);
      window.scrollTo(0, 0);
    }
  };

  // Determina si se puede cargar más DENTRO de la página actual
  const puedeCargarMasInline = noticias ? visibleCount < NOTICIAS_POR_PAGINA && endIndex < noticias.length && (startIndex + visibleCount) < (startIndex + NOTICIAS_POR_PAGINA) : false;
  const estaMostrandoTodoEnPaginaActual = noticias ? endIndex === Math.min(startIndex + NOTICIAS_POR_PAGINA, noticias.length) : false;
  const estaEnUltimaPaginaMostrandoTodo = noticias ? currentPage === totalPages && endIndex === noticias.length : false;

  // --- NUEVO: Función para abrir el modal ---
  const handleNoticiaClick = (id: number) => {
    setSelectedNoticiaId(id);
  };

  // --- NUEVO: Función para cerrar el modal ---
  const handleCloseModal = () => {
    setSelectedNoticiaId(null);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-56">
        <main className="pt-10 px-8 pb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Noticias</h1>
            <button
              onClick={() => refetch}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              Refrescar
            </button>
          </div>

          {/* Add Search Filters */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              className="px-4 py-2 border rounded-md w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center mb-6">
            <label className="text-sm text-gray-600">Filtrar por fecha:</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 border rounded-md w-24 bg-white"
            >
              <option value="">Año</option>
              {[...new Set<number>((noticias || []).map((n: Noticia) => new Date(n.fecha).getFullYear()))]
                .sort((a, b) => b - a)      //modifique el tipado con ia
                .map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 border rounded-md w-20 bg-white"
            >
              <option value="">Mes</option>
              {[...Array(12)].map((_, i) => {
                const month = String(i + 1).padStart(2, "0");
                return (
                  <option key={month} value={month}>
                    {month}
                  </option>
                );
              })}
            </select>

            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="px-3 py-2 border rounded-md w-20 bg-white"
            >
              <option value="">Día</option>
              {[...Array(31)].map((_, i) => {
                const day = String(i + 1).padStart(2, "0");
                return (
                  <option key={day} value={day}>
                    {day}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{noticiasVisibles.length}</span> de{' '}
              <span className="font-semibold">{filteredNoticias.length}</span> noticias
              {(searchTerm || filterYear || filterMonth || filterDay) && (
                <span> (filtradas de {noticias.length} totales)</span>
              )}
            </p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner message="Cargando noticias..." />
            </div>
          )}
          {error && !loading && isRefetchError && (
            <div className="py-20">
              <ErrorState message={error.message} onRetry={refetch} />
            </div>
          )}
          {!loading && !error && filteredNoticias.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              {noticias.length === 0
                ? "No hay noticias publicadas por el momento."
                : "No se encontraron noticias con los filtros seleccionados."}
            </div>
          )}

          {/* Grid de Noticias */}
          {!loading && !error && noticias.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {noticiasVisibles.map((n: Noticia) => (
                  <article
                    key={n.id_noticia}
                    // --- CAMBIADO: onClick ahora abre el modal ---
                    onClick={() => handleNoticiaClick(n.id_noticia)}
                    className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition duration-200 cursor-pointer group"
                  >
                    {/* Icono Pin */}
                    {n.fijada && (
                      <div className="absolute top-2 right-2 p-1 bg-white/70 rounded-full backdrop-blur-sm z-10" title="Noticia Fijada">
                        <PinIcon />
                      </div>
                    )}

                    {n.imagen_path ? (
                      <img
                        src={n.imagen_path.startsWith("http") ? n.imagen_path : n.imagen_path}
                        alt={n.titulo}
                        className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm16.5-1.5H3.75V6H20.25v12z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">
                        {new Date(n.fecha).toLocaleDateString()}
                      </p>
                      <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-red-700 transition-colors">
                        {n.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {n.descripcion}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
                {currentPage > 1 && (
                  <button
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 transition"
                    onClick={handlePaginaAnterior}
                  >
                    &larr; Página Anterior
                  </button>
                )}

                {puedeCargarMasInline && (
                  <button
                    className="px-6 py-2 bg-white border border-red-700 text-red-700 rounded-md shadow hover:bg-red-50 transition"
                    onClick={handleCargarMas}
                  >
                    Cargar más... ({noticiasVisibles.length % NOTICIAS_POR_CARGA === 0 ? noticiasVisibles.length / NOTICIAS_POR_CARGA + 1 : Math.ceil(noticiasVisibles.length / NOTICIAS_POR_CARGA)}/{Math.ceil(Math.min(NOTICIAS_POR_PAGINA, noticias.length - startIndex) / NOTICIAS_POR_CARGA)})
                  </button>
                )}

                {currentPage < totalPages && estaMostrandoTodoEnPaginaActual && (
                  <button
                    className="px-6 py-2 bg-red-700 border border-red-700 text-white rounded-md shadow hover:bg-red-800 transition"
                    onClick={handlePaginaSiguiente}
                  >
                    Página Siguiente &rarr; ({currentPage}/{totalPages})
                  </button>
                )}

                {estaEnUltimaPaginaMostrandoTodo && (
                  <span className="text-gray-500 text-sm">Fin de las noticias</span>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* --- NUEVO: Renderizar el modal condicionalmente --- */}
      {selectedNoticiaId !== null && (
        <NoticiaDetalleModal
          noticiaId={selectedNoticiaId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}