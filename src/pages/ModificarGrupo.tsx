import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { LoadingSpinner } from '../components/LoadingComponents';
import SubgrupoItem from '../components/SubgrupoComponent';
import { useCrearSubgrupo, useSubgruposPorGrupo } from '../queries/subgrupoQueries';
import { useEditarGrupo, useGrupo } from '../queries/gruposQueries';
import type { Subgrupo } from '../../types/evento';
import { LoadingButton } from '../components/LoadingButton';
import { Toggle } from '../components/ui/toggle';


export default function ModificarGrupo() {
    const { id } = useParams<{ id: string }>();
    if (!id) return toast.error('No se especifico el id de grupo')
    const navigate = useNavigate();
    //queries
    const { data: subgrupos } = useSubgruposPorGrupo(parseInt(id))
    const { data: grupoData, isLoading: loadingGrupo, error: errorGrupo } = useGrupo(id)
    //mutaciones
    const { mutate: crearSubgrupo, isPending: loadingSubgrupo } = useCrearSubgrupo(parseInt(id))
    const { mutate: editarGrupo, isPending: loadingEdicion } = useEditarGrupo()

    const [crearSubgrupoMode, setCrearSubgrupoMode] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        zona: '',
        imagen_url: '',
        usuario_instagram: '',
        contacto_whatsapp: '',
        activo: null as unknown as boolean,
    });

    // Actualiza formData cuando se carga el evento
    useEffect(() => {
        if (grupoData) {
            setFormData({
                nombre: grupoData.nombre,
                descripcion: grupoData.descripcion || '',
                zona: grupoData.zona,
                imagen_url: grupoData.imagen_url,
                contacto_whatsapp: grupoData.contacto_whatsapp,
                usuario_instagram: grupoData.usuario_instagram,
                activo: grupoData.activo
            });
        }
    }, [grupoData]);

    // Manejo de cambios en inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'cupos' ? Number(value) : value }));
    };

    // Guardar cambios
    const handleSave = async () => {
        if (!id) return toast.error('No hay un id especificado para este grupo')
        editarGrupo({ grupoId: id, datosEditados: formData })
        if (!loadingEdicion) setEditMode(false)
    };

    const handleCrearSubgrupo = async (e: FormEvent<HTMLFormElement>) => {
        if (!id) return toast.error('No hay un id especificado para este grupo')
        e.preventDefault();
        const target = e.target as HTMLFormElement;
        const formData = new FormData(target);
        const nombre = formData.get('nombre')?.toString() || '';
        const descripcion = formData.get('descripcion')?.toString() || '';
        crearSubgrupo({ id_grupo: parseInt(id), nombre, descripcion })
        if (!loadingSubgrupo) setCrearSubgrupoMode(false)
    }

    if (loadingGrupo) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <LoadingSpinner size="lg" message="Cargando datos del grupo..." />
        </div>
    );

    if (errorGrupo) return <p className="p-6 text-red-600">{errorGrupo.message}</p>;
    if (!grupoData) return <p className="p-6">Evento no encontrado.</p>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            {/* Botón Volver */}
            <button
                onClick={() => {
                    navigate('/grupos')
                }}
                className="mb-4 px-4 py-2 bg-[#C04A4A] text-white hover:bg-[#a83e3e] rounded-md"
            >
                ← Volver
            </button>

            <h1 className="text-3xl font-extrabold text-black">Detalles del grupo</h1>

            {/* Info del grupo */}
            <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Nombre del grupo</label>
                    <p className="text-lg font-semibold">{grupoData.nombre}</p>
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
                        <p className="text-gray-700">{grupoData.descripcion}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-600 text-sm font-medium">Zona</label>
                        {editMode ? (
                            <input
                                type="text"
                                name="zona"
                                value={formData.zona ? formData.zona : ''}
                                onChange={handleChange}
                                className="border p-2 rounded w-full"
                            />
                        ) : (
                            <p className="text-gray-700">{grupoData.zona}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-600 text-sm font-medium">Cuenta de Instagram</label>
                        {editMode ? (
                            <input
                                type="text"
                                name="usuario_instagram"
                                value={formData.usuario_instagram ? formData.usuario_instagram : ''}
                                onChange={handleChange}
                                className="border p-2 rounded w-full"
                            />
                        ) : (
                            <p className="text-gray-700">{grupoData.usuario_instagram}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-600 text-sm font-medium">URL de la imagen</label>
                        {editMode ? (
                            <input
                                type="text"
                                name="imagen_url"
                                value={formData.imagen_url ? formData.imagen_url : ''}
                                onChange={handleChange}
                                className="border p-2 rounded w-full"
                            />
                        ) : (
                            <p className="text-gray-700 break-all overflow-hidden text-ellipsis">{grupoData.imagen_url}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-600 text-sm font-medium">Grupo de Whatsapp</label>
                        {editMode ? (
                            <input
                                type="text"
                                name="contacto_whatsapp"
                                value={formData.contacto_whatsapp ?? ''}
                                onChange={handleChange}
                                className="border p-2 rounded w-full"
                            />
                        ) : (
                            <p className="text-gray-700">{grupoData.contacto_whatsapp ?? 'Sin límite'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm font-medium">Estado</label>
                        {editMode ? (
                            <>
                                <Toggle
                                    pressed={formData.activo}
                                    onPressedChange={(value) =>
                                        setFormData((prev) => ({ ...prev, activo: value }))
                                    }
                                    className={formData.activo ? 'bg-green-200' : 'bg-red-200'}
                                >
                                    {formData.activo ? 'Activo' : 'Inactivo'}
                                </Toggle>
                            </>
                        ) : (
                            <p className="text-gray-700">{grupoData.activo ? 'Activo' : 'Inactivo'}</p>
                        )}
                    </div>
                </div>

                {/* Botones Editar / Guardar / Cancelar */}
                <div className="flex justify-end space-x-2">
                    {editMode ? (
                        <>
                            <LoadingButton
                                loading={loadingEdicion}
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Guardar
                            </LoadingButton >
                            <button
                                onClick={() => {
                                    setFormData({
                                        nombre: grupoData.nombre,
                                        descripcion: grupoData.descripcion || '',
                                        zona: grupoData.zona,
                                        usuario_instagram: grupoData.usuario_instagram
                                            ? grupoData.usuario_instagram
                                            : '',
                                        imagen_url: grupoData.imagen_url
                                            ? grupoData.imagen_url
                                            : '',
                                        contacto_whatsapp: grupoData.contacto_whatsapp
                                            ? grupoData.contacto_whatsapp
                                            : '',
                                        activo: grupoData.activo
                                    });
                                    setEditMode(false);
                                }}
                                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                            >
                                Cancelar
                            </button>

                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-6 py-2 bg-[#C04A4A] text-white rounded-md shadow hover:bg-[#a83e3e]"
                            >
                                Editar grupo
                            </button>

                            {!crearSubgrupoMode ? (
                                <button
                                    onClick={() => setCrearSubgrupoMode(true)}
                                    className="px-6 py-2 bg-[#c04a4a] text-white rounded-md shadow hover:bg-[#a83e3e]"
                                >
                                    Crear subgrupo
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCrearSubgrupoMode(false)}
                                    className="px-6 py-2 bg-[#c04a4a] text-white rounded-md shadow hover:bg-[#a83e3e]"
                                >
                                    Cancelar
                                </button>
                            )}
                        </>

                    )}
                </div>
            </div>
            {
                crearSubgrupoMode && (
                    <div className="mt-6 p-4 bg-gray-400 rounded-md text-white text-center">
                        <h2 className="text-xl font-semibold mb-4">Necesitariamos estos datos!</h2>
                        <form onSubmit={(e) => handleCrearSubgrupo(e)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                                <input type="text" name='nombre' placeholder="  Nombre del subgrupo" className='border-2 rounded-md p-1' />
                                <input type="text" name='descripcion' placeholder="  Descripción del subgrupo" className='border-2 rounded-md p-1' />
                            </div>
                            {
                                !loadingSubgrupo ?
                                    <button type="submit" className='px-4 py-2 bg-[#C04A4A] text-white rounded-md shadow hover:bg-[#a83e3e]'>Guardar</button>
                                    :
                                    <LoadingButton children={undefined} loading={true} className='px-4 py-2 bg-[#C04A4A] text-white rounded-md shadow hover:bg-[#a83e3e]'></LoadingButton>
                            }
                        </form>
                    </div>
                )
            }
            <div className='w-full'>
                <h2 className='text-3xl font-bold text-gray-800 mb-8'> Subgrupos de {grupoData.nombre}</h2>
                <div>
                    {subgrupos && subgrupos.length < 1 ? (
                        <p className='text-gray-600'>Aun no hay subgrupos creados para este grupo.</p>
                    ) : (
                        <div className='w-full'>
                            {subgrupos?.map((subgrupo: Subgrupo) => (
                                <SubgrupoItem key={subgrupo.id_subgrupo} subgrupo={subgrupo}></SubgrupoItem>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
