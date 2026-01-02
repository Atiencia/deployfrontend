// Página que lista los donadores según vista de administrador/secretaria
import flechaAtras from "../assets/flechaizquierda.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import lupa from "../assets/search.png";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { useDonadores, useDonadoresGrupo, useEliminarDonantes } from "../queries/donacionesQueries";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import { LoadingSpinner } from "../components/LoadingComponents";

interface Donador {
	id_donante_fijo: number;
	nombre: string;
	apellido: string;
	dni: number;
	email: string;
	nombre_grupo?: string;
}

export default function DonadoresListPage() {
	const [busqueda, setBusqueda] = useState("");
	const rolUsuario = useAtomValue(userRolAtom)
	const navigate = useNavigate();
	
	// Solo cargar los donadores según el rol del usuario
	const esSecretariaGrupal = rolUsuario === 5;
	
	// Cargar solo los datos necesarios según el rol - usar la misma queryKey
	const { data: donadores, isLoading: loading, refetch: refetchTodos } = useDonadores(!esSecretariaGrupal && rolUsuario !== null);
	const { data: donantesGrupo, isLoading: loadingDGrupo, refetch: refetchGrupo } = useDonadoresGrupo(undefined, esSecretariaGrupal && rolUsuario !== null);

	const { mutate: eliminarDonante } = useEliminarDonantes()

	const handleEliminarDonador = async (id_usuario: number) => {
		toast.warning('¿Quieres eliminar este donador? Esta acción no se puede deshacer.', {
			action: {
				label: 'Eliminar', onClick: () => {
					eliminarDonante(id_usuario)
				}
			},
			actionButtonStyle: { backgroundColor: 'red' }, cancel: { label: 'Cancelar', onClick: () => toast.success('Accion cancelada') }
		},)
	};

	// Determinar qué datos usar según el rol
	const datosAMostrar = esSecretariaGrupal ? donantesGrupo : donadores;
	const isLoadingData = esSecretariaGrupal ? loadingDGrupo : loading;
	const refetch = esSecretariaGrupal ? refetchGrupo : refetchTodos;

	const donadoresFiltrados = datosAMostrar ? datosAMostrar.filter((d: Donador) =>
		`${d.nombre} ${d.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
		(d.email || '').toLowerCase().includes(busqueda.toLowerCase()) ||
		String(d.dni).toLowerCase().includes(busqueda.toLowerCase()) ||
		(d.nombre_grupo || '').toLowerCase().includes(busqueda.toLowerCase())
	) : [];

	if (isLoadingData) {
		return (
			<div className="flex min-h-screen">
				<Sidebar />
				<div className="flex-1 flex justify-center items-center">
					<LoadingSpinner message="Cargando donadores..." />
				</div>
			</div>
		);
	}

	return (
		<div className="flex justify-end min-h-screen bg-gray-100">
			<Sidebar />

			<div className="w-full md:w-5/6 p-8">
				<div className="flex-1">
					<div className="flex justify-between items-center mb-6">
						<div className="flex items-center">
							<Link to="/home" className="mr-4">
								<img className="h-6" src={flechaAtras} alt="Volver" />
							</Link>
							<h1 className="text-4xl font-extrabold text-black">Gestión de Donadores</h1>
						</div>
						{(rolUsuario === 4 || rolUsuario === 5) && (
							<div>
								<Link to="/crear-donador" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Registrar donante</Link>
							</div>
						)}
					</div>

					<div className="bg-white p-8 rounded-xl shadow-lg">
						<div className="flex justify-between items-center mb-4">
							<div className="flex items-center gap-2">
								<img src={lupa} alt="Buscar" className="h-4" />
								<input
									type="text"
									value={busqueda}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
									className="w-full md:w-80 bg-gray-100 rounded-md p-2"
									placeholder="Buscar por nombre, DNI, email o grupo"
								/>
							</div>
							<button onClick={() => refetch()} className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800">Actualizar</button>
						</div >

						<div className={`grid ${rolUsuario === 4 || rolUsuario === 5 ? 'grid-cols-[60px_1fr_1fr_120px_2fr_1fr_200px]' : 'grid-cols-[60px_1fr_1fr_120px_2fr_1fr]'} gap-4 font-bold p-4 bg-gray-50 rounded-lg mb-4`}>
							<p>ID</p>
							<p>Nombre</p>
							<p>Apellido</p>
							<p>DNI</p>
							<p>Correo</p>
							<p>Grupo</p>
							{(rolUsuario === 4 || rolUsuario === 5) && <p>Acciones</p>}
						</div>

						<div className="space-y-2">
							{donadoresFiltrados && donadoresFiltrados.length > 0 ? (
								donadoresFiltrados?.map((d: Donador) => (
									<div key={d.id_donante_fijo} className={`grid ${rolUsuario === 4 || rolUsuario === 5 ? 'grid-cols-[60px_1fr_1fr_120px_2fr_1fr_200px]' : 'grid-cols-[60px_1fr_1fr_120px_2fr_1fr]'} gap-4 p-2 hover:bg-gray-100 transition-colors rounded-lg text-sm items-center`}>
										<p className="truncate">{d.id_donante_fijo}</p>
										<p className="truncate">{d.nombre}</p>
										<p className="truncate">{d.apellido}</p>
										<p className="truncate">{d.dni}</p>
										<p className="truncate" title={d.email}>{d.email}</p>
										<p className="truncate" title={d.nombre_grupo || '-'}>{d.nombre_grupo || '-'}</p>
										{(rolUsuario === 4 || rolUsuario === 5) && (
											<div className="flex gap-1">
												<button onClick={() => navigate(`/modificar-donador/${d.id_donante_fijo}`)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Modificar</button>
												<button onClick={() => handleEliminarDonador(d.id_donante_fijo)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
											</div>
										)}
									</div>
								))
							) : (
								<p className="text-center text-gray-500 py-8">No se encontraron donadores.</p>
							)}
						</div>
					</div>
				</div >
			</div >
		</div >
	);
}
