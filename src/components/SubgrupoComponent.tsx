import { useState, type FormEvent } from "react";
import type { Subgrupo } from "../../types/evento";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { useEditarSubgrupo, useEliminarSubgrupo } from "../queries/subgrupoQueries";

export default function SubgrupoItem({ subgrupo }: { subgrupo: Subgrupo }) {
    const [editMode, setEditMode] = useState(false)
    const rolUsuario = useAtomValue(userRolAtom)

    const { mutate: eliminarSubgrupo, isSuccess: eliminarSuccess } = useEliminarSubgrupo()
    const { mutate: editarSubgrupo, isSuccess: editarSuccess } = useEditarSubgrupo()

    const handleDelete = async () => {
        eliminarSubgrupo(subgrupo.id_subgrupo)
        if(eliminarSuccess) setEditMode(false);
    }

    const handleEditarSubgrupo = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const target = e.target as HTMLFormElement;
        const formData = new FormData(target);
        const nombre = formData.get('nombre')?.toString();
        const descripcion = formData.get('descripcion')?.toString();
        editarSubgrupo({id_subgrupo: subgrupo.id_subgrupo, nombre, descripcion})
        if(editarSuccess) setEditMode(false);
    }

    return (
        <>
            {editMode ?
                <div className="mt-6 p-4 bg-gray-400 rounded-md text-white text-center">
                    <form onSubmit={(e) => handleEditarSubgrupo(e)}>
                        <div className="flex flex-col gap-4 p-3 ">
                            <input type="text" name='nombre' placeholder={subgrupo.nombre} className='border-2 rounded-md p-1 w-full' />
                            <input type="text" name='descripcion' placeholder={subgrupo.descripcion} className='border-2 rounded-md p-1 w-full' />
                        </div>
                        <div className="flex justify-center gap-3">
                            <button type="submit" className='px-4 py-2 bg-[#C04A4A] text-white rounded-md shadow hover:bg-[#a83e3e]'>Guardar</button>
                            <button onClick={() => setEditMode(false)} className='px-4 py-2 bg-[#aeaeae] text-white rounded-md shadow hover:bg-[#a83e3e]'>Cancelar</button>
                        </div>
                    </form>
                </div>
                :
                <div className=" group p-4 rounded flex justify-between w-full transition-all duration-300 hover:bg-gray-100">
                    <div className="w-3/4 ">
                        <h3 className="font-bold text-lg text-gray-600">{subgrupo.nombre} </h3>
                        <p className="mt-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">{subgrupo.descripcion}</p>
                    </div>

                    {rolUsuario === 5 && <div className="flex items-center gap-2">
                        <p className="mt-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">Estado: {subgrupo.activo ? 'Activo' : 'Inactivo'}</p>
                        <button className="bg-gray-400 hover:bg-blue-400 text-white px-4 py-2 rounded ml-2 w-25"
                            onClick={() => setEditMode(true)}
                        >Editar</button>
                        <button className="bg-gray-400 hover:bg-red-400 text-white px-4 py-2 rounded w-25"
                            onClick={handleDelete}
                        >{subgrupo.activo ? 'Eliminar' : 'Activar'}</button>
                    </div>}
                </div>
            }
        </>
    )

}