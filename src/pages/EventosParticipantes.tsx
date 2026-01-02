import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import flechaAtras from "../assets/flechaizquierda.png";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Sidebar from "../components/Sidebar";

import { LoadingSpinner } from "../components/LoadingComponents";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { useEventosPorGrupo, useInscriptos } from "../queries/eventosQueries";
import { useGrupos } from "../queries/gruposQueries";



interface ExportarProps {
  onClose: () => void;
  onExport: (formato: string) => void;
}

const Exportar = ({ onClose, onExport }: ExportarProps) => {
  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Selecciona el formato de exportación:
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => onExport("pdf")}
            className="flex flex-col items-center p-4 bg-gray-100 rounded-lg transition-transform transform hover:scale-105 hover:bg-red-100"
          >
            <span className="text-5xl">📄</span>
            <span className="mt-2 font-semibold text-gray-700">PDF</span>
          </button>
          <button
            onClick={() => onExport("excel")}
            className="flex flex-col items-center p-4 bg-gray-100 rounded-lg transition-transform transform hover:scale-105 hover:bg-red-100"
          >
            <span className="text-5xl">📊</span>
            <span className="mt-2 font-semibold text-gray-700">Excel</span>
          </button>
          <button
            onClick={() => onExport("csv")}
            className="flex flex-col items-center p-4 bg-gray-100 rounded-lg transition-transform transform hover:scale-105 hover:bg-red-100"
          >
            <span className="text-5xl">📝</span>
            <span className="mt-2 font-semibold text-gray-700">CSV</span>
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 20; // Cantidad de items por página para lazy loading

export default function EventosParticipantes() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<number>("" as unknown as number)
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number>("" as unknown as number)
  const [mostrarLista, setMostrarLista] = useState(false);
  const {data: inscriptos, isLoading: inscriptosLoading}  = useInscriptos(eventoSeleccionado)
  const {data: grupos, isLoading: gruposLoading} = useGrupos()
  const {data: eventos, isLoading: eventosLoading} = useEventosPorGrupo(grupoSeleccionado)
  
  // Estados para lazy loading
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrandoTodos, setMostrandoTodos] = useState(false);
  const rolUsuario = useAtomValue(userRolAtom)


  /*/ Usar cache para grupos con clave única por rol para evitar conflictos al cambiar de usuario
  const { data: grupos, loading: gruposLoading } = useCachedData<grupo[]>(
    `grupos-list-rol-${rolUsuario || 'unknown'}`, 
    obtenerGrupos, 
    { ttl: 10 * 60 * 1000 } // 10 minutos de cache
  );

  // Usar cache para eventos por grupo con clave única por rol
  const { data: eventos, loading: eventosLoading } = useCachedData<evento[]>(
    `eventos-grupo-${grupoSeleccionado}-rol-${rolUsuario || 'unknown'}`, 
    () => grupoSeleccionado ? obtenerEventosPorGrupo(grupoSeleccionado) : Promise.resolve([]),
    { 
      ttl: 3 * 60 * 1000, // 3 minutos de cache
      forceRefresh: !grupoSeleccionado
    }
  );*/

  // Debug: Ver qué grupos está recibiendo
  console.log('Rol usuario:', rolUsuario);
  console.log('Grupos recibidos:', grupos);
  console.log('Eventos:', eventos);

  // Auto-seleccionar el grupo para secretaria grupal
  useEffect(() => {
    if (rolUsuario === 5 && grupos && grupos.length > 0 && !grupoSeleccionado) {
      setGrupoSeleccionado(grupos[0].id_grupo);
    }
  }, [rolUsuario, grupos, grupoSeleccionado]);


  useEffect(() => {
    // Obtener los eventos cada vez que cambia el grupo seleccionado
    if (!mostrarLista) {
      // Reset lazy loading states
      setPaginaActual(1);
      setMostrandoTodos(false);
      return;
    }

  }, [mostrarLista, eventoSeleccionado])


  const handleExport = (formato: string) => {
    // Verificar que hay inscriptos antes de exportar
    if (inscriptos?.length === 0) {
      toast.warning('No hay inscriptos para exportar en este evento', {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    const headers = [
      "N°", "N° Alumno", "Alumno", "Tipo", "Nro. Doc.",
      "Nacionalidad", "Firma Ida", "Firma Vuelta",
    ];
    
    // Usar datos reales de inscriptos en lugar de datos mock
    const body = inscriptos?.map((p, index) => [
      index + 1, 
      p.numeroAlumno || '', 
      `${p.nombre} ${p.apellido}`, 
      p.tipo_documento || '',
      p.dni_usuario || '', 
      p.nacionalidad || '', 
      '', // Firma Ida - vacío por defecto
      '', // Firma Vuelta - vacío por defecto
    ]);
    
    // Obtener el nombre del evento seleccionado para el título
    const eventoNombre = (eventos || []).find(e => e.id_evento === eventoSeleccionado)?.nombre || 'Evento';
    const grupoNombre = (grupos || []).find(g => g.id_grupo === grupoSeleccionado)?.nombre || 'Grupo';
    const titulo = `${eventoNombre} - ${grupoNombre}`;

    // Lógica para PDF
    if (formato === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(titulo, 14, 20);
      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 30,
        headStyles: {
          fillColor: [255, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        didDrawCell: (data) => {
          if (data.row.index === 13 && (data.column.index === 2 || data.column.index === 3)) {
            doc.setFillColor(220, 220, 220);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text(data.cell.text, data.cell.x + 2, data.cell.y + data.cell.height / 2, { baseline: 'middle' });
          }
        },
      });
      doc.save(`${titulo.replace(/[^a-zA-Z0-9]/g, '_')}_participantes.pdf`);
      setMostrarModal(false); // Cerrar modal después de exportar
    }

    // Lógica para Excel (mediante tabla HTML)
    if (formato === "excel") {
      let htmlString = `<table><thead><tr><th colspan="${headers.length}" style="background-color:#FF0000; color:#FFFFFF; text-align:center; font-size:16px;">${titulo}</th></tr><tr></tr><tr>${headers.map(h => `<th style="background-color:#FF0000; color:#FFFFFF;">${h}</th>`).join('')}</tr></thead><tbody>`;
      body?.forEach((row, rowIndex) => {
        const backgroundColor = rowIndex % 2 !== 0 ? '#F0F0F0' : '#FFFFFF';
        htmlString += `<tr style="background-color:${backgroundColor};">`;
        row.forEach((cell, cellIndex) => {
          if (rowIndex === 13 && (cellIndex === 2 || cellIndex === 3)) {
            htmlString += `<td style="background-color:#DCDCDC;">${cell}</td>`;
          } else {
            htmlString += `<td>${cell}</td>`;
          }
        });
        htmlString += `</tr>`;
      });
      htmlString += `</tbody></table>`;
      const tempEl = document.createElement('div');
      tempEl.innerHTML = htmlString;
      const table = tempEl.getElementsByTagName('table')[0];
      const worksheet = XLSX.utils.table_to_sheet(table);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Participantes");
      XLSX.writeFile(workbook, `${titulo.replace(/[^a-zA-Z0-9]/g, '_')}_participantes.xlsx`);
      setMostrarModal(false); // Cerrar modal después de exportar
    }

    // Lógica para CSV (sin estilos)
    if (formato === "csv") {
      const worksheetData = [headers, ...(body || [])];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Participantes");
      XLSX.writeFile(workbook, `${titulo.replace(/[^a-zA-Z0-9]/g, '_')}_participantes.csv`, { bookType: "csv" });
      setMostrarModal(false); // Cerrar modal después de exportar
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Barra lateral */}
      <Sidebar></Sidebar>

      {/* Contenido principal */}
      <section className="w-50"></section>
      <div className="flex-1 p-10 transition-all duration-300">
        {/* vista 1 */}
        {!mostrarLista && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Link to={"/eventos"} className="mr-4">
                  <img className="h-6" src={flechaAtras} alt="Volver" />
                </Link>
                <h1 className="text-4xl font-extrabold text-black">
                  Lista - Eventos
                </h1>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">

              <div className="mb-6">
                <label
                  htmlFor="grupos"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Grupos
                </label>
                
                {/* Si es secretaria grupal (rol 5), mostrar grupo asignado automáticamente */}
                {rolUsuario === 5 ? (
                  gruposLoading ? (
                    <div className="w-full p-4 border border-gray-300 rounded-md bg-gray-50">
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" message="" />
                        <span className="ml-2 text-sm text-gray-600">Cargando grupo asignado...</span>
                      </div>
                    </div>
                  ) : (grupos && grupos.length > 0) ? (
                    <div className="w-full p-3 border-2 border-green-200 rounded-md bg-green-50">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-green-800">
                            {grupos[0].nombre} <span className="font-normal text-green-700">(Tu grupo asignado)</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full p-4 border-2 border-red-200 rounded-md bg-red-50">
                      <p className="text-sm text-red-800">
                        ⚠️ No tienes un grupo asignado. Contacta al administrador.
                      </p>
                    </div>
                  )
                ) : (
                  /* Admin y secretaria general: selector normal */
                  <select
                    id="grupos"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                    value={grupoSeleccionado}
                    onChange={(e) => setGrupoSeleccionado(parseInt(e.target.value))}
                    disabled={gruposLoading}
                  >
                    <option value="">{gruposLoading ? 'Cargando grupos...' : 'Escoge un grupo'}</option>
                    {
                      (grupos || []).map((grupo) => {
                        return <option key={grupo.id_grupo} value={grupo.id_grupo}>{grupo.nombre}</option>
                      })
                    }
                  </select>
                )}
                {gruposLoading && rolUsuario !== 5 && (
                  <div className="flex items-center mt-2">
                    <LoadingSpinner size="sm" message="" />
                    <span className="ml-2 text-sm text-gray-600">Cargando grupos...</span>
                  </div>
                )}
              </div>

              {grupoSeleccionado &&
                <div className="mb-4">
                  <label
                    htmlFor="eventos"
                    className="block text-lg font-medium text-gray-700 mb-1"
                  >
                    Eventos
                  </label>
                  
                  {eventosLoading ? (
                    <div className="w-full p-4 border border-gray-300 rounded-md bg-gray-50">
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" message="" />
                        <span className="ml-2 text-sm text-gray-600">Cargando eventos del grupo...</span>
                      </div>
                    </div>
                  ) : (!eventos || eventos.length === 0) ? (
                    <div className="w-full p-4 border-2 border-yellow-200 rounded-md bg-yellow-50">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-yellow-800 mb-1">
                            No hay eventos disponibles para este grupo
                          </p>
                          <p className="text-sm text-yellow-700">
                            Por favor, crea eventos para este grupo antes de generar listas de participantes.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <select
                      id="eventos"
                      value={eventoSeleccionado}
                      onChange={(e) => setEventoSeleccionado(parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Escoge un evento</option>
                      {
                        (eventos || []).map((evento) => {
                          return <option key={evento.id_evento} value={evento.id_evento}>{evento.nombre}</option>
                        })
                      }
                    </select>
                  )}
                </div>}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!grupoSeleccionado || !eventoSeleccionado) {
                      toast.warning('Por favor selecciona un grupo y un evento antes de generar la lista', {
                        position: "top-right",
                        duration: 3000,
                      });
                      return;
                    }
                    setMostrarLista(true);
                  }}
                  disabled={!grupoSeleccionado || !eventoSeleccionado || eventosLoading}
                  className={`px-6 py-3 font-bold rounded-lg shadow-md transition-colors ${
                    grupoSeleccionado && eventoSeleccionado && !eventosLoading
                      ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  Generar lista
                </button>
              </div>
            </div>
          </>
        )}

        {/* vista 2 */}
        {mostrarLista && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => setMostrarLista(false)}
                  className="mr-4 cursor-pointer"
                >
                  <img className="h-6" src={flechaAtras} alt="Volver" />
                </button>
                <h1 className="text-4xl font-extrabold text-black">
                  Lista - Evento
                </h1>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {(eventos || []).find(e => e.id_evento === eventoSeleccionado)?.nombre || 'Evento'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Grupo: {(grupos || []).find(g => g.id_grupo === grupoSeleccionado)?.nombre || 'N/A'} | 
                    Participantes: {inscriptosLoading ? 'Cargando...' : inscriptos?.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMostrarModal(true)}
                    disabled={inscriptosLoading || inscriptos?.length === 0}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      inscriptosLoading || inscriptos?.length === 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                    }`}
                  >
                    {inscriptosLoading ? 'Cargando...' : 'Exportar'}
                  </button>
                </div>
              </div>

              {inscriptosLoading ? (
                <div className="border border-gray-300 rounded-lg p-8 text-center">
                  <LoadingSpinner 
                    size="lg" 
                    message="Cargando inscriptos..."
                    subtitle="Por favor espera mientras obtenemos la lista de participantes."
                  />
                </div>
              ) : inscriptos?.length === 0 ? (
                <div className="border border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay inscriptos</h3>
                    <p className="text-gray-600">
                      No se encontraron inscriptos para este evento. Verifica que el evento tenga participantes registrados.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg overflow-auto">
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Total de participantes: <span className="font-semibold">{inscriptos?.length}</span>
                    </p>
                    {inscriptos && inscriptos.length > ITEMS_PER_PAGE && (
                      <button
                        onClick={() => {
                          setMostrandoTodos(!mostrandoTodos);
                          setPaginaActual(1);
                        }}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        {mostrandoTodos ? 'Mostrar paginado' : 'Mostrar todos'}
                      </button>
                    )}
                  </div>
                  
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-gray-100 font-bold">
                      <tr>
                        <th className="px-4 py-2">N°</th>
                        <th className="px-4 py-2">N° Alumno</th>
                        <th className="px-4 py-2">Alumno</th>
                        <th className="px-4 py-2">Tipo</th>
                        <th className="px-4 py-2">Nro. Doc.</th>
                        <th className="px-4 py-2">Nacionalidad</th>
                        <th className="px-4 py-2">Firma Ida</th>
                        <th className="px-4 py-2">Firma Vuelta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const participantesToShow = mostrandoTodos && inscriptos
                          ? inscriptos 
                          : inscriptos?.slice(0, paginaActual * ITEMS_PER_PAGE);
                        
                        return participantesToShow?.map((p, index) => (
                          <tr key={p.numeroAlumno} className="border-b">
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{p.numeroAlumno}</td>
                            <td className="px-4 py-2">{p.nombre + ' ' + p.apellido}</td>
                            <td className="px-4 py-2">{p.tipo_documento}</td>
                            <td className="px-4 py-2">{p.dni_usuario}</td>
                            <td className="px-4 py-2">{p.nacionalidad}</td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                  
                  {/* Controles de paginación */}
                  {!mostrandoTodos && inscriptos && inscriptos.length > ITEMS_PER_PAGE && (
                    <div className="mt-4 flex justify-center items-center space-x-4">
                      {paginaActual * ITEMS_PER_PAGE < inscriptos.length && (
                        <button
                          onClick={() => setPaginaActual(prev => prev + 1)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Cargar más participantes ({Math.min(ITEMS_PER_PAGE, inscriptos.length - paginaActual * ITEMS_PER_PAGE)} restantes)
                        </button>
                      )}
                      
                      {paginaActual > 1 && (
                        <button
                          onClick={() => {
                            setPaginaActual(1);
                          }}
                          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Volver al inicio
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {mostrarModal && (
          <Exportar
            onClose={() => setMostrarModal(false)}
            onExport={handleExport}
          />
        )}
      </div>
    </div>
  );
}