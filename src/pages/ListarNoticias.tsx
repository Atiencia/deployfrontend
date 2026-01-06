import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // <-- Importar framer-motion
import Sidebar from "../components/Sidebar";
import { TiempoRestanteFijacion } from '../components/TiempoRestanteFijacion';
import { ErrorState, LoadingSpinner } from "../components/LoadingComponents";
import { toast } from "sonner";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { useEliminarNoticia, useNoticias } from "../queries/noticiasQueries";

type Noticia = {
  id_noticia: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagen_path?: string | null;
  autor_id?: number;
  grupo_id?: number | null;
  fijada?: boolean;
  fijada_hasta?: string | null; // <-- añadido
};

export default function ListarNoticias() {
  const navigate = useNavigate();
  // --- NUEVO: Estados para los filtros ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDay, setFilterDay] = useState("");

  const rolUsuario = useAtomValue(userRolAtom);
  const { data: noticias, isLoading: loading, error , refetch} = useNoticias()

  const { mutate: eliminarNoticia } = useEliminarNoticia()

  const handleDelete = async (id: number) => {
    toast("¿Eliminar esta noticia?", {
      description: "Esta acción no se puede deshacer",
      action: {
        label: "Eliminar",
        onClick: () => eliminarNoticia(id)
      },
      cancel: {
        label: "Cancelar",
        onClick: () => { },
      },
    });
  };  // --- NUEVO: Lógica de filtrado ---
  const filteredNoticias =noticias? noticias
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
    // Opcional: Ordenar por fecha, más nuevas primero
    .sort((a: Noticia, b: Noticia) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) : [];

// Pantallas de Carga y Error (sin cambios)
  if (loading) {
          return (
      <div className="min-h-screen flex bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-56">
          <main className="pt-20 md:pt-10 px-4 md:px-8 flex-1 flex justify-center items-center">
            <LoadingSpinner size="lg" message="Cargando noticias..." />
          </main>
        </div>
      </div>
    );
  }
  if (error) {
        return (
      <div className="min-h-screen flex bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-56">
          <main className="pt-20 md:pt-10 px-4 md:px-8 flex-1 flex justify-center items-center">
          {/* Asegúrate que ErrorState exista y acepte estas props */}
            <ErrorState message={error.message} onRetry={refetch} />
          </main>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL (MODIFICADO) ---
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-56">
        <main className="pt-20 md:pt-10 px-4 md:px-8">
          {/* --- Cabecera (Simplificada) --- */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Noticias</h1>
          </div>

          {/* --- Filtros (Copiado de EventsList) --- */}
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
                .sort((a, b) => b - a)
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

          {/* --- Conteo de resultados --- */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{filteredNoticias.length}</span> noticias
              {(searchTerm || filterYear || filterMonth || filterDay) && (
                <span> (filtradas de {noticias.length})</span>
              )}
            </p>
          </div>

          {/* --- NUEVO: Layout de Lista --- */}
          {filteredNoticias.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron noticias con esos filtros.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredNoticias.map((n: Noticia) => (
                <motion.li
                  key={n.id_noticia}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="list-none relative bg-white rounded-lg shadow-sm border"
                >

                  {/* Botones de Admin (Estilo EventsList) */}
                  {(rolUsuario === 1 || rolUsuario === 2 || rolUsuario === 4) && (
                    <div className="flex md:absolute md:top-3 md:right-3 z-10 gap-2 p-3 md:p-0 border-b md:border-b-0">
                      <button
                        onClick={() => navigate(`/noticias/modificar/${n.id_noticia}`)}
                        className="flex-1 md:flex-none px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
                      >
                        Modificar {/* <-- TEXTO CAMBIADO */}
                      </button>
                      <button
                        onClick={() => handleDelete(n.id_noticia)}
                        className="flex-1 md:flex-none px-3 md:px-4 py-2 text-xs md:text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-100 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}

                  {/* Contenido de la Noticia (Estilo Lista) */}
                  <div className="flex flex-col md:flex-row items-start p-4">
                    {n.imagen_path && (
                      <img
                        src={n.imagen_path.startsWith("http") ? n.imagen_path : n.imagen_path}
                        alt={n.titulo}
                        className="w-full md:w-32 h-48 md:h-32 object-cover rounded-md md:mr-4 mb-4 md:mb-0 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center mb-1 flex-wrap"> {/* Añadido flex-wrap */}
                        <h2 className="text-lg font-semibold text-gray-800 mr-2"> {/* Añadido mr-2 */}
                          {n.titulo}
                        </h2>
                        {n.fijada && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full font-medium">
                            Fijada
                          </span>
                        )}
                        {/* --- MOSTRAR TIMER --- */}
                        <TiempoRestanteFijacion fijadaHasta={n.fijada_hasta ?? null} />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(n.fecha).toLocaleDateString("es-AR")}
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed mb-1 w-full md:w-2/3">
                        {n.descripcion}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}