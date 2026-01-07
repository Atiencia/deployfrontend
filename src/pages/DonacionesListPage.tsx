//pagina para hacer el listado de donaciones

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import flechaAtras from "../assets/flechaizquierda.png";
import lupa from "../assets/search.png";
import Sidebar from "../components/Sidebar";
import 'react-toastify/dist/ReactToastify.css';
import { useDonaciones } from "../queries/donacionesQueries";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { LoadingSpinner, ErrorState } from "../components/LoadingComponents";

interface Donacion {
    id_donacion: number;
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    monto: number;
    descripcion: string;
    fecha_donacion: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    comprobante_url?: string;
}

interface DonacionItemProps {
    donacion: Donacion;
}

// Componente para cada fila de la tabla
function DonacionItem({ donacion }: DonacionItemProps) {
    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'aprobado': return 'text-green-600';
            case 'pendiente': return 'text-yellow-600';
            case 'rechazado': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <>
            {/* Vista móvil - Tarjeta */}
            <div className="md:hidden bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-gray-500">ID: {donacion.id_donacion}</p>
                        <p className="font-semibold text-base">{donacion.nombre} {donacion.apellido}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        donacion.estado === 'aprobado' ? 'bg-green-100 text-green-700' :
                        donacion.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                        {donacion.estado}
                    </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                    <div>
                        <p className="text-xs text-gray-500">Monto</p>
                        <p className="font-bold text-lg text-green-600">${donacion.monto}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="text-sm">{new Date(donacion.fecha_donacion).toLocaleDateString('es-AR')}</p>
                    </div>
                </div>
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden md:grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors rounded-lg text-sm border-b border-gray-100">
                <p className="font-medium">{donacion.id_donacion}</p>
                <p className="truncate">{donacion.nombre} {donacion.apellido}</p>
                <p className="font-semibold text-green-600">${donacion.monto}</p>
                <p>{new Date(donacion.fecha_donacion).toLocaleDateString('es-AR')}</p>
                <p className={`capitalize font-medium ${getEstadoColor(donacion.estado)}`}>
                    {donacion.estado}
                </p>
            </div>
        </>
    );
}

export default function DonacionesListPage() {
    const [busqueda, setBusqueda] = useState('');
    const location = useLocation();
    const isMisDonaciones = location.pathname === '/donaciones/mis-donaciones';
    const [filtroGrupo, setFiltroGrupo] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");
    const rolUsuario = useAtomValue(userRolAtom)

    const { data: donaciones = [], isLoading: loading, error, refetch } = useDonaciones(rolUsuario)

    // Filtra las donaciones basándose en la búsqueda
    const donacionesFiltradas = donaciones.filter((d: Donacion) =>
        `${d.nombre} ${d.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    /*
    const [rolUsuario, setRolUsuario] = useState<number>(null as unknown as number);
    const [donaciones, setDonaciones] = useState<Donacion[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [filtroGrupo, setFiltroGrupo] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");
    const isMisDonaciones = location.pathname === '/donaciones/mis-donaciones';

    useEffect(() => {
        async function cargarDatos() {
            try {
                const response = await obtenerRol();
                setRolUsuario(response.rol);
                await cargarDonaciones();
            } catch (error) {
                toast.error('Error al cargar los datos');
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        cargarDatos();
    }, []);

    const cargarDonaciones = async () => {
        try {
            let endpoint = '/api/donaciones/mis-donaciones'; // Default para usuarios

            if (isMisDonaciones) {
                endpoint = '/api/donaciones/mis-donaciones';
            } else if (rolUsuario === 1 || rolUsuario === 2) {
                endpoint = '/api/donaciones/todas'; // Admin y superadmin ven todas
            } else if (rolUsuario === 4) {
                endpoint = '/api/donaciones/filtradas'; // Secretaria filtra
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setDonaciones(data);
            } else {
                throw new Error('Error al obtener las donaciones');
            }
        } catch (error) {
            toast.error('Error al cargar las donaciones');
            console.error(error);
        }
    };*/

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 md:ml-56 flex justify-center items-center pt-20 md:pt-0">
                    <LoadingSpinner message="Cargando donaciones..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 md:ml-56 flex justify-center items-center p-4 md:p-8 pt-20 md:pt-8">
                    <ErrorState
                        message={error.message || 'Error al cargar las donaciones'}
                        onRetry={() => refetch()}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1 md:ml-56 p-4 md:p-8 pt-20 md:pt-8 w-full">
                <div className="flex-1">
                    {/* Encabezado */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-black">
                            {isMisDonaciones ? 'Mis Donaciones' : 'Gestión de Donaciones'}
                        </h1>
                        {!isMisDonaciones && (rolUsuario === 1 || rolUsuario === 2) && (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="bg-green-100 p-4 rounded-lg">
                                    <p className="text-green-800 font-semibold text-sm md:text-base">Total Aprobado</p>
                                    <p className="text-xl md:text-2xl font-bold">
                                        ${(donaciones.filter((d: Donacion) => d.estado === 'aprobado').reduce((sum: number, d: Donacion) => sum + (Number(d.monto) || 0), 0)).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-purple-100 p-4 rounded-lg">
                                    <p className="text-purple-800 font-semibold text-sm md:text-base">Total Donantes</p>
                                    <p className="text-xl md:text-2xl font-bold">
                                        {new Set(donaciones.filter((d: Donacion) => d.estado === 'aprobado').map((d: Donacion) => d.id_usuario)).size}
                                    </p>
                                </div>
                            </div>
                        )}
                        {!isMisDonaciones && rolUsuario === 4 && (
                            <div className="flex gap-4">
                                <div className="bg-green-100 p-4 rounded-lg">
                                    <p className="text-green-800 font-semibold">Total Aprobado</p>
                                    <p className="text-2xl font-bold">
                                        ${(donaciones.filter((d: Donacion) => d.estado === 'aprobado').reduce((sum: number, d: Donacion) => sum + (Number(d.monto) || 0), 0)).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-yellow-100 p-4 rounded-lg">
                                    <p className="text-yellow-800 font-semibold">Pendientes</p>
                                    <p className="text-2xl font-bold">
                                        {donaciones.filter((d: Donacion) => d.estado === 'pendiente').length}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabla de donaciones */}
                    <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
                        {/* Barra de búsqueda */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full mb-4">
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <img src={lupa} alt="Buscar" className="h-4 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
                                    className="w-full md:w-80 bg-gray-100 rounded-md p-2 text-sm"
                                    placeholder="Buscar por donador..."
                                />
                            </div>
                            <input 
                                type="date" 
                                value={filtroFecha} 
                                onChange={(e) => setFiltroFecha(e.target.value)} 
                                className="p-2 border rounded text-sm w-full md:w-auto" 
                            />
                            <input 
                                type="text" 
                                placeholder="Filtrar por grupo" 
                                value={filtroGrupo} 
                                onChange={(e) => setFiltroGrupo(e.target.value)} 
                                className="p-2 border rounded text-sm w-full md:w-auto" 
                            />
                        </div>

                        {/* Encabezados de la tabla - Solo visible en desktop */}
                        <div className="hidden md:grid grid-cols-5 gap-4 font-bold p-4 bg-gray-50 rounded-lg mb-4 text-sm">
                            <p>ID</p>
                            <p>Donador</p>
                            <p>Monto</p>
                            <p>Fecha</p>
                            <p>Estado</p>
                        </div>

                        {/* Lista de donaciones */}
                        <div className="space-y-3 md:space-y-0">
                            {donacionesFiltradas.length > 0 ? (
                                donacionesFiltradas.map((d: Donacion) => <DonacionItem key={d.id_donacion} donacion={d} />)
                            ) : (
                                <p className="text-center text-gray-500 py-8">No se encontraron donaciones.</p>
                            )}
                        </div>

                        {/* Estadísticas generales para secretaria */}
                        {!isMisDonaciones && rolUsuario === 4 && (
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-lg font-semibold mb-4">Estadísticas Generales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-blue-600">{donaciones.length}</p>
                                        <p className="text-sm text-blue-800">Total Donaciones</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {donaciones.filter((d: Donacion) => d.estado === 'aprobado').length}
                                        </p>
                                        <p className="text-sm text-green-800">Aprobadas</p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {donaciones.filter((d: Donacion) => d.estado === 'pendiente').length}
                                        </p>
                                        <p className="text-sm text-yellow-800">Pendientes</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-red-600">
                                            {donaciones.filter((d: Donacion) => d.estado === 'rechazado').length}
                                        </p>
                                        <p className="text-sm text-red-800">Rechazadas</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}