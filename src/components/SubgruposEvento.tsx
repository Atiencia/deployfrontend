import { useEffect, useState } from "react";
import type { Subevento, Subgrupo } from "../../types/evento";
import { useSetAtom } from "jotai";
import { subgruposAtom } from "../store/jotaiStore";

export default function SubgruposEvento({ subgrupos }: { subgrupos: Subgrupo[] }) {
    const setSubgrupos = useSetAtom(subgruposAtom);

    // Inicializamos el átomo una sola vez cuando llegan los subgrupos
    useEffect(() => {
        if (subgrupos && subgrupos.length > 0) {
            const datosIniciales: Subevento[] = subgrupos.map((s) => ({
                id_subgrupo: s.id_subgrupo,
                cupos: 0, 
                cupos_suplente: 0
            }));
            setSubgrupos(datosIniciales);
        }
    }, [subgrupos, setSubgrupos]);

    return (
        <div className="bg-gray-100 px-5 p-4 rounded-md">
            <h2 className="text-xl font-bold mb-4">Subgrupos a participar</h2>
            <div className="space-y-6">
                {subgrupos?.map((s) => (
                    <SubgrupoForm key={s.id_subgrupo} subgrupo={s} />
                ))}
            </div>
        </div>
    );
}


function SubgrupoForm({ subgrupo }: { subgrupo: any }) {
    // Estado local para manejo fluido del input (opcional, pero recomendado para inputs numéricos que se borran)
    const [localValues, setLocalValues] = useState({
        cupos: "",
        cupos_suplente: ""
    });

    const setSubgrupos = useSetAtom(subgruposAtom);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // 1. Actualizar estado local (para la UI inmediata)
        setLocalValues(prev => ({ ...prev, [name]: value }));

        // 2. Actualizar estado Global (Jotai)
        // Usamos la versión callback de setSubgrupos para tener el valor "prev" seguro
        setSubgrupos((prevSubgrupos) => {
            // Creamos un nuevo array (inmutabilidad) recorriendo el anterior
            return prevSubgrupos?.map((item) => {
                // Si encontramos el subgrupo que estamos editando...
                if (item.id_subgrupo === subgrupo.id_subgrupo) {
                    // Retornamos una copia del item con el valor actualizado
                    return {
                        ...item,
                        [name]: value === "" ? 0 : parseInt(value) // Convertir a número para guardar
                    };
                }
                // Si no es el que buscamos, lo devolvemos tal cual
                return item;
            });
        });
    };

    return (
        <div className="bg-white p-4 rounded shadow-sm">
            <div className="mb-3">
                <h3 className="font-semibold text-lg">{subgrupo.nombre}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cupos */}
                <div>
                    <label htmlFor={`cupos-${subgrupo.id_subgrupo}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Cupos Disponibles
                    </label>
                    <input
                        id={`cupos-${subgrupo.id_subgrupo}`}
                        name="cupos"
                        type="number"
                        min="0"
                        value={localValues.cupos}
                        onChange={handleInputChange}
                        required
                        placeholder="Ej: 50"
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                </div>

                {/* Cupos Suplentes */}
                <div>
                    <label htmlFor={`cupos_suplente-${subgrupo.id_subgrupo}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Cupos de Suplentes
                    </label>
                    <input
                        id={`cupos_suplente-${subgrupo.id_subgrupo}`}
                        name="cupos_suplente"
                        type="number"
                        min="0"
                        value={localValues.cupos_suplente}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Lista de espera al agotar titulares
                    </p>
                </div>
            </div>
        </div>
    );
}