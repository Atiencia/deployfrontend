import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { LoadingButton } from "../components/LoadingButton";
import { toast } from "sonner";
import { useCrearNoticia, useCrearYFijarNoticia } from "../queries/noticiasQueries";
import { useGrupos } from "../queries/gruposQueries";

// Estado del formulario
type FormState = {
  titulo: string;
  descripcion: string;
  lugar: string | null;
  fijada: boolean;
  grupo_id: number | null;
  imagen_file?: File | null; // Archivo de imagen para subir
  duracionFijada?: "2h" | "6h" | "12h" | "24h" | "1w" | null; // Duración si está fijada
};

// Componente GrupoSelect (asumiendo que está ok)
interface GrupoSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export const GrupoSelect: React.FC<GrupoSelectProps> = ({ value, onChange }) => {

  const { data: grupos, isLoading: loadingGrupos, error: errorGrupos } = useGrupos()

  if (loadingGrupos) return <select disabled className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-500"><option>Cargando grupos...</option></select>;
  if (errorGrupos) return <select disabled className="w-full border-red-300 rounded-md shadow-sm p-2 bg-red-50 text-red-700"><option>{errorGrupos.message}</option></select>;

  return (
    <select
      id="grupo_id"
      name="grupo_id"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
    >
      <option value="">Ninguno</option>
      {grupos?.map((grupo) => (
        <option key={grupo.id_grupo} value={grupo.id_grupo}>
          {grupo.nombre}
        </option>
      ))}
    </select>
  );
};


export default function CrearNoticia() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    titulo: "",
    descripcion: "",
    lugar: null,
    fijada: false,
    grupo_id: null,
    imagen_file: null,
    duracionFijada: "6h" // Default inicial si se fija
  });

  const { mutate: crearNoticia, isPending: loading, error } = useCrearNoticia()
  const { mutate: crearYFijarNoticia } = useCrearYFijarNoticia()

  // --- Manejadores de cambios (sin cambios respecto a tu código) ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(prev => ({ ...prev, imagen_file: file })); // Guardar el archivo en el estado

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPreviewUrl(reader.result as string); };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setForm(prev => ({ ...prev, imagen_file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Resetea el input file
    }
  };

  const handleFijarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setForm(prev => ({
      ...prev,
      fijada: checked,
      // Resetear duración a default si se marca, null si se desmarca
      duracionFijada: checked ? (prev.duracionFijada ?? "6h") : null
    }));
  };

  const handleDuracionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as FormState["duracionFijada"];
    setForm(prev => ({ ...prev, duracionFijada: v }));
  };
  // --- Fin Manejadores de cambios ---


  // --- handleSubmit con lógica de 2 pasos ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.descripcion) {
      toast.error("El título y la descripción son obligatorios.");
      return;
    }

    // Guardamos la intención de fijar
    const esFijada = form.fijada;
    const duracion = esFijada ? (form.duracionFijada ?? "6h") : null;

    // Paso 0: Obtenemos el FormData para crear la noticia (imagen + texto base) ---
    const formData = new FormData();
    formData.append("titulo", form.titulo);
    formData.append("descripcion", form.descripcion);
    if (form.lugar) formData.append("lugar", form.lugar); // Solo si hay lugar
    // No enviar 'fijada' ni 'duracion_fijada' en este paso
    if (form.grupo_id !== null) formData.append("grupo_id", String(form.grupo_id));
    if (form.imagen_file) formData.append("imagen", form.imagen_file); // 'imagen' debe coincidir con upload.single()

    // --- PASO 1: Revisamos si la noticia es fijada.
    if (esFijada && duracion) {
      const putPayload = {
        // Solo enviar los campos relevantes para fijar/actualizar estado
        fijada: true,
        duracion_fijada: duracion
        // Opcionalmente, podrías reenviar otros campos ya que usamos un editar
      };

      crearYFijarNoticia({ noticia: formData, putPayload })
      return
    }

    //Paso 2: si no es fijada la creamos simplemente
    crearNoticia(formData)

    /*const newNoticiaId = nuevaNoticia?.id_noticia; // Asegúrate que el backend devuelva el ID

    console.log(nuevaNoticia)

    if (!newNoticiaId) {
      return toast.error("El backend no devolvió un ID para la noticia creada.");
    }*/

    if (!loading && !error) {
      // Resetear formulario completo
      setForm({
        titulo: "", descripcion: "", lugar: null, fijada: false,
        grupo_id: null, imagen_file: null, duracionFijada: "6h" // Resetear duración también
      });
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

  };

  // --- Renderizado del Formulario ---
  return (
    <div className="flex min-h-screen bg-gray-100"> {/* Fondo gris claro */}
      <Sidebar />
      <div className="flex-1 p-6 md:p-10"> {/* Padding general */}
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Crear Noticia
        </h2>

        {/* Contenedor del formulario */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6 border border-gray-200">          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              id="titulo"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
              maxLength={100}
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              required
              rows={5} // Un poco más alto
              className="w-full border-gray-300 rounded-md shadow-sm p-2 resize-y focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Grid para Lugar y Grupo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lugar (opcional) */}
            <div>
              <label htmlFor="lugar" className="block text-sm font-medium text-gray-700 mb-1">Lugar (opcional)</label>
              <input
                id="lugar"
                name="lugar"
                value={form.lugar || ""}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: Salón de actos, Online"
              />
            </div>

            {/* Grupo asociado (opcional) */}
            <div>
              <label htmlFor="grupo_id" className="block text-sm font-medium text-gray-700 mb-1">Grupo asociado (opcional)</label>
              <GrupoSelect
                // Pasar id si es necesario para el label
                value={form.grupo_id}
                onChange={(value) => setForm(prev => ({ ...prev, grupo_id: value }))}
              // Añadir clases para consistencia
              // className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Subida de Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (opcional)</label>
            
            {/* CAMBIO 1: El 'div' exterior ahora es un 'label'.
              Añadimos 'htmlFor', 'cursor-pointer' y quitamos 'items-center'
              para que el contenido se alinee arriba si hay preview.
            */}
            <label
              htmlFor="imagen-upload"
              className="mt-1 flex flex-col justify-center items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition-colors bg-gray-50 cursor-pointer min-h-[220px]" // Añadido min-h para mantener tamaño
            >
              {/* El input sigue oculto, pero ahora está DENTRO del label principal */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageChange}
                className="hidden"
                id="imagen-upload"
                onClick={(e) => e.stopPropagation()} // Evita que el clic en el input (si se "ve") propague
              />
              
              {previewUrl ? (
                <div className="text-center space-y-2">
                  <img 
                    src={previewUrl} 
                    alt="Vista previa" 
                    className="max-h-40 object-contain rounded-md border bg-white"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      // CAMBIO 3: Prevenir que el clic en el botón abra el diálogo de archivos
                      e.preventDefault(); 
                      e.stopPropagation();
                      handleRemoveImage(); // Usar handler para quitar
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Quitar imagen
                  </button>
                </div>
              ) : (
                /* CAMBIO 2: Esto era un <label> y ahora es un <div>.
                  No podemos anidar un <label> dentro de otro <label>.
                */
                <div className="cursor-pointer text-center space-y-1">
                  {/* Icono de subida */}
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-red-600 hover:text-red-500">Subir un archivo</span> o arrastrar y soltar
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hasta 5MB
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Fijar noticia */}
          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="fijada"
                name="fijada" // Asegúrate que el name coincida si usas handleChange genérico
                checked={form.fijada}
                onChange={handleFijarChange} // Usar handler específico
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="fijada" className="font-medium text-sm text-gray-700">
                Fijar noticia (priorizar en listas)
              </label>

              {/* Select de Duración (solo si fijada es true) */}
              {form.fijada && (
                <>
                  <span className="text-sm text-gray-500">por:</span>
                  <select
                    name="duracionFijada"
                    value={form.duracionFijada ?? "6h"} // Asegurar valor default si es null
                    onChange={handleDuracionChange}
                    className="ml-1 text-sm border-gray-300 rounded px-2 py-1 bg-white focus:ring-red-500 focus:border-red-500"
                    aria-label="Duración fijada"
                  >
                    <option value="2h">2 horas</option>
                    <option value="6h">6 horas</option>
                    <option value="12h">12 horas</option>
                    <option value="24h">1 día</option>
                    <option value="1w">1 semana</option>
                  </select>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 pl-7"> {/* Alineado con el checkbox */}
              La noticia aparecerá al principio de las listas mientras esté fijada.
            </p>
          </div>

          {/* Botón Submit y Mensajes */}
          <div className="pt-5">
            <div className="flex justify-end">
              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Creando..."
                // Clases del botón de ModificarNoticia para consistencia
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                disabled={loading} // Deshabilitar mientras carga
              >
                Crear Noticia
              </LoadingButton>
            </div>
            {/* Mensajes de error/éxito (opcional si usas toast) */}
            {error && <div className="mt-3 text-sm text-red-600 text-center">{error.message}</div>}
            {/* {success && <div className="mt-3 text-sm text-green-600 text-center">{success}</div>} */}
          </div>
        </form>
      </div>
    </div>
  );
}