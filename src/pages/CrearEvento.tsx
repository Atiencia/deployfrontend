import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { LoadingButton } from "../components/LoadingButton";
import { NoAutorizado } from "./NoAutorizado";
import { toast } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import { useAtom, useAtomValue } from "jotai";
import { subgruposAtom, userRolAtom } from "../store/jotaiStore";
import { useGrupos } from "../queries/gruposQueries";
import { useCrearEvento } from "../queries/eventosQueries";
import { useCrearYAsociarEvento, useMisGruposSecretaria } from "../queries/secretariaGrupoQueries";
import { useSubgruposPorGrupo } from "../queries/subgrupoQueries";
import SubgruposEvento from "../components/SubgruposEvento";
import type { Subevento } from "../../types/evento";

//Cambie el tipado de las fechas de string a Dates


// 1. Definir la constante del ID de Mercado Pago
const MERCADO_PAGO_ACCOUNT_ID = "1451233743";

type FormState = {
  nombre: string;
  fecha: Date | null; // <-- Acepta null
  descripcion: string;
  cupos: number | "";
  grupo: string;
  cupos_suplente: string | number,
  fechaLimiteInscripcion: Date | null; // <-- Acepta null
  fechaLimiteBaja: Date | null; // <-- Acepta null
  lugar: string;
  categoria: string;
  costo?: number | "";
  cuenta_destino?: string;
  estado: 'vigente' | 'transcurrido' | 'cancelado',
  formSubgrupos?: Subevento[]
};

// ... en el componente ...



export default function CrearEvento() {
  const [formSubgrupos, setAtomSubgrupos] = useAtom(subgruposAtom)
  const [usarSubgrupos, setUsarSubgrupos] = useState(false); // Estado para controlar subgrupos
  const [form, setForm] = useState<FormState>({
    nombre: "",
    fecha: null, // <-- Inicializa en null
    descripcion: "",
    cupos: "",
    cupos_suplente: "",
    grupo: "",
    lugar: "",
    categoria: "",
    fechaLimiteInscripcion: null, // <-- Inicializa en null
    fechaLimiteBaja: null, // <-- Inicializa en null
    costo: "",
    cuenta_destino: "",
    estado: "vigente",
    formSubgrupos: formSubgrupos
  });

  const [error, setError] = useState("");
  const { data: grupos } = useGrupos()
  const { isPending, mutate, isSuccess } = useCrearEvento()
  const eventoAsociadoManual = useCrearYAsociarEvento()
  const rolUsuario = useAtomValue(userRolAtom)
  const { data: misGrupos, isSuccess: misGruposSuccess, isLoading: loadingMisGrupos } = useMisGruposSecretaria(rolUsuario)
  const { data: subgrupos, isSuccess: subgruposSuccess } = useSubgruposPorGrupo(rolUsuario == 5 && misGrupos ? misGrupos?.grupos[0].id_grupo : parseInt(form.grupo))
  const navigate = useNavigate()
  const loading = (isPending || eventoAsociadoManual.isPending)

  if (rolUsuario == 3) {
    return <NoAutorizado></NoAutorizado>
  }

  // Cuando se selecciona la categoría "pago", autoasignar la cuenta destino
  useEffect(() => {
    if (form.categoria === "pago") {
      setForm((prev) => ({
        ...prev,
        cuenta_destino: MERCADO_PAGO_ACCOUNT_ID,
      }));
    }
  }, [form.categoria]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "date") {
      // Si el input es de fecha, convierte el string (YYYY-MM-DD) a un objeto Date
      // Añadimos 'T00:00:00' para evitar problemas de zona horaria (se guarda como medianoche local)
      setForm({
        ...form,
        [name]: value ? new Date(`${value}T00:00:00`) : null,
      });
    } else if (type === "datetime-local") {
      // Para datetime-local, el valor ya viene en formato ISO
      setForm({
        ...form,
        [name]: value ? new Date(value) : null,
      });
    } else {
      // Manejo normal para el resto de inputs
      setForm({ ...form, [name]: value });
    }
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    // .toISOString() da "2025-11-14T..."
    // .split('T')[0] extrae solo "2025-11-14"
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    console.log(subgrupos, 'subgrupos', usarSubgrupos)
    if (subgrupos && subgrupos.length > 0 || subgruposSuccess) {
      setUsarSubgrupos(true);
    } else {
      setUsarSubgrupos(false);
    }
    console.log(subgrupos, 'subgrupos', usarSubgrupos)
  }, [subgrupos]); // Se ejecuta cuando la query de subgrupos cambia

  // <--- CAMBIO: Función del botón "No deseo usar subgrupos"
  const handleDesactivarSubgrupos = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setUsarSubgrupos(false); // 1. Oculta la UI de subgrupos
    setAtomSubgrupos([]);    // 2. Limpia el átomo para que no se envíe basura

    // Opcional: Limpiar inputs de cupos en el form si es necesario
    setForm(prev => ({ ...prev, cupos: "", cupos_suplente: "" }));

    toast.info("Se han desactivado los subgrupos. Ingrese cupos generales.");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // --- Validación de fechas ---
      // (Tu lógica de validación aquí está BIEN, pero asegúrate de
      // manejar los 'null' si las fechas no son obligatorias)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (!form.fecha) return toast.error("La fecha del evento es obligatoria");

      // new Date(form.fecha) ya no es necesario, form.fecha ES un Date.
      if (form.fecha < hoy) return toast.error("No se puede crear un evento con fecha pasada");

      if (form.fechaLimiteInscripcion) {
        if (form.fechaLimiteInscripcion < hoy) return toast.error("La fecha límite de inscripción no puede ser pasada");
        if (form.fechaLimiteInscripcion > form.fecha) return toast.error("La fecha límite de inscripción no puede ser posterior a la fecha del evento");
      }

      if (form.fechaLimiteBaja) {
        if (form.fechaLimiteBaja < hoy) return toast.error("La fecha límite de baja no puede ser pasada");
        if (form.fechaLimiteInscripcion) {
          const fechaIns = new Date(form.fechaLimiteInscripcion);
          if (form.fechaLimiteBaja < fechaIns) return toast.error("La fecha límite de baja no puede ser anterior a la de inscripción");
        }
        if (form.fechaLimiteBaja > form.fecha) return toast.error("La fecha límite de baja no puede ser posterior a la fecha del evento");
      }

      // --- Lógica de Mutación (Corregida) ---

      // Prepara el payload del evento
      const eventoPayload = {
        nombre: form.nombre,
        fecha: form.fecha, // Ya es un Date
        descripcion: form.descripcion,
        cupos: Number(form.cupos) || 0,
        cupos_suplente: Number(form.cupos_suplente) || 0,
        lugar: form.lugar,
        categoria: form.categoria,
        costo: form.costo || undefined,
        fecha_limite_inscripcion: form.fechaLimiteInscripcion || undefined, // Ya es Date
        fecha_limite_baja: form.fechaLimiteBaja || undefined,// Ya es Date,
        formSubgrupos: usarSubgrupos ? formSubgrupos : [],
        id_grupo: form.grupo  === '' ? grupos![0].id_grupo.toString() : '0'
      };

      // Lógica IF/ELSE para llamar a la mutación correcta
      if (form.grupo && rolUsuario !== 5) {
        // Si se usan subgrupos, los cupos generales suelen ser 0 o calculados, 
        // pero si NO se usan, el cupo debe ser mayor a 0.
        if (!usarSubgrupos && Number(form.cupos) === 0) {
          return toast.error("Debe ingresar una cantidad de cupos válida.");
        }

        // Si tienes lógica específica para cupos=0
        if (form.cupos === 0 || usarSubgrupos) {
          eventoAsociadoManual.mutate({ evento: eventoPayload, grupoId: form.grupo });
        } else {
          eventoAsociadoManual.mutate({ evento: eventoPayload, grupoId: form.grupo });
        }
      } else {
        // Caso 2: Secretaria Grupal (grupo se asocia en backend) o evento sin grupo
        mutate(eventoPayload);
      }

      // --- QUITAR EL RESET DE AQUÍ ---
      // setForm({ ... }); // <-- Mover esto a onSuccess de tus hooks

    } catch (err: any) {
      const msg = err.message || "Error al crear el evento";
      setError(msg);
      toast.error(msg, { duration: 5000 });
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Barra lateral */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 p-4 md:p-12 pt-20 md:pt-12 md:ml-56">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Crear Evento</h1>
            <p className="text-gray-600">Complete la información para crear un nuevo evento</p>
          </div>

          {/* 🔹 Paso 1: Solo mostrar el selector de categoría al inicio */}
          {!form.categoria ? (
            <div className="bg-white rounded-xl shadow-md p-8 max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Seleccione el tipo de evento
                </h2>
                <p className="text-gray-600">Elija la categoría que mejor se adapte a su evento</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Evento Normal */}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, categoria: "normal" })}
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                      <svg className="w-8 h-8 text-blue-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Evento Normal</h3>
                    <p className="text-sm text-gray-600">Reuniones, charlas, capacitaciones y eventos generales</p>
                  </div>
                </button>

                {/* Salida */}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, categoria: "salida" })}
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                      <svg className="w-8 h-8 text-green-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Salida</h3>
                    <p className="text-sm text-gray-600">Salidas misioneras, viajes y actividades fuera de la institución</p>
                  </div>
                </button>

                {/* Evento de Pago */}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, categoria: "pago" })}
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                      <svg className="w-8 h-8 text-yellow-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Evento de Pago</h3>
                    <p className="text-sm text-gray-600">Eventos que requieren un pago para inscribirse</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            //Paso 2: Mostrar el formulario completo según la categoría
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6 border border-gray-200">
              {/* Header del formulario con categoría seleccionada */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold capitalize">
                    {form.categoria === "pago" ? "Evento de Pago" : form.categoria}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, categoria: "" })}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cambiar categoría
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre del Evento */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Evento
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Retiro Espiritual 2025"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Grid para Cupos y Cupos Suplentes */}
                {(!(form.grupo || grupos) || !subgrupos || subgrupos.length === 0 || !usarSubgrupos) && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cupos */}
                  <div>
                    <label htmlFor="cupos" className="block text-sm font-medium text-gray-700 mb-1">
                      Cupos Disponibles
                    </label>
                    <input
                      id="cupos"
                      name="cupos"
                      type="number"
                      min="1"
                      value={form.cupos}
                      onChange={handleChange}
                      required
                      placeholder="Ej: 50"
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Cupos Suplentes */}
                  <div>
                    <label htmlFor="cupos_suplente" className="block text-sm font-medium text-gray-700 mb-1">
                      Cupos de Suplentes
                    </label>
                    <input
                      id="cupos_suplente"
                      name="cupos_suplente"
                      type="number"
                      min="0"
                      value={form.cupos_suplente}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lista de espera cuando se agoten los cupos titulares
                    </p>
                  </div>
                </div>}

                {/* Fecha del Evento */}
                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha del Evento
                  </label>
                  <input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={formatDateForInput(form.fecha)}
                    onChange={handleChange}
                    onKeyDown={(e) => e.preventDefault()}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Lugar */}
                <div>
                  <label htmlFor="lugar" className="block text-sm font-medium text-gray-700 mb-1">
                    Lugar
                  </label>
                  <input
                    id="lugar"
                    name="lugar"
                    value={form.lugar}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Salón Principal - Instituto Misionero"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Campos específicos según categoría */}
                {form.categoria === "salida" && (
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grupo Misionero
                      </label>
                      {rolUsuario !== 5 ? (
                        <select
                          id="grupo"
                          name="grupo"
                          value={form.grupo}
                          onChange={handleChange}
                          required
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Seleccione un grupo</option>
                          {grupos?.map((g) => (
                            <option key={g.id_grupo} value={g.id_grupo}>{g.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <>
                          {loadingMisGrupos ? (
                            <div className="border border-gray-300 rounded-md p-3 bg-gray-50 text-gray-500 flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Cargando grupo asignado...
                            </div>
                          ) : misGruposSuccess && misGrupos?.grupos.length > 0 ? (
                            <div className="border-2 border-green-500 rounded-md p-4 bg-green-50 flex items-center gap-3">
                              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="font-semibold text-green-800">{misGrupos?.grupos[0].nombre}</p>
                                <p className="text-sm text-green-600">Asignado automáticamente</p>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-red-500 rounded-md p-4 bg-red-50 flex items-center gap-3">
                              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-red-800 font-medium">No tienes un grupo asignado</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* CONDICIÓN 2: MOSTRAR COMPONENTE SUBGRUPOS
                    Se muestra si hay grupo Y hay subgrupos Y el usuario QUIERE usarlos
                    */}
                    {(form.grupo || grupos) && subgruposSuccess && subgrupos.length > 0 && usarSubgrupos && (
                      <div className="mt-6 border-2 border-red-100 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-800">Distribución por Subgrupos</h3>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Activo</span>
                        </div>

                        <SubgruposEvento subgrupos={subgrupos} ></SubgruposEvento>

                        <div className="mt-4 flex justify-end">
                          <button
                            type="button" // IMPORTANTE: type="button" para no enviar form
                            className="text-sm text-red-400 hover:text-white p-2 hover:bg-red-400 rounded-md"
                            onClick={handleDesactivarSubgrupos}
                          >
                            No deseo usar subgrupos en esta salida (usar cupos generales)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Si desactivó los subgrupos pero existen, mostrar opción para reactivarlos (Opcional, buena UX) */}
                    {(form.grupo || grupos) && subgrupos && subgrupos.length > 0 && !usarSubgrupos && (
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          className="text-sm text-blue-400 hover:text-white p-2 hover:bg-blue-400 rounded-md"
                          onClick={() => setUsarSubgrupos(true)}
                        >
                          Volver a usar distribución por subgrupos
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {form.categoria === "pago" && (
                  <div className="space-y-6">
                    {/* Grid para Costo y Cuenta destino */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Costo */}
                      <div>
                        <label htmlFor="costo" className="block text-sm font-medium text-gray-700 mb-1">
                          Costo del Evento
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                          <input
                            id="costo"
                            type="number"
                            name="costo"
                            value={form.costo}
                            onChange={handleChange}
                            required
                            placeholder="5000"
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 pl-8 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      </div>

                      {/* Cuenta destino */}
                      <div>
                        <label htmlFor="cuenta_destino" className="block text-sm font-medium text-gray-700 mb-1">
                          Cuenta Destino (Mercado Pago)
                        </label>
                        <input
                          id="cuenta_destino"
                          type="text"
                          name="cuenta_destino"
                          value={form.cuenta_destino}
                          disabled
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Información del destinatario */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-md p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900 mb-2">Información del destinatario:</p>
                          <div className="space-y-1 text-blue-800">
                            <p><span className="font-medium">Nombre:</span> Secretaría General - Instituto Misionero</p>
                            <p><span className="font-medium">Entidad:</span> Mercado Pago</p>
                            <p><span className="font-medium">Tipo de cuenta:</span> Cuenta Institucional</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid para fechas límite */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fecha Límite de Inscripción */}
                  <div>
                    <label htmlFor="fechaLimiteInscripcion" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Límite de Inscripción
                    </label>
                    <input
                      id="fechaLimiteInscripcion"
                      name="fechaLimiteInscripcion"
                      type="date"
                      value={formatDateForInput(form.fechaLimiteInscripcion)}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Fecha Límite de Baja */}
                  <div>
                    <label htmlFor="fechaLimiteBaja" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Límite de Baja
                    </label>
                    <input
                      id="fechaLimiteBaja"
                      name="fechaLimiteBaja"
                      type="date"
                      value={formatDateForInput(form.fechaLimiteBaja)}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    rows={5}
                    value={form.descripcion}
                    onChange={handleChange}
                    required
                    placeholder="Describe los detalles del evento..."
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 resize-y focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Botón Submit y Mensajes */}
                <div className="pt-5">
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => navigate('/eventos')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <LoadingButton
                      type="submit"
                      loading={loading}
                      loadingText="Creando..."
                      className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      disabled={loading}
                    >
                      Crear Evento
                    </LoadingButton>
                  </div>

                  {error && (
                    <div className="mt-3 text-sm text-red-600 text-center">{error}</div>
                  )}
                  {isSuccess && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-800">
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Evento creado exitosamente</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}