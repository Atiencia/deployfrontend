import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
// import { io, Socket } from 'socket.io-client';
import { esFechaBajaVencida } from '../utils/fechaUtils';
import evento1 from '../assets/evento1.jpg';
import { toast } from 'sonner';
import { NoAutorizado } from './NoAutorizado';
import { LoadingSpinner, ErrorState } from '../components/LoadingComponents';
import { useAtomValue } from 'jotai';
import { userRolAtom } from '../store/jotaiStore';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useDarDeBajaInscripcion, useDetallesInscripcion, useEventosPorId, useInscribirUsuario } from '../queries/eventosQueries';
import { useEstadisticas } from '../queries/suplenteQueries';
import { useCrearPreferenciaEventos } from '../queries/donacionesQueries';
import { useInscribirUsuarioSubevento, useSubgruposPorEvento } from '../queries/subgrupoQueries';
import type { Subgrupo } from '../../types/evento';

interface FormState {
  residencia: string;
  rol: string;
  primeraVez: boolean;
  carrera: string;
  anioCarrera: string;
  nombreRemitente: string;
  subgrupo: string;
}

export default function EventsRegistration() {
  const { id } = useParams();
  if (!id) return <p>No se espcifico un id valido</p>
  const { data: detalles, isLoading: loadingDetalles, error: errorDetalles } = useDetallesInscripcion(parseInt(id))
  const navigate = useNavigate();
  const { data: event, isLoading: loadingEvent, error: errorEvent } = useEventosPorId(parseInt(id))
  const { data: estadisticasState, error: errorEstadisticas, isLoading: loadingEstadisticas } = useEstadisticas(parseInt(id))
  const { data: subgrupos } = useSubgruposPorEvento(parseInt(id))

  const { mutate: darDeBajaInscripcion, isPending: loadingBaja, isSuccess: successDarBaja, data: dataBaja } = useDarDeBajaInscripcion(parseInt(id))
  const { mutateAsync: inscribirUsuario, isPending: loadingInscripcion } = useInscribirUsuario()
  const { mutateAsync: inscribirUsuarioSubgrupo, isPending: loadingInscripcionSubgrupo } = useInscribirUsuarioSubevento(parseInt(id))


  const handlePreferenciaSuccess = (data: any) => {
    // 'data' es la respuesta de la API (ej: { preferenceId: '...' })
    setPaymentState(prev => ({
      ...prev,
      preferenceId: data.preferenceId, // Asumo que tu API devuelve esto
      isLoading: false,
      error: null
    }));
  };

  const handlePreferenciaError = (error: Error) => {
    setPaymentState(prev => ({
      ...prev,
      isLoading: false,
      error: error.message
    }));
    toast.error('Error al crear la preferencia de pago', { description: error.message });
  };

  const { mutate: crearPreferenciaPago } = useCrearPreferenciaEventos({
    onSuccessCallback: handlePreferenciaSuccess,
    onErrorCallback: handlePreferenciaError
  });

  const handleCrearPreferenciaClick = () => {
    if (!event) {
      toast.error('No se encontró el evento para crear la preferencia de pago.');
      return;
    }

    // Validar formulario antes de crear la preferencia de pago
    const newErrors: { [key: string]: string } = {};

    if (!form_data.residencia) newErrors.residencia = 'Residencia es obligatoria';
    if (!form_data.rol) newErrors.rol = 'Rol institucional es obligatorio';
    if (form_data.rol === 'alumno') {
      if (!form_data.carrera) newErrors.carrera = 'Carrera es obligatoria';
      if (!form_data.anioCarrera) newErrors.anioCarrera = 'Año de carrera es obligatorio';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Completa todos los campos obligatorios antes de proceder al pago.');
      return;
    }

    setPaymentState(prev => ({ ...prev, isLoading: true }));

    // Incluir los datos del formulario en la preferencia de pago
    const paymentData = {
      ...event,
      form_data: form_data
    };
    console.log('OE PILAS ', paymentData);
    crearPreferenciaPago(paymentData);

  };


  const [estaInscrito, setEstaInscrito] = useState<boolean>(false);
  const [inscripcionEnProceso, setInscripcionEnProceso] = useState<boolean>(false);


  const seraInscritoComoSuplente = useMemo(() => {
    if (!event || !estadisticasState) return false;
    const sinCuposTitulares = (event.cupos_disponibles ?? 0) === 0;
    const haySuplentesDisponibles = (event.suplentes_disponibles ?? 0) > 0;
    return sinCuposTitulares && haySuplentesDisponibles && !estaInscrito;
  }, [event, estadisticasState, estaInscrito]);

  const [esSuplente, setEsSuplente] = useState<boolean>(false);
  const [ordenSuplente, setOrdenSuplente] = useState<number | null>(null);
  const [inscritoASubgrupo, setInscritoASubgrupo] = useState<string | null>(null)
  const rolUsuario = useAtomValue(userRolAtom);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Estados de pago
  const [paymentState, setPaymentState] = useState<{
    preferenceId: string | null;
    isLoading: boolean;
    completed: boolean;
    error: string | null;
  }>({
    preferenceId: null,
    isLoading: false,
    completed: false,
    error: null
  });

  // Estados del formulario
  const [form_data, setFormData] = useState<FormState>({
    residencia: '',
    rol: '',
    primeraVez: false,
    carrera: '',
    anioCarrera: '',
    nombreRemitente: '',
    subgrupo: ''
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Si se cambia residencia a "interno", forzar rol a "alumno"
    if (name === 'residencia' && value === 'interno') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        rol: 'alumno' // Forzar rol a alumno cuando es interno
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }

    // Limpiar error cuando el campo se modifica
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Inicializa Mercado Pago
  useEffect(() => {
    try {
      initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);
    } catch (error) {
      console.error('Error al inicializar Mercado Pago:', error);
      setPaymentState(prev => ({
        ...prev,
        error: 'Error al inicializar el sistema de pagos'
      }));
    }
  }, []);


  //mantener actualizados los datos de detalles
  useEffect(() => {
    if (!loadingDetalles && detalles && detalles.inscrito) {
      setEstaInscrito(true);
      setEsSuplente(detalles.esSuplente);
      setOrdenSuplente(detalles.ordenSuplente);
      setInscritoASubgrupo(detalles.subgrupo)
    } else {
      setEstaInscrito(false);
      setEsSuplente(false);
      setOrdenSuplente(null);
      setInscritoASubgrupo(null)
    }
  }, [detalles, loadingDetalles]);


  // Funcion de fronte q crea la preferencia de pago basado en el id del evento 
  //crearPreferenciaPago()


  // Verificación de autorización - DESPUÉS de todos los hooks
  if (rolUsuario !== null && rolUsuario > 6) {
    return <NoAutorizado />;
  }

  // Loading y error states
  if (loadingDetalles || loadingEvent || loadingEstadisticas) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoadingSpinner size="lg" message="Cargando detalles del evento..." />
    </div>
  );
  if (errorDetalles || errorEvent || errorEstadisticas) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ErrorState
        message={errorDetalles?.message || errorEstadisticas?.message || errorEvent?.message || 'Error al cargar el evento'}
        onRetry={() => window.location.reload()}
      />
    </div> 
  );
  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ErrorState
        message="Evento no encontrado"
        onRetry={() => navigate('/eventos')}
      />
    </div>
  );

  // Determinar si es admin o secretaria (no pueden inscribirse)
  const esAdminOSecretaria = rolUsuario === 1 || rolUsuario === 2 || rolUsuario === 4 || rolUsuario === 5;

  // Cálculos derivados del estado - DESPUÉS de verificar que event existe
  const fechaActual = new Date();
  const fechaLimite = event ? new Date(event.fecha_limite_inscripcion) : null;

  if (fechaLimite && fechaActual > fechaLimite) toast.error('La fecha límite de inscripción ya pasó.');
  const fechaLimiteVencida = fechaLimite ? fechaActual > fechaLimite : false;
  const sinCuposTitulares = (event.cupos_disponibles ?? 0) === 0;
  const haySuplentesDisponibles = (event.suplentes_disponibles ?? 0) > 0;

  // Redirigir SOLO si NO hay cupos titulares NI cupos de suplente Y el usuario no está inscrito
  // Y no está en proceso de inscripción (para evitar mostrar esta pantalla durante la transición)
  if (sinCuposTitulares && !haySuplentesDisponibles && !estaInscrito && !inscripcionEnProceso) {
    return (
      <>
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-red-800 mb-3">Sin Cupos Disponibles</h2>
            <p className="text-red-700 mb-2">
              Este evento ya no tiene cupos disponibles ni lugares en la lista de espera.
            </p>
            <p className="text-red-600 text-sm mb-6">
              Todas las plazas (titulares y suplentes) están completas.
            </p>
            <button
              onClick={() => navigate((rolUsuario ?? 0) <= 4 ? '/eventos-disponibles' : '/eventos')}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
            >
              Volver a Eventos
            </button>
          </div>
        </div>
      </>
    );
  }

  // Solo redirigir si la fecha venció Y el usuario no está inscrito Y no está procesando inscripción
  if (fechaLimiteVencida && !estaInscrito && !inscripcionEnProceso) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Inscripción Cerrada</h2>
          <p className="text-red-600 mb-4">
            La fecha límite de inscripción para este evento ya ha pasado.
          </p>
          <button
            onClick={() => navigate((rolUsuario ?? 0) <= 4 ? '/eventos-disponibles' : '/eventos')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Volver a Eventos
          </button>
        </div>
      </div>
    );
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    e.preventDefault();

    // For paid events, require payment to be completed before submitting
    if (event?.categoria === 'pago' && !paymentState.completed) {
      toast.error('Para eventos de pago, completa el pago antes de inscribirte.');
      return;
    }

    const newErrors: { [key: string]: string } = {};

    if (!form_data.residencia) newErrors.residencia = 'Residencia es obligatoria';
    if (!form_data.rol) newErrors.rol = 'Rol institucional es obligatorio';
    if (form_data.rol === 'alumno') {
      if (!form_data.carrera) newErrors.carrera = 'Carrera es obligatoria';
      if (!form_data.anioCarrera) newErrors.anioCarrera = 'Año de carrera es obligatorio';
    }

    if (Object.keys(newErrors).length > 0) return;

    try {
      // Marcar que la inscripción está en proceso para evitar re-renders con pantallas intermedias
      setInscripcionEnProceso(true);

      form_data.subgrupo && subgrupos ?
        //si es una inscripcion de subgrupos usamos el servicio de subgrupos para inscribir al usuario.
        await inscribirUsuarioSubgrupo({
          id_subgrupo: parseInt(form_data.subgrupo),
          payload:
          {
            eventoId: event?.id_evento,
            ...form_data,
            anioCarrera: form_data.anioCarrera ? Number(form_data.anioCarrera) : undefined,
          }
        })

        :
        //aca usamos el servicio de evento para inscribir al usuario. no se usan subgrupos.
        await inscribirUsuario({
          eventoId: event?.id_evento,
          ...form_data,
          anioCarrera: form_data.anioCarrera ? Number(form_data.anioCarrera) : undefined,
          nombreRemitente: event?.categoria === 'pago' ? form_data.nombreRemitente : undefined,
        });

      // Determinar si fue inscrito como suplente basándonos en la respuesta
      // Esto evita mostrar pantallas incorrectas mientras se recargan los datos
      const inscritoComoSuplente = form_data.subgrupo && subgrupos 
        ? false // Se determinará con el refetch de detalles
        : (event.cupos_disponibles ?? 0) === 0 && (event.suplentes_disponibles ?? 0) > 0;
      
      // Actualizar estados locales basándonos en la lógica de inscripción
      setEstaInscrito(true);
      setEsSuplente(inscritoComoSuplente);
      setInscripcionEnProceso(false);
      
      // Limpiar toasts previos y mostrar único toast de éxito
      toast.dismiss(); // Elimina cualquier toast anterior
      
      if (inscritoComoSuplente) {
        toast.success('¡Inscripción exitosa en la lista de espera!', {
          id: `inscripcion-${event.id_evento}`, // ID único para evitar duplicados
          description: 'En 5 segundos serás redirigido a Mis Eventos',
          duration: 5000
        });
      } else {
        toast.success('¡Inscripción exitosa como titular!', {
          id: `inscripcion-${event.id_evento}`, // ID único para evitar duplicados
          description: 'En 5 segundos serás redirigido a Mis Eventos',
          duration: 5000
        });
      }
      
      // Las queries se invalidarán y actualizarán los datos correctos automáticamente
      
      // Redirigir a "Mis Eventos" después de 5 segundos
      setTimeout(() => {
        navigate('/mis-eventos');
      }, 5000); // 5 segundos

    } catch (error: any) {
      // 6. ¡ERROR! La mutación falló.
      //    React Query pasa el error al 'catch'.
      setInscripcionEnProceso(false); // Restablecer el estado de proceso
      if (error.message?.includes('ya está inscrito')) {
        setEstaInscrito(true); // También es un "éxito" en cierto modo
        toast.warning('Ya estabas inscrito en este evento.');
      } else {
        toast.error('Ocurrió un error al inscribirse', { description: error?.message });
      }
    }
  };

  const handleDarDeBaja = async () => {
    toast.warning('¿Quieres darte de baja de este evento? Esta acción no se puede deshacer.', {
      action: {
        label: 'Darme de baja', onClick: () => {
          confirmarBaja()
        }
      },
      actionButtonStyle: { backgroundColor: 'red' }, cancel: { label: 'Cancelar', onClick: () => toast.success('Accion cancelada') }
    },)
  };

  const confirmarBaja = async () => {
    darDeBajaInscripcion(event.id_evento);

    // Actualizar estados locales
    if (!loadingBaja && successDarBaja) {
      setEstaInscrito(!dataBaja.success);
      setEsSuplente(!dataBaja.success);
      setOrdenSuplente(null);
    }

    // Navegar inmediatamente a Mis Eventos para evitar que el componente
    // re-render muestre pantallas intermedias (por ejemplo "Sin Cupos Disponibles")
    // mientras esperamos un timeout.
    navigate('/mis-eventos');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 overflow-visible">
      {/* Vista del evento */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{event.nombre}</h1>
        <p className="text-sm text-gray-500 mb-4">
          <strong>Fecha:</strong>{' '}
          {new Date(event.fecha).toLocaleDateString('es-AR')}
        </p>

        {event.categoria === 'pago' && (
          <p className="text-lg font-semibold mb-2">
            Costo de inscripción: ${event.costo}
          </p>
        )}

        <img
          src={evento1}
          alt={event.nombre}
          className="w-full h-64 object-cover rounded-lg shadow mb-4"
        />
        <p className="text-gray-700 leading-relaxed">
          <strong>Descripción:</strong>{' '}
          {event.descripcion}</p>
      </div>

      {/* Contenido condicional: Admin/Secretaria vs Usuario */}
      {esAdminOSecretaria ? (
        /* Vista para Administradores y Secretarias - Solo información, SIN inscripción */
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  {rolUsuario === 1 || rolUsuario === 2 ? '👤 Vista de Administrador' : '📋 Vista de Secretaría'}
                </h3>
                <p className="text-blue-700">
                  Estás viendo este evento en modo {rolUsuario === 1 || rolUsuario === 2 ? 'administrador' : 'secretaría'}.
                  No puedes inscribirte en eventos, pero puedes gestionar este evento desde la sección de Eventos en el menú lateral.
                </p>
              </div>
            </div>
          </div>

          {/* Información del evento para admin/secretaria */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Estadísticas del Evento</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Cupos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{event.cupos}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Cupos Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{event.cupos_disponibles ?? 0}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Cupos Suplentes</p>
                <p className="text-2xl font-bold text-yellow-600">{event.cupos_suplente || 0}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Suplentes Disponibles</p>
                <p className="text-2xl font-bold text-yellow-600">{event.suplentes_disponibles ?? 0}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Costo</p>
                <p className="text-2xl font-bold text-gray-900">${event.costo || 0}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-lg font-bold text-green-600">Vigente</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t space-y-3">
              <button
                onClick={() => navigate('/eventos')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Volver a Gestión de Eventos
              </button>
            </div>
          </div>
        </div>
      ) : estaInscrito ? (
        /* Vista cuando ya está inscrito - SOLO PARA USUARIOS */
        <div className="space-y-6">
          {esSuplente ? (
            /* Vista específica para suplentes */
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="bg-yellow-500 rounded-full p-2 mr-4 mt-1">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">📋 Estás inscrito como suplente
                    {detalles?.subgrupo && ` en el subgrupo ${inscritoASubgrupo}`}
                  </h3>
                  <div className="space-y-2 text-yellow-800">
                    <p className="flex items-center">
                      <span className="font-semibold mr-2">Tu posición en la lista de espera:</span>
                      <span className="bg-yellow-200 px-3 py-1 rounded-full font-bold text-lg">
                        #{ordenSuplente}
                      </span>
                    </p>
                    <p className="leading-relaxed mt-3">
                      <strong>Te avisaremos por email</strong> si se libera un cupo y pasas a ser titular.
                      Mantente atento a tu correo electrónico.
                    </p>
                    <p className="text-sm mt-2 text-yellow-700">
                      Mientras tanto, puedes darte de baja de la lista de espera si lo deseas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : esFechaBajaVencida(event.fecha_limite_baja.toString()) ? (
            /* Fecha de baja vencida - solo mostrar información */
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-purple-500 rounded-full p-1 mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-800">¡Te esperamos en el evento!</h3>
                  <p className="text-purple-600">Ya no es posible darse de baja. Nos vemos en el evento.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Aún puede darse de baja */
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-full p-1 mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">¡Ya estás inscrito!</h3>
                  <p className="text-green-600">Te has registrado exitosamente para este evento
                    {detalles?.subgrupo && ` en el subgrupo ${inscritoASubgrupo}`}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información detallada del evento - solo para titulares, no para suplentes */}
          {!esSuplente && (
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Información del Evento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Evento</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{event.nombre}</p>
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Evento</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">
                    {new Date(event.fecha).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{event.lugar}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite para darse de baja</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">
                    {new Date(event.fecha_limite_baja).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* {event.descripcion && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded leading-relaxed">{event.descripcion}</p>
                </div>
              )} */}
            </div>
          )}

          {/* Botón de dar de baja - solo si aún es posible o si es suplente */}
          {(esSuplente || !esFechaBajaVencida(event.fecha_limite_baja.toString())) && (
            <>
              <div className="flex justify-center">
                <button
                  onClick={handleDarDeBaja}
                  disabled={loadingBaja}
                  className="px-6 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingBaja
                    ? 'Dándose de baja...'
                    : esSuplente
                      ? 'Salir de la lista de espera'
                      : 'Darme de baja del evento'
                  }
                </button>
              </div>

              {/* Información adicional sobre la baja */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        {esSuplente ? (
                          `Puedes salir de la lista de espera hasta el ${new Date(event.fecha_limite_baja).toLocaleDateString('es-AR')}. Los suplentes que estén después de ti subirán automáticamente de posición.`
                        ) : (
                          `Puedes darte de baja hasta el ${new Date(event.fecha_limite_baja).toLocaleDateString('es-AR')}. Después de esta fecha no será posible cancelar la inscripción. Si te das de baja, el primer suplente en la lista pasará automáticamente a ser titular.`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Formulario de inscripción cuando no está inscrito */
        <>
          {/* Mensaje informativo si será inscrito como suplente */}
          {seraInscritoComoSuplente && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    📋 Inscripción en Lista de Espera
                  </h3>
                  <div className="text-yellow-700 space-y-2">
                    <p className="font-medium">
                      Los cupos titulares están completos, pero serás inscrito en la <strong>lista de espera como suplente</strong>.
                    </p>
                    <div className="bg-yellow-100 rounded-lg p-3 mt-3">
                      <p className="text-sm font-semibold mb-2">¿Cómo funciona?</p>
                      <ul className="text-sm space-y-1 ml-4 list-disc">
                        <li>Recibirás un email con tu <strong>posición en la lista de espera</strong></li>
                        <li>Si alguien se da de baja, <strong>automáticamente</strong> pasarás a ser titular</li>
                        <li>Te notificaremos por email si quedas como titular</li>
                        <li>Cuanto antes te inscribas, mejor posición tendrás (#{(estadisticasState?.suplentes_inscritos ?? 0) + 1})</li>
                      </ul>
                    </div>
                    <p className="text-sm mt-3">
                      <strong>Lugares disponibles en lista de espera:</strong> {event.suplentes_disponibles || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje informativo si hay cupos titulares */}
          {/* {!seraInscritoComoSuplente && !sinCuposTitulares && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Cupos disponibles:</strong> {event.cupos_disponibles} de {event.cupos}
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {/* FORMULARIO PARA LOS EVENTOS DE TIPO PAGO  */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Residencia */}
            <div>
              <label className="block mb-1">Residencia</label>
              <select
                name="residencia"
                value={form_data.residencia}
                onChange={handleFormChange}
                className="w-full border px-4 py-2 rounded"
              >
                <option value="">Seleccionar</option>
                <option value="interno">Interno</option>
                <option value="externo">Externo</option>
              </select>
              {errors.residencia && (
                <p className="text-red-600 text-sm mt-1">{errors.residencia}</p>
              )}
            </div>

            {/* Rol institucional */}
            <div>
              <label className="block mb-1">Rol institucional</label>
              <select
                name="rol"
                value={form_data.rol}
                onChange={handleFormChange}
                disabled={form_data.residencia === 'interno'}
                className={`w-full border px-4 py-2 rounded ${form_data.residencia === 'interno' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
              >
                <option value="">Seleccionar</option>
                <option value="alumno">Alumno</option>
                {form_data.residencia !== 'interno' && (
                  <>
                    <option value="no-alumno">No alumno</option>
                    <option value="personal">Personal</option>
                  </>
                )}
              </select>
              {form_data.residencia === 'interno' && (
                <p className="text-sm text-blue-600 mt-1">
                  ℹ️ Los residentes internos solo pueden registrarse como alumnos
                </p>
              )}
              {errors.rol && (
                <p className="text-red-600 text-sm mt-1">{errors.rol}</p>
              )}
            </div>

            {/* Primera vez */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="primeraVez"
                checked={form_data.primeraVez}
                onChange={handleFormChange}
                id="primeraVez"
              />
              <label htmlFor="primeraVez">¿Es tu primera vez en un evento del IM?</label>
            </div>

            {/* Carrera y año (solo si es alumno) */}
            {form_data.rol === 'alumno' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Carrera</label>
                  <input
                    type="text"
                    name="carrera"
                    value={form_data.carrera}
                    onChange={handleFormChange}
                    className="w-full border px-4 py-2 rounded"
                  />
                  {errors.carrera && (
                    <p className="text-red-600 text-sm mt-1">{errors.carrera}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1">Año</label>
                  <input
                    type="number"
                    name="anioCarrera"
                    min={1}
                    max={6}
                    value={form_data.anioCarrera}
                    onChange={handleFormChange}
                    className="w-full border px-4 py-2 rounded"
                  />
                  {errors.anioCarrera && (
                    <p className="text-red-600 text-sm mt-1">{errors.anioCarrera}</p>
                  )}
                </div>
              </div>
            )}

            {/* Elección de subgrupos */}
            {
              subgrupos?.length > 0 && event.categoria === 'salida' &&
              <>
                <div className="relative z-10 mb-8">
                  <label className="block mb-1">Subgrupos</label>
                  <select
                    name="subgrupo"
                    value={form_data.subgrupo}
                    onChange={handleFormChange}
                    className="w-full border px-4 py-2 rounded"
                    style={{ position: 'relative' }}
                  >
                    <option value="">Seleccionar</option>
                    {
                      subgrupos?.map((s: Subgrupo) =>
                        <option key={s.id_subgrupo} value={s.id_subgrupo}>{s.nombre}</option>
                      )
                    }
                  </select>
                </div>
              </>
            }

            {/* Campos extra si el evento es de pago */}
            {event.categoria === 'pago' && (
              <div>
                <label className="block mb-1">Pagar con Mercado Pago (Una vez hecho el pago, se te registrará en el evento automáticamente)</label>

                {!paymentState.preferenceId ? (
                  <button
                    type="button"
                    onClick={handleCrearPreferenciaClick}
                    disabled={paymentState.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {paymentState.isLoading ? 'Creando preferencia...' : 'Pagar el costo del evento'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div style={{ width: '300px' }}>
                      <Wallet initialization={{ preferenceId: paymentState.preferenceId }} />
                    </div>
                    <p className="text-sm text-gray-600">
                      {!paymentState.completed ? 'Completa el pago para continuar con la inscripción' : 'Pago completado. Puedes inscribirte ahora.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loadingInscripcion || loadingInscripcionSubgrupo}
                className={`px-6 py-2 text-white rounded-md shadow transition flex items-center justify-center gap-2 ${loadingInscripcion
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-700 hover:bg-red-800'
                  }`}
              >
                {loadingInscripcion || loadingInscripcionSubgrupo? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Procesando inscripción...</span>
                  </>
                ) : seraInscritoComoSuplente ? (
                  'Inscribirme en Lista de Espera'
                ) : (
                  'Inscribirme al Evento'
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
