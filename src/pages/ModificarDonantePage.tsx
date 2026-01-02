import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { donantesFijosService } from '../Services/donantesFijosService';
import Sidebar from '../components/Sidebar';
import flechaAtras from "../assets/flechaizquierda.png";
import { LoadingSpinner } from '../components/LoadingComponents';
import { useActualizarDonante } from '../queries/donacionesQueries';
import { useGrupos } from '../queries/gruposQueries';
import { useAtomValue } from 'jotai';
import { userRolAtom } from '../store/jotaiStore';
import { useQuery } from '@tanstack/react-query';

interface FormData {
    nombre: string;
    apellido: string;
    dni: number;
    email: string;
    id_grupo: number | null;
}

export default function ModificarDonantePage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const rolUsuario = useAtomValue(userRolAtom);
    
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        apellido: '',
        dni: 0,
        email: '',
        id_grupo: null
    });

    // Cargar grupos usando React Query
    const { data: grupos = [], isLoading: loadingGrupos } = useGrupos();

    // Cargar donante usando React Query
    const { data: donante, isLoading: loadingDonante } = useQuery({
        queryKey: ['donante', id],
        queryFn: () => donantesFijosService.obtenerDonante(Number(id)),
        enabled: !!id,
    });

    // Mutación para actualizar
    const { mutate: actualizarDonante, isPending } = useActualizarDonante();

    // Inicializar formulario cuando se carga el donante
    useEffect(() => {
        if (donante) {
            setFormData({
                nombre: donante.nombre,
                apellido: donante.apellido,
                dni: donante.dni,
                email: donante.email,
                id_grupo: donante.id_grupo
            });
        }
    }, [donante]);

    // Auto-seleccionar grupo para secretaría grupal
    useEffect(() => {
        if (rolUsuario === 5 && grupos && grupos.length > 0 && !formData.id_grupo) {
            setFormData(prev => ({ ...prev, id_grupo: grupos[0].id_grupo }));
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
        if (!id) return;

        actualizarDonante({ id: Number(id), datos: formData }, {
            onSuccess: () => {
                navigate('/donadores');
            }
        });
    };

    if (loadingGrupos || loadingDonante || isPending) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 flex justify-center items-center">
                    <LoadingSpinner message="Cargando..." />
                </div>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-bold">Modificar Donante</h1>
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
                                        Asignar a Grupo
                                    </label>
                                    <select
                                        name="id_grupo"
                                        value={formData.id_grupo || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="">General (IM)</option>
                                        {grupos.map(grupo => (
                                            <option key={grupo.id_grupo} value={grupo.id_grupo}>
                                                {grupo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {rolUsuario === 5 && grupos.length > 0 && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Grupo Asignado
                                    </label>
                                    <input
                                        type="text"
                                        value={grupos[0].nombre}
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
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {isPending ? 'Actualizando...' : 'Actualizar Donante'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
