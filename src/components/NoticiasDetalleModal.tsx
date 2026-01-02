import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoadingSpinner } from "./LoadingComponents";
import type { Noticia as NoticiaType } from "../../types/secretariaGrupo";
import { API_URL } from '../config/api';

// ICONO PIN
import PinIcon from "../components/icons/PinIcon";

interface Props {
  noticiaId: number;
  onClose: () => void;
}

const NoticiaDetalleModal: React.FC<Props> = ({ noticiaId, onClose }) => {
  const [noticia, setNoticia] = useState<NoticiaType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetalle() {
      setLoading(true);
      setError(null);
      setNoticia(null);

      try {
        const res = await fetch(`${API_URL}/noticias/${noticiaId}`, { credentials: "include" }); //acafetch
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }));
          throw new Error(errorData.error || `Error ${res.status}`);
        }
        const data = await res.json();
        setNoticia(data);
      } catch (err: any) {
        console.error("Error loadDetalle Modal:", err);
        setError(`Error al cargar la noticia: ${err.message}`);
        toast.error(`Error al cargar la noticia: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadDetalle();
  }, [noticiaId]); // Dependencia es el ID

  return (
    // Overlay oscuro
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose} // Cierra al hacer clic fuera
    >
      {/* Contenedor del Modal */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-slide-up"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro cierre el modal
      >
        {/* Botón de Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors z-10 p-1 bg-white/50 rounded-full"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
             <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
           </svg>
        </button>

        {/* Contenido */}
        {loading && (
          <div className="p-20 flex justify-center items-center">
            <LoadingSpinner message="Cargando noticia..." />
          </div>
        )}
        {error && !loading && (
          <div className="p-8 text-center text-red-600">{error}</div>
        )}
        {!loading && !noticia && !error && (
            <div className="p-8 text-center text-gray-500">Noticia no encontrada.</div>
        )}
        {!loading && noticia && (
          <article className="p-6 md:p-8">
            {/* Encabezado */}
            <div className="mb-4 border-b pb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{noticia.titulo}</h1>
              {noticia.fijada && (
                <div className="mt-2 flex items-center gap-1 text-sm text-yellow-800 font-medium bg-yellow-100 px-2 py-0.5 rounded w-fit" title="Noticia Fijada">
                  <PinIcon />
                  <span>Fijada</span>
                  {/* Aquí podrías añadir el timer si el backend lo envía */}
                </div>
              )}
            </div>

            {/* Metadatos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm text-gray-600">
               {/* ... (Mostrar Fecha, Publicado por, Grupo, Lugar como en NoticiaDetalle.tsx) ... */}
               <div>
                  <strong className="block text-gray-800">Fecha:</strong>
                  {new Date(noticia.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div>
                  <strong className="block text-gray-800">Publicado por:</strong>
                  {noticia.autor_nombre || (noticia.autor_id ? `ID: ${noticia.autor_id}` : '-')}
                </div>
                {(noticia.grupo_id || noticia.grupo_nombre) && (
                  <div>
                    <strong className="block text-gray-800">Grupo:</strong>
                    {noticia.grupo_nombre || (noticia.grupo_id ? `ID: ${noticia.grupo_id}` : '-')}
                  </div>
                )}
                {noticia.lugar && (
                  <div>
                    <strong className="block text-gray-800">Lugar:</strong>
                    {noticia.lugar}
                  </div>
                )}
            </div>

            {/* Imagen */}
            {noticia.imagen_path && (
              <img
                src={noticia.imagen_path.startsWith("http") ? noticia.imagen_path : noticia.imagen_path}
                alt={noticia.titulo}
                className="w-full h-auto max-h-[400px] object-contain rounded-md mb-6 bg-gray-100 border"
              />
            )}

            {/* Descripción */}
            <div className="prose prose-red max-w-none prose-sm sm:prose-base">
              <p className="whitespace-pre-wrap leading-relaxed">{noticia.descripcion}</p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default NoticiaDetalleModal;