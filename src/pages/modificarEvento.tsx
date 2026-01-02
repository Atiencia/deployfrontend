import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LoadingSpinner, LoadingCard } from '../components/LoadingComponents';
import { useEditarEvento, useEliminarInscripto, useEventosPorId, useInscriptos } from '../queries/eventosQueries';
import { useEliminarSuplente, useSuplentes } from '../queries/suplenteQueries';



export default function ModificarEvento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return toast.error('Es necesario un id');

  const { data: eventoData, isPending: loadingEvento, error: errorEvento } = useEventosPorId(parseInt(id))
  const { data: inscriptos, isPending: loadingInscriptos, error: errorInscriptos } = useInscriptos(parseInt(id))
  const { data: suplentes, isPending: loadingSuplentes, error: errorSuplentes } = useSuplentes(parseInt(id))

  const { mutate: editarEvento, isPending: loadingEdicion, isError: errorEdicion} = useEditarEvento()
  const { mutate: eliminarInscripto} = useEliminarInscripto()
  const {mutate: eliminarSuplente} = useEliminarSuplente(parseInt(id))


  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fecha: '' as unknown as Date,
    descripcion: '',
    cupos: null as number | null,
    cupos_suplente: null as number | null,
    fecha_limite_inscripcion: '',
    fecha_limite_baja: '',
  });

  // Actualiza formData cuando se carga el evento
  useEffect( () => {
  if(eventoData) {
      setFormData({
        fecha: eventoData.fecha,
        descripcion: eventoData.descripcion || '',
        cupos: eventoData.cupos || null,
        cupos_suplente: eventoData.cupos_suplente ?? null,
        fecha_limite_inscripcion: eventoData.fecha_limite_inscripcion
          ? new Date(eventoData.fecha_limite_inscripcion).toISOString().split('T')[0]
          : '',
        fecha_limite_baja: eventoData.fecha_limite_baja
          ? new Date(eventoData.fecha_limite_baja).toISOString().split('T')[0]
          : '',
      });
    }
  }, [eventoData])

  // Manejo de cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cupos' || name === 'cupos_suplente' ? (value === '' ? null : Number(value)) : value
    }));
  };

  // Eliminar inscripto
  const handleEliminarInscripto = async (usuarioId: number) => {
    toast("¿Eliminar este inscripto?", {
      description: "Esta acción no se puede deshacer",
      action: {
        label: "Eliminar",
        onClick: () => {
          eliminarInscripto({ usuarioId, eventoId: parseInt(id) })
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => { },
      },
    });
  };

  
  const handleSubmitEdit = async() =>{
    editarEvento({ eventoId: id, datosEditados: formData });
    if(!loadingEdicion && !errorEdicion) setTimeout(() => {setEditMode(false)}, 500);
  }
  // Mostrar toast de confirmación para eliminar suplente (más bonito que confirm())
  const confirmEliminarSuplente = (suplente: any) => {  
    toast("¿Eliminar este suplente?", {
      description: "Esta acción no se puede deshacer",
      action: {
        label: "Eliminar",
        onClick: () => {
          eliminarSuplente({eventoId: parseInt(id), usuarioId: suplente.id_usuario  })
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => { },
      },
    });
  };

  if (loadingEvento) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoadingSpinner size="lg" message="Cargando datos del evento..." />
    </div>
  );
  if (errorEvento) return <p className="p-6 text-red-600">{errorEvento.message}</p>;
  if (!eventoData) return <p className="p-6">Evento no encontrado.</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Botón Volver */}
      <button
        onClick={() => {
          // Redirigir según el estado del evento
          if (eventoData.estado === 'transcurrido') {
            navigate('/eventos/transcurridos');
          } else if (eventoData.estado === 'cancelado') {
            navigate('/eventos/cancelados');
          } else {
            navigate('/eventos');
          }
        }}
        className="mb-4 px-4 py-2 bg-[#C04A4A] text-white hover:bg-[#a83e3e] rounded-md"
      >
        ← Volver
      </button>

      <h1 className="text-3xl font-extrabold text-black">Detalles del Evento</h1>

      {/* Info del evento */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <div>
          <label className="block text-gray-600 text-sm font-medium">Nombre del evento</label>
          <p className="text-lg font-semibold">{eventoData.nombre}</p>
        </div>

        <div>
          <label className="block text-gray-600 text-sm font-medium">Descripción</label>
          {editMode ? (
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          ) : (
            <p className="text-gray-700">{eventoData.descripcion}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium">Fecha</label>
            {editMode ? (
              <input
                type="date"
                name="fecha"
                value={formData.fecha ? new Date(formData.fecha).toISOString().split('T')[0] : ''}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            ) : (
              <p className="text-gray-700">{new Date(eventoData.fecha).toLocaleDateString('es-AR')}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium">Fecha límite inscripción</label>
            {editMode ? (
              <input
                type="date"
                name="fecha_limite_inscripcion"
                value={formData.fecha_limite_inscripcion}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            ) : (
              <p className="text-gray-700">
                {eventoData.fecha_limite_inscripcion
                  ? new Date(eventoData.fecha_limite_inscripcion).toLocaleDateString('es-AR')
                  : '-'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium">Fecha límite baja</label>
            {editMode ? (
              <input
                type="date"
                name="fecha_limite_baja"
                value={formData.fecha_limite_baja}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            ) : (
              <p className="text-gray-700">
                {eventoData.fecha_limite_baja
                  ? new Date(eventoData.fecha_limite_baja).toLocaleDateString('es-AR')
                  : '-'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium">Cupos</label>
            {editMode ? (
              <input
                type="number"
                name="cupos"
                value={formData.cupos ?? ''}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            ) : (
              <p className="text-gray-700">{eventoData.cupos ?? 'Sin límite'}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium">Cupos suplente</label>
            {editMode ? (
              <input
                type="number"
                name="cupos_suplente"
                value={formData.cupos_suplente ?? ''}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                min={0}
              />
            ) : (
              <p className="text-gray-700">{eventoData.cupos_suplente ?? 0}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium">Estado</label>
            <p className="text-gray-700">{eventoData.estado}</p>
          </div>
        </div>

        {/* Botones Editar / Guardar / Cancelar */}
        <div className="flex justify-end space-x-2">
          {editMode ? (
            <>
              <button
                onClick={handleSubmitEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setFormData({
                    fecha: eventoData.fecha,
                    descripcion: eventoData.descripcion || '',
                    cupos: eventoData.cupos || null,
                    cupos_suplente: eventoData.cupos_suplente ?? null,
                    fecha_limite_inscripcion: eventoData.fecha_limite_inscripcion
                      ? new Date(eventoData.fecha_limite_inscripcion).toISOString().split('T')[0]
                      : '',
                    fecha_limite_baja: eventoData.fecha_limite_baja
                      ? new Date(eventoData.fecha_limite_baja).toISOString().split('T')[0]
                      : '',
                  });
                  setEditMode(false);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                Cancelar
              </button>

            </>
          ) : (
            eventoData.estado == 'vigente' ? <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 bg-[#C04A4A] text-white rounded-md shadow hover:bg-[#a83e3e]"
            >
              Editar Evento
            </button>
              :
              <section></section>
          )}
        </div>
      </div>

      {/* Lista de inscriptos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-black">Lista de Inscriptos</h2>

        {loadingInscriptos ? (
          <LoadingCard title="Cargando inscriptos..." />
        ) : errorInscriptos ? (
          <p className="text-red-600">{errorInscriptos.message}</p>
        ) : inscriptos.length === 0 ? (
          <p className="text-gray-600 italic">No hay inscriptos aún.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apellido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número Alumno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inscripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inscriptos.map((u) => (
                  <tr key={u.id_usuario}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.id_usuario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.apellido}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.dni_usuario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.numeroAlumno ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(u.fecha_inscripcion).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      {eventoData.estado == 'vigente' ?
                        <button
                          onClick={() => handleEliminarInscripto(u.id_usuario)}
                          className="text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                        :
                        <section></section>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lista de suplentes (solo para admin/secretarias) */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-black">Lista de Suplentes</h2>

        {loadingSuplentes ? (
          <LoadingCard title="Cargando suplentes..." />
        ) : errorSuplentes ? (
          <p className="text-red-600">{errorSuplentes.message}</p>
        ) : suplentes.length === 0 ? (
          <p className="text-gray-600 italic">No hay suplentes aún.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posición</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apellido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número Alumno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inscripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suplentes.map((s: any) => (
                  <tr key={s.id_usuario}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.orden_suplente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.id_usuario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.apellido}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.dni_usuario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.numeroAlumno ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(s.fecha_inscripcion).toLocaleDateString('es-AR')}</td>
                    <td className="px-6 py-4">
                      {eventoData.estado == 'vigente' ? (
                        <button
                          onClick={() => confirmEliminarSuplente(s)}
                          className="text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      ) : (
                        <section></section>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}