import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../components/LoadingComponents";
import { useEditarNoticia, useNoticia } from "../queries/noticiasQueries";

// Definimos el tipo para el formulario
interface NoticiaFormData {
  titulo: string;
  descripcion: string;
  lugar: string;
  fijada: boolean;
  // --- NUEVO ---
  duracionFijada: "2h" | "6h" | "12h" | "24h" | "1w" | null;
}

export default function ModificarNoticia() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <p>No se específico el id de la noticica</p>
  const { data: noticia, isLoading: loading, error } = useNoticia(id);
  const { mutate: editarNoticia } = useEditarNoticia()

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<NoticiaFormData>({
    titulo: '',
    descripcion: '',
    lugar: '',
    fijada: false,
    // --- NUEVO ---
    duracionFijada: "6h", // Default
  });

  // Cargar rol y datos de la noticia al inicio
  useEffect(() => {
    if (noticia) {
      setFormData({
        titulo: noticia.titulo ?? "",
        descripcion: noticia.descripcion ?? "",
        lugar: noticia.lugar ?? "",
        fijada: Boolean(noticia.fijada),
        // --- NUEVO ---
        // (Backend no devuelve duración, así que usamos default)
        duracionFijada: "6h",
      });
    }

  }, [noticia]);

  // Manejador para inputs de TEXTO (titulo, descripcion, lugar)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- NUEVO: Manejador específico para el CHECKBOX ---
  const handleFijarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      fijada: checked,
      // Si se marca, default "6h". Si se desmarca, null.
      duracionFijada: checked ? (prev.duracionFijada ?? "6h") : null
    }));
  };

  // --- NUEVO: Manejador para el SELECT de duración ---
  const handleDuracionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as NoticiaFormData["duracionFijada"];
    setFormData(prev => ({ ...prev, duracionFijada: v }));
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!noticia) return;

    // --- ACTUALIZADO: Enviar payload con 'duracion_fijada' ---
    const payload = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      lugar: formData.lugar || null,
      fijada: formData.fijada,
      // Si está fijada, envía la duración. Si no, envía null.
      duracion_fijada: formData.fijada ? (formData.duracionFijada ?? "6h") : null
    };

    editarNoticia({ putPayload: payload, noticiaId: id })

    setTimeout(() => {
      setEditMode(false);
    }, 1500);
    // navigate("/noticias/admin"); // Opcional: navegar de vuelta
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditMode(false);
    if (noticia) {
      setFormData({
        titulo: noticia.titulo,
        descripcion: noticia.descripcion,
        lugar: noticia.lugar ?? "",
        fijada: noticia.fijada ?? false,
        // --- NUEVO ---
        duracionFijada: "6h", // Reset a default
      });
    }
  };


  // --- Renderizado ---

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <LoadingSpinner size="lg" message="Cargando datos de la noticia..." />
    </div>
  );

  if (error) return <p className="p-6 text-red-600 text-center">{error.message}</p>;
  if (!noticia) return <p className="p-6 text-center">Noticia no encontrada.</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-white min-h-screen">


      <button
        onClick={() => navigate('/noticias/admin')}
        className="mb-4 px-4 py-2 bg-[#C04A4A] text-white hover:bg-[#a83e3e] rounded-md transition-colors"
      >
        ← Volver
      </button>

      <h1 className="text-3xl font-extrabold text-black">Detalles de la Noticia</h1>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">

        {/* --- TÍTULO --- */}
        <div>
          <label className="block text-gray-600 text-sm font-medium">Título de la noticia</label>
          {editMode ? (
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange} // Usa el genérico
              className="w-full border p-2 rounded-md border-gray-300"
            />
          ) : (
            <p className="text-lg font-semibold">{noticia.titulo}</p>
          )}
        </div>

        {/* --- DESCRIPCIÓN --- */}
        <div>
          <label className="block text-gray-600 text-sm font-medium">Descripción</label>
          {editMode ? (
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange} // Usa el genérico
              className="w-full border p-2 rounded-md border-gray-300"
              rows={4}
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{noticia.descripcion}</p>
          )}
        </div>

        {/* --- GRID DE DATOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* --- FECHA (Solo vista) --- */}
          <div>
            <label className="block text-gray-600 text-sm font-medium">Fecha</label>
            <p className="text-gray-700">{new Date(noticia.fecha).toLocaleDateString('es-AR')}</p>
          </div>

          {/* --- LUGAR (Editable) --- */}
          <div>
            <label className="block text-gray-600 text-sm font-medium">Lugar</label>
            {editMode ? (
              <input
                type="text"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange} // Usa el genérico
                className="border p-2 rounded-md w-full border-gray-300"
                placeholder="Ej: UAP, Online, etc."
              />
            ) : (
              <p className="text-gray-700">{noticia.lugar || '-'}</p>
            )}
          </div>
        </div>

        {/* --- FIJADA (ACTUALIZADO CON DROPDOWN) --- */}
        <div>
          <label className="block text-gray-600 text-sm font-medium">Estado</label>
          {editMode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="fijada"
                  name="fijada"
                  checked={formData.fijada}
                  onChange={handleFijarChange} // <-- USA EL HANDLER ESPECIAL
                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="fijada" className="text-gray-700 font-normal">
                  Marcar como noticia fijada (aparecerá primero)
                </label>

                {/* --- NUEVO DROPDOWN --- */}
                {formData.fijada && (
                  <select
                    name="duracionFijada"
                    value={formData.duracionFijada ?? "6h"}
                    onChange={handleDuracionChange}
                    className="ml-2 text-sm border border-gray-200 rounded px-2 py-1 bg-white"
                    aria-label="Duración fijada"
                  >
                    <option value="2h">2 horas</option>
                    <option value="6h">6 horas</option>
                    <option value="12h">12 horas</option>
                    <option value="24h">1 día</option>
                    <option value="1w">1 semana</option>
                  </select>
                )}
                {/* --- FIN DROPDOWN --- */}
              </div>
            </div>
          ) : (
            <p className={`text-gray-700 font-medium ${noticia.fijada ? 'text-green-600' : 'text-gray-500'}`}>
              {noticia.fijada ? 'Fijada' : 'No fijada'}
            </p>
          )}
        </div>

        {/* Botones Editar / Guardar / Cancelar */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 bg-[#C04A4A] text-white rounded-md shadow hover:bg-[#a83e3e] transition-colors"
            >
              Modificar Noticia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
