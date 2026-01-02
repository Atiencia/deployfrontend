import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import flechaAtras from "../assets/flechaizquierda.png";
import { useCrearDonante } from '../queries/donacionesQueries';
import { useAtomValue } from 'jotai';
import { userRolAtom } from '../store/jotaiStore';
import { useMisGruposSecretaria } from '../queries/secretariaGrupoQueries';

interface FormData {
    nombre: string;
    apellido: string;
    dni: number;
    email: string;
    id_grupo: number | null;
}

export default function CrearDonantePage() {
    const navigate = useNavigate();
    const rolUsuario = useAtomValue(userRolAtom);
    const { data: grupos } = useMisGruposSecretaria(rolUsuario);
    const { mutate: crearDonante, isPending } = useCrearDonante();
    
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        apellido: '',
        dni: 0,
        email: '',
        id_grupo: null
    });

    // Auto-seleccionar el grupo para secretaría grupal
    useEffect(() => {
        if (rolUsuario === 5 && grupos && grupos.grupos.length > 0 && !formData.id_grupo) {
            setFormData(prev => ({ ...prev, id_grupo: grupos.grupos[0].id_grupo }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rolUsuario, grupos]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'id_grupo' ? (value === '' ? null : Number(value)) :
                   name === 'dni' ? (value === '' ? 0 : Number(value)) :
                   value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        crearDonante(formData, {
            onSuccess: () => {
                navigate('/donadores');
            }
        });
    };
console.log("grupos disponibles", grupos);
    return (
        <div className="flex justify-end min-h-screen bg-gray-100">
            <Sidebar />

            <div className="w-full md:w-5/6 p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Encabezado y botón volver */}
                    <div className="flex items-center mb-6">
                        <Link to="/donadores" className="mr-4">
                            <img className="h-6" src={flechaAtras} alt="Volver" />
                        </Link>
                        <h1 className="text-3xl font-bold">Registrar Nuevo Donante</h1>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    required
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    placeholder="Ingrese el nombre"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    required
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    placeholder="Ingrese el apellido"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    DNI
                                </label>
                                <input
                                    type="text"
                                    name="dni"
                                    required
                                    value={formData.dni || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    placeholder="Ingrese el DNI"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    placeholder="Ingrese el correo"
                                />
                            </div>

                            {rolUsuario === 4 && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Asignar a Grupo *
                                    </label>
                                    <select
                                        name="id_grupo"
                                        value={formData.id_grupo || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="" disabled>Seleccione un grupo</option>
                                        {grupos?.grupos?.map(grupo => (
                                            <option key={grupo.id_grupo} value={grupo.id_grupo}>
                                                {grupo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {rolUsuario === 5 && grupos && grupos.grupos.length > 0 && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Grupo Asignado
                                    </label>
                                    <input
                                        type="text"
                                        value={grupos.grupos[0].nombre}
                                        disabled
                                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end space-x-4 mt-6">
                            <Link
                                to="/donadores"
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                            >
                                {isPending ? 'Registrando...' : 'Registrar Donante'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
