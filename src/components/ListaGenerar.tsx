import { useEffect, useState } from "react";
import { useGrupos } from "../queries/gruposQueries";
import { useEventosPorGrupo } from "../queries/eventosQueries";
import { useVerificarListaDisponible } from "../queries/listaQueries";

export default function ListaGenerar() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<number | null>(null);
  const [listaDisponible, setListaDisponible] = useState(false);
  const {data: grupos} = useGrupos()
  const {data: eventos} = useEventosPorGrupo(grupoSeleccionado as unknown as number)

  useEffect(() => {
      if (grupoSeleccionado && eventoSeleccionado) {
          const {data: disponible, isSuccess } = useVerificarListaDisponible(grupoSeleccionado, eventoSeleccionado)
          if(isSuccess) setListaDisponible(disponible);
      } 
  }, [grupoSeleccionado, eventoSeleccionado]);

  return (
    <div className="p-10 w-full">
      <h1 className="text-4xl font-bold mb-8">Lista - Evento</h1>

      <div className="mb-8">
        <label className="block font-bold text-xl mb-2">Eventos</label>
        <select
          className="border px-4 py-2 rounded w-64"
          onChange={e => setEventoSeleccionado(Number(e.target.value))}
          value={eventoSeleccionado ?? ""}
        >
          <option value="">Seleccione un evento</option>
          {eventos && eventos?.map(ev => (
            <option key={ev.id_evento} value={ev.id_evento}>
              {ev.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <label className="block font-bold text-xl mb-2">Grupo</label>
        <select
          className="border px-4 py-2 rounded w-64"
          onChange={e => setGrupoSeleccionado(Number(e.target.value))}
          value={grupoSeleccionado ?? ""}
        >
          <option value="">Seleccione un grupo</option>
          {grupos && grupos.map(gr => (
            <option key={gr.id_grupo} value={gr.id_grupo}>
              {gr.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        disabled={!listaDisponible}
        className={`px-6 py-3 rounded text-white font-semibold transition ${
          listaDisponible ? "bg-red-500 hover:bg-red-600" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Generar lista
      </button>
    </div>
  );
}
