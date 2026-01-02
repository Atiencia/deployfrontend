export const obtenerNoticia = async (noticiaId: string) => {
    const res = await fetch(`http://localhost:5000/api/noticias/${noticiaId}`, { credentials: "include" }); //acafetch
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }));
        throw new Error(errorData.error || `Error ${res.status}`);
    }

    const data = await res.json();
    return data
}

export const crearNoticia = async (formData: FormData) => {
    const response = await fetch("http://localhost:5000/api/noticias", {
        method: "POST",
        credentials: "include", // Importante para cookies/sesiones
        body: formData, // No necesita headers['Content-Type']
    });

    if (!response.ok) throw new Error(`Error al crear noticia: ${response.statusText}`)


    const data = await response.json()
    return data
}

export const obtenerNoticias = async () => {
    const response = await fetch("http://localhost:5000/api/noticias", { credentials: "include" });
    if (!response.ok) throw new Error(`Error al obtener noticias: ${response.statusText}`)

    const data = await response.json()

    return data
}

export const editarNoticia = async ({ putPayload, noticiaId }:
    {
        putPayload: {
            titulo?: string;
            lugar?: string | null;
            descripcion?: string;
            fijada?: boolean;
            duracion_fijada?: string | null; // <-- AÑADIDO
            imagen_path?: string | null
        },
        noticiaId: string
    }) => {

    const response = await fetch(`http://localhost:5000/api/noticias/${noticiaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }, // AHORA SÍ es JSON
        credentials: "include",
        body: JSON.stringify(putPayload),
    });

    if (!response.ok) throw new Error(`Error al fijar noticia: ${response.statusText}`)

    const data = await response.json()

    return data
}

export const eliminarNoticia = async (noticiaId: number) => {
    const response = await fetch(`http://localhost:5000/api/noticias/${noticiaId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) throw new Error(`Error al eliminar noticia: ${response.statusText}`)

    const data = await response.json()

    return data
}

