import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { obtenerEventos, eliminarEvento } from '../Services/eventoService';
import type { grupo } from '../../types/evento';


// import {
//     UsersIcon,
//     ArrowRightIcon,
//     CalendarIcon,
//     NewspaperIcon,
// } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import { LoadingSpinner, ErrorState } from './LoadingComponents';
import { toast } from 'sonner';
import { useActivarGrupo, useGrupos, useInactivarGrupo } from '../queries/gruposQueries';


// Iconos SVG simples inline para no depender de librerías externas
const EditIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const RestoreIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);
const UserIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);


// Definición de tipo Evento según backend, debe de ser colocado en un archivo de tipos cuando exista y finalice la implementación



// Lista de eventos simulada
// const events: Event[] = [
//   {
//     id: 'campamento-im',
//     title: 'Campamento IM',
//     description: 'Carpa? Check. Marshmallows? Check. Un amigo? Casi que casi. Inscríbete al campamento y dile a tus amigos.',
//     image: 'src/assets/evento1.jpg',
//     group: 'Instituto Misionero',
//     date: '2025-09-12',
//   },
//   {
//     id: 'exposalud-st',
//     title: 'ExpoSalud Santo Tome',
//     description: 'Los 8 remedios naturales haciendo presencia mi llave en la provincia vecina.',
//     image: 'src/assets/evento2.png',
//     group: 'ExpoSalud',
//     date: '2025-09-05',
//   },
//   {
//     id: 'all-day-jabes',
//     title: 'ALL-DAY con JABES!',
//     description: 'Acompáñanos a Ramirez este sábado y sé parte de nuestro equipaso.',
//     image: 'src/assets/evento3.png',
//     group: 'JABES',
//     date: '2025-09-14',
//   },
// ];

// const navItems = [
//     { to: '/grupos', label: 'Grupos', icon: UsersIcon },
//     { to: '/salidas', label: 'Salidas', icon: ArrowRightIcon },
//     { to: '/eventos', label: 'Eventos', icon: CalendarIcon },
//     { to: '/noticias', label: 'Noticias', icon: NewspaperIcon },
// ];

export default function GruposListAdmin() {
    const navigate = useNavigate();
    const { data: grupos, isLoading: loading, error } = useGrupos()
    const { mutate: inactivarGrupo } = useInactivarGrupo()
    const { mutate: activarGrupo } = useActivarGrupo()

    // Filtros de búsqueda
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) {
        return (
            <div className="min-h-screen flex bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col md:ml-56">
                    <main className="pt-10 px-8 flex-1 flex justify-center items-center">
                        <LoadingSpinner size="lg" message="Cargando grupos..." />
                    </main>
                </div>
            </div>
        );
    }


    // Filtros de grupos
    const gruposFiltrados = grupos ? grupos.filter((grupo: grupo) => {
        const matchesSearch = grupo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            grupo.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    }) : [];

    function handleEdit(id: number): void {
        navigate(`/editar-grupo/${id}`)
        // Implementar navegación a edición
    }

    function handleDelete(id_grupo: number): void {
        toast.warning('El grupo pasara a tener un estado inactivo. ¿Quieres continuar?', {
            action: {
                label: 'Eliminar', onClick: () => {
                    inactivarGrupo(id_grupo)
                }
            },
            actionButtonStyle: { backgroundColor: 'red' }, cancel: { label: 'Cancelar', onClick: () => toast.success('Eliminacion cancelada') }
        },)
    }

    function handleActivar(id_grupo: number): void {
        toast.warning('El grupo pasara a tener un estado activo. ¿Quieres continuar?', {
            action: {
                label: 'Activar', onClick: () => {
                    activarGrupo(id_grupo)
                }
            },
            actionButtonStyle: { backgroundColor: 'red' }, cancel: { label: 'Cancelar', onClick: () => toast.success('Activacion cancelada') }
        },)
    }

    return (

        <div className="min-h-screen bg-gray-100">

            <Sidebar />
            {/* Main content */}
            <div className="md:ml-56 flex flex-col min-h-screen">

                {/* Error state - pantalla completa */}
                {error && (
                    <div className="flex justify-center items-center py-12">
                        <ErrorState
                            message={error.message}
                            onRetry={() => window.location.reload()}
                        />
                    </div>
                )}

                {/* Content state - solo se muestra cuando no hay loading ni error */}
                {!loading && !error && (
                    <>
                        {/* Topbar
                        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow sticky top-0 z-10">
                            <ul className="hidden md:flex gap-6 text-gray-700 font-medium">
                                <li className="hover:text-red-700 cursor-pointer">Sobre Nosotros</li>
                                <li className="hover:text-red-700 cursor-pointer">Grupos Misioneros</li>
                            </ul>
                            {userName ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-700 font-medium">Hola! {userName}</span>
                                    <button
                                        className="px-4 py-2 bg-red-700 text-white rounded-md shadow hover:scale-105 transition duration-200"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="px-4 py-2 bg-red-700 text-white rounded-md shadow hover:bg-red-800 transition duration-200"
                                    onClick={() => navigate('/login')}
                                >
                                    Login
                                </button>
                            )}
                        </nav> */}

                        {/* Grupos */}
                        <main className="p-8 flex-1">
                            <h1 className="text-2xl font-bold text-gray-800 mb-6">Grupos</h1>

                            {/* Filtros BUSCADOR */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o descripción..."
                                    className="px-4 py-2 border rounded w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Información de resultados */}
                            <div className="mb-6 flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Mostrando <span className="font-semibold">{gruposFiltrados.length}</span> grupos
                                    {searchTerm && <span> (filtrados de {grupos?.length})</span>}
                                </p>
                            </div>

                            {/* Lista de grupos */}
                            {gruposFiltrados.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No se encontraron grupos.</p>
                                </div>
                            ) : (
                                <ul >
                                    {gruposFiltrados.map((grupo: grupo) => (
                                        <motion.li
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="w-full group"
                                        >
                                            <div className="relative flex items-center bg-white border border-gray-100 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-gray-200">

                                                {/* Enlace principal que cubre el área de contenido */}
                                                <Link
                                                    to={`/grupos/${grupo.id_grupo}`}
                                                    className="flex items-center flex-1 min-w-0 gap-4 cursor-pointer"
                                                >
                                                    {/* Imagen Pequeña y Redondeada */}
                                                    <div className="flex-shrink-0 h-16 w-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                                        {grupo.imagen_url ? (
                                                            <img
                                                                src={grupo.imagen_url}
                                                                alt={grupo.nombre}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                                <UserIcon />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Información */}
                                                    <div className="flex flex-col min-w-0">
                                                        <h3 className="text-base font-semibold text-gray-800 truncate group-hover:text-red-700 transition-colors">
                                                            {grupo.nombre}
                                                        </h3>

                                                        {/* Descripción truncada */}
                                                        <p className="text-sm text-gray-500 truncate mt-0.5">
                                                            {grupo.descripcion || "Sin descripción"}
                                                        </p>

                                                        {/* Estado integrado como texto */}
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className={`flex h-2 w-2 rounded-full ${grupo.activo ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                                                {grupo.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                            <span className="text-gray-300 text-xs">•</span>
                                                            <span className="text-xs text-gray-400">ID: {grupo.id_grupo}</span>
                                                        </div>
                                                    </div>
                                                </Link>

                                                {/* Botones de Acción Minimalistas (Derecha) */}
                                                <div className="flex items-center gap-1 pl-4 border-l border-gray-100 ml-2">

                                                    {/* Editar */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(grupo.id_grupo); }}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Modificar"
                                                    >
                                                        <EditIcon />
                                                    </button>

                                                    {/* Eliminar / Activar */}
                                                    {grupo.activo ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(grupo.id_grupo); }}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleActivar(grupo.id_grupo); }}
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                            title="Reactivar"
                                                        >
                                                            <RestoreIcon />
                                                        </button>
                                                    )}
                                                </div>

                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}