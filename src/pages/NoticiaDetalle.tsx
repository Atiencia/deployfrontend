// src/pages/NoticiaDetalle.tsx
import { useParams, useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { LoadingSpinner } from "../components/LoadingComponents";
import PinIcon from "../components/icons/PinIcon";
import { useNoticia } from "../queries/noticiasQueries";

export default function NoticiaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {data: noticia, isLoading: loading, error} = useNoticia(id!)


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoadingSpinner size="lg" message="Cargando noticia..." />
    </div>
  );

  if (error) return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-gray-100 min-h-screen">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-600 hover:text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Volver
      </button>
      <div className="p-8 text-center text-red-600 bg-white shadow rounded-lg border border-red-200">{error.message}</div>
      
    </div>
  );

  if (!noticia) return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-gray-100 min-h-screen">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-600 hover:text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Volver
      </button>
      <div className="p-8 text-center text-gray-500 bg-white shadow rounded-lg border">Noticia no encontrada.</div>
      
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 min-h-screen">
      
      <button onClick={() => navigate(-1)} className="mb-2 px-3 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm shadow-sm flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.78 12.78a.75.75 0 0 1-1.06 0L8 9.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L6.94 8 3.22 4.28a.75.75 0 0 1 1.06-1.06L8 6.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L9.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
        </svg>
        Volver
      </button>

      <article className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-gray-200">
        <div className="mb-4 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{noticia.titulo}</h1>
          {noticia.fijada && (
            <div className="mt-2 flex items-center gap-1 text-sm text-yellow-800 font-medium bg-yellow-100 px-2 py-0.5 rounded w-fit" title="Noticia Fijada">
              <PinIcon />
              <span>Fijada</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm text-gray-600">
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

        {noticia.imagen_path && (
          <img
            src={noticia.imagen_path.startsWith("http") ? noticia.imagen_path : noticia.imagen_path}
            alt={noticia.titulo}
            className="w-full h-auto max-h-[500px] object-contain rounded-md mb-6 bg-gray-100 border"
          />
        )}

        <div className="prose prose-red max-w-none prose-sm sm:prose-base">
          <p className="whitespace-pre-wrap leading-relaxed">{noticia.descripcion}</p>
        </div>
      </article>
    </div>
  );
}
