import {  useState } from 'react';
import { toast } from 'sonner'
import Sidebar from '../components/Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import { useAsignarRol, useRoles, useUsuarios } from '../queries/listaQueries';
import { useGrupos } from '../queries/gruposQueries';
import { useAsignacionSecretaria } from '../queries/secretariaGrupoQueries';

interface Rol {
  id_rol: number;
  nombre: string;
}

export default function GestionRoles() {
  
  const { data: usuarios = [] } = useUsuarios()
  const { data: grupos = [] } = useGrupos()
  const { data: roles = [] } = useRoles()

  const { mutate: asignarSecretariaAGrupo, isPending: procesandoAsignacionSecretaria } = useAsignacionSecretaria()
  const { mutate: asignarRolAUsuario, isPending: procesandoAsignacionRol } = useAsignarRol()


  const [busqueda, setBusqueda] = useState('');
  const [editandoUsuario, setEditandoUsuario] = useState<number | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<string>('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number>(0);


  const handleEditarRol = (usuarioId: number, rolActual: number) => {
    const rolActualNombre = getRolNombre(rolActual);
    setEditandoUsuario(usuarioId);
    setRolSeleccionado(rolActualNombre);
    setGrupoSeleccionado(0);
  };

  const handleCancelar = () => {
    setEditandoUsuario(null);
    setRolSeleccionado('');
    setGrupoSeleccionado(0);
  };

  const handleGuardarRol = async (usuarioId: number) => {
    if (!rolSeleccionado) {
      toast.error('Debes seleccionar un rol');
      return;
    }

    // Si es secretaria grupal, validar que se haya seleccionado un grupo
    if (rolSeleccionado === 'secretaria grupal' && grupoSeleccionado === 0) {
      toast.error('Debes seleccionar un grupo para la secretaria grupal');
      return;
    }

    // Limpiar toasts anteriores
    toast.dismiss();
    
    // Mostrar toast de carga
    const toastId = toast.loading(
      rolSeleccionado === 'secretaria grupal' && grupoSeleccionado > 0
        ? 'Asignando rol y grupo...'
        : 'Asignando rol...'
    );

    // Primero asignamos el rol
    asignarRolAUsuario(
      {rol: rolSeleccionado, usuarioId},
      {
        onSuccess: () => {
          // Si es secretaria grupal y se seleccionó un grupo, asignamos el grupo
          if(rolSeleccionado === 'secretaria grupal' && grupoSeleccionado > 0) {
            asignarSecretariaAGrupo(
              {usuarioId, grupoId: grupoSeleccionado},
              {
                onSuccess: () => {
                  toast.success('Rol y grupo asignados exitosamente', { id: toastId });
                  setTimeout(() => setEditandoUsuario(null), 500);
                },
                onError: (error) => {
                  toast.error('Rol asignado pero falló la asignación del grupo', { 
                    id: toastId,
                    description: error.message 
                  });
                  setTimeout(() => setEditandoUsuario(null), 500);
                }
              }
            )
          } else {
            toast.success('Rol asignado exitosamente', { id: toastId });
            setTimeout(() => setEditandoUsuario(null), 500);
          }
        },
        onError: (error) => {
          toast.error('Error al asignar rol', { 
            id: toastId,
            description: error.message 
          });
        }
      }
    )
  };

  const usuariosFiltrados = usuarios.filter((usuario : any) =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.dni.toString().includes(busqueda)
  );

  const getRolNombre = (id_rol: number): string => {
    const rol = roles.find((r: Rol) => r.id_rol === id_rol);
    return rol ? rol.nombre : 'Sin rol';
  };

  const getRolColor = (id_rol: number): string => {
    switch (id_rol) {
      case 1: return 'bg-purple-100 text-purple-700'; // developer
      case 2: return 'bg-red-100 text-red-700'; // admin
      case 3: return 'bg-gray-100 text-gray-700'; // usuario
      case 4: return 'bg-blue-100 text-blue-700'; // secretaria general
      case 5: return 'bg-green-100 text-green-700'; // secretaria grupal
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <div className="min-h-screen flex bg-gray-100">
        <Sidebar />

        <div className="flex-1 md:ml-56 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Gestión de Roles
            </h1>

            {/* Lista de usuarios con edición inline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Usuarios Registrados ({usuarios?.length})
                </h2>
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-80"
                />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                💡 Haz click en el rol de un usuario para cambiarlo
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DNI
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usuariosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    ) : (
                      usuariosFiltrados.map((usuario: any) => (
                        <tr key={usuario.id_usuario} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {usuario.correo}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {usuario.dni}
                          </td>
                          <td className="px-4 py-3">
                            {editandoUsuario === usuario.id_usuario ? (
                              <div className="space-y-2">
                                {/* Selector de rol */}
                                <select
                                  value={rolSeleccionado}
                                  onChange={(e) => setRolSeleccionado(e.target.value)}
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  disabled={procesandoAsignacionRol}
                                >
                                  {roles.map((rol: Rol) => (
                                    <option key={rol.id_rol} value={rol.nombre}>
                                      {rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}
                                    </option>
                                  ))}
                                </select>

                                {/* Selector de grupo (solo si es secretaria grupal) */}
                                {rolSeleccionado === 'secretaria grupal' && (
                                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                                    <label className="block text-xs font-medium text-green-800 mb-1">
                                      Asignar Grupo *
                                    </label>
                                    <select
                                      value={grupoSeleccionado}
                                      onChange={(e) => setGrupoSeleccionado(Number(e.target.value))}
                                      className="w-full px-3 py-1.5 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                                      disabled={procesandoAsignacionSecretaria}
                                    >
                                      <option value={0}>-- Selecciona grupo --</option>
                                      {grupos.map((grupo) => (
                                        <option key={grupo.id_grupo} value={grupo.id_grupo}>
                                          {grupo.nombre}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2 items-center">
                                <button
                                  onClick={() => handleEditarRol(usuario.id_usuario, usuario.id_rol)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${getRolColor(usuario.id_rol)}`}
                                >
                                  {getRolNombre(usuario.id_rol)}
                                </button>
                                {/* Mostrar grupo asignado si es secretaria grupal */}
                                {usuario.id_rol === 5 && usuario.nombre_grupo && (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                                    grupo: {usuario.nombre_grupo}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editandoUsuario === usuario.id_usuario ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleGuardarRol(usuario.id_usuario)}
                                  disabled={procesandoAsignacionRol || procesandoAsignacionSecretaria}
                                  className={`px-3 py-1 rounded text-xs font-semibold text-white transition-all ${
                                    procesandoAsignacionRol || procesandoAsignacionSecretaria
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : 'bg-green-600 hover:bg-green-700'
                                  }`}
                                >
                                  {procesandoAsignacionRol || procesandoAsignacionSecretaria ? 'Guardando...' : '✓ Guardar'}
                                </button>
                                <button
                                  onClick={handleCancelar}
                                  disabled={procesandoAsignacionRol || procesandoAsignacionSecretaria}
                                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-xs font-semibold text-gray-700 transition-all"
                                >
                                  ✕ Cancelar
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Click en rol para editar</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
