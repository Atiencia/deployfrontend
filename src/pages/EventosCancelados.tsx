import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import type { evento } from "../../types/evento";
import { LoadingSpinner } from "../components/LoadingComponents";
import { useEventosCancelados } from "../queries/eventosQueries";

export default function EventosCanceladosPage() {
  const {data: eventos, isPending: loading, error} = useEventosCancelados()
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDay, setFilterDay] = useState("");

  // Filtrar eventos
  const filteredEvents = eventos ? eventos.filter((evento: evento) => {
    const matchesSearch =
      evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const eventDate = new Date(evento.fecha);
    const matchesYear =
      filterYear === "" || eventDate.getFullYear().toString() === filterYear;
    const matchesMonth =
      filterMonth === "" ||
      (eventDate.getMonth() + 1).toString().padStart(2, "0") === filterMonth;
    const matchesDay =
      filterDay === "" ||
      eventDate.getDate().toString().padStart(2, "0") === filterDay;

    return matchesSearch && matchesYear && matchesMonth && matchesDay;
  }) : [];

  return (
    <div className="flex">
      <Sidebar />
      <section className="w-70"></section>
      <div className="p-6 w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Eventos Cancelados</h2>
        
        {/* Filtros */}
        <div className="mb-6 space-y-4">
          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            className="px-4 py-2 border rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Filtros de fecha */}
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm text-gray-600">Filtrar por fecha:</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 border rounded w-24"
            >
              <option value="">Año</option>
              {[...new Set(eventos?.map((e) => new Date(e.fecha).getFullYear()))].map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 border rounded w-20"
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
              className="px-3 py-2 border rounded w-20"
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
          
          {/* Contador de resultados */}
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{filteredEvents.length}</span> eventos
            {(searchTerm || filterYear || filterMonth || filterDay) && (
              <span> (filtrados de {eventos?.length})</span>
            )}
          </p>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" message="Cargando eventos cancelados..." />
          </div>
        )}
        {error && <p className="text-red-500">{error.message}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
              filteredEvents.map(evento => (
                <Link to={`/modificar-evento/${evento.id_evento}`} key={evento.id_evento} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{evento.nombre}</h3>
                  <p className="text-gray-600 text-sm mb-3">{evento.descripcion}</p>
                  <div className="space-y-1 text-sm text-gray-500 mb-3">
                    <p><strong>Grupo:</strong> {evento.nombre_grupo || 'Sin grupo'}</p>
                    <p><strong>Fecha:</strong> {new Date(evento.fecha).toLocaleDateString('es-AR')}</p>
                    {evento.lugar && <p><strong>Lugar:</strong> {evento.lugar}</p>}
                    <p><strong>Cupos:</strong> {evento.cupos || 'Sin límite'}</p>
                  </div>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
                    Cancelado
                  </span>
                </Link>
              ))
            ) : (
              <p className="col-span-full text-center">No hay eventos cancelados.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
