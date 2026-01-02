import { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { NoAutorizado } from "./NoAutorizado";
import { LoadingButton } from "../components/LoadingButton";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { useCrearGrupo } from "../queries/gruposQueries";

export default function CrearGrupo() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    zona: "",
    liderGrupo: "",
    usuario_instagram: "",
    contacto_whatsapp: "",
    descripcion: "",
    imagen_file: null as File | null
  });

  const rolUsuario = useAtomValue(userRolAtom);

  const { mutate: crearGrupo, isPending: loading, error } = useCrearGrupo();

  if (![1, 2, 4, 5].includes(rolUsuario)) {
    return <NoAutorizado />;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setForm((prev) => ({ ...prev, imagen_file: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imagen_file: null }));
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Crear FormData
    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("zona", form.zona);
    formData.append("liderGrupo", form.liderGrupo);
    formData.append("usuario_instagram", form.usuario_instagram);
    formData.append("contacto_whatsapp", form.contacto_whatsapp);
    formData.append("descripcion", form.descripcion);

    if (form.imagen_file) {
      formData.append("imagen", form.imagen_file);
    }

    crearGrupo(formData);

    /*setTimeout(() => {
      setForm({
        nombre: "",
        zona: "",
        liderGrupo: "",
        usuario_instagram: "",
        contacto_whatsapp: "",
        descripcion: "",
        imagen_file: null
      });
      setPreviewUrl(null);
    }, 1000);*/
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 md:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Crear Grupo
        </h2>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6 border border-gray-200"
        >
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del grupo
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Zona y líder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localidad
              </label>
              <input
                name="zona"
                value={form.zona}
                onChange={handleChange}
                required
                className="w-full border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Líder del grupo
              </label>
              <input
                name="liderGrupo"
                value={form.liderGrupo}
                onChange={handleChange}
                required
                className="w-full border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario de Instagram
            </label>
            <input
              name="usuario_instagram"
              value={form.usuario_instagram}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md shadow-sm p-2"
              placeholder="@nombre_usuario"
            />
          </div>

          {/* Imagen a ancho completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo (imagen)
            </label>

            <label
              htmlFor="imagen-upload"
              className="mt-1 flex flex-col justify-center items-center 
                        p-6 border-2 border-dashed border-gray-300 rounded-lg 
                        hover:border-red-500 transition-colors 
                        bg-gray-50 cursor-pointer min-h-[250px] w-full"
            >
              <input
                ref={fileInputRef}
                id="imagen-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="text-center space-y-2">
                  <img
                    src={previewUrl}
                    className="max-h-56 rounded-md border bg-white object-contain mx-auto"
                  />
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:text-red-800"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                  >
                    Quitar imagen
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <p className="font-semibold text-red-600">Subir imagen</p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG — máx 5MB</p>
                </div>
              )}
            </label>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enlace de WhatsApp
            </label>
            <input
              name="contacto_whatsapp"
              value={form.contacto_whatsapp}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={5}
              required
              className="w-full border-gray-300 rounded-md shadow-sm p-2 resize-y"
            />
          </div>

          {/* Botón */}
          <div className="flex justify-end pt-5">
            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Creando..."
              className="py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Crear Grupo
            </LoadingButton>
          </div>

          {error && (
            <div className="text-center text-red-600 mt-3 text-sm">
              {error.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}