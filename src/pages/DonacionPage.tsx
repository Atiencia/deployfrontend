import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import Sidebar from '../components/Sidebar';
import { useCrearPreferenciaDonacion } from '../queries/donacionesQueries';
import { toast } from 'sonner';
import { LoadingButton } from '../components/LoadingButton'; // Reusar tu LoadingButton
import { obtenerGrupos } from '../Services/grupoService';
import type { grupo } from '../../types/evento';


// Inicializar Mercado Pago con tu Public Key
initMercadoPago('APP_USR-cf2f1faa-af6d-48d0-969b-5e3f9c77d2b3');

export default function DonacionPage() {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('Donación voluntaria');
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  // const [donationComplete, setDonationComplete] = useState(false);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [grupos, setGrupos] = useState<grupo[]>([]);
  const [idGrupo, setIdGrupo] = useState<number | undefined>(undefined);

  // Fetch groups on component mount
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const gruposData = await obtenerGrupos();
        setGrupos(gruposData);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Error al cargar los grupos');
      }
    };
    fetchGrupos();
  }, []);

  // Autocompletar campos si el usuario está logueado
  useEffect(() => {
    const userRol = localStorage.getItem('userRol');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    // Si el usuario está autenticado (rol > 0), autocompletar los campos
    if (userRol && parseInt(userRol) > 0) {
      if (userName) {
        setNombre(userName);
      }
      if (userEmail) {
        setEmail(userEmail);
      }
    }
  }, []);

  // Check if user is authenticated
  //const isAuthenticated = localStorage.getItem('userRol') && parseInt(localStorage.getItem('userRol')!) > 0;
  const { mutate: crearPreferencia, isPending: isLoading } = useCrearPreferenciaDonacion(
    {
      onSuccess: (data: any) => {
        setPreferenceId(data.preferenceId);
        toast.success('Preferencia de donación creada');
      },
      onError: (error: any) => {
        toast.error('No se pudo crear la preferencia', { description: error.message })
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!monto || parseFloat(monto) <= 0) {
      toast.error('Por favor ingrese un monto válido');
      return;
    }

    if (!email || !nombre) {
      toast.error('Por favor ingrese su email y nombre');
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingrese un correo electrónico válido');
      return;
    }

    crearPreferencia({ monto, descripcion, id_grupo: idGrupo, email, nombre })
  };


  return (
    // Fondo gris claro
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      {/* Padding general */}
      <div className="flex-1 pt-20 md:pt-10 px-4 md:px-10 pb-6 md:pb-10 md:ml-56">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
              Realizar Donación
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Tu aporte hace posible nuestra misión. Gracias por tu generosidad.
            </p>
          </div>

          {/* Contenedor del formulario */}
          <div className="bg-white p-4 md:p-8 lg:p-10 rounded-xl shadow-lg border border-gray-200">
          {!preferenceId ? (
            // Formulario con 'space-y-6'
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Monto */}
              <div>
                <label htmlFor="monto" className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                  Monto de la donación ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">$</span>
                  <input
                    id="monto"
                    name="monto"
                    type="number"
                    value={monto}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonto(e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg shadow-sm text-base md:text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Información del destinatario (estilo caja azul de CrearEvento) */}
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3 md:p-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs md:text-sm">
                    <p className="font-semibold text-blue-900 mb-1 md:mb-2">Información del destinatario:</p>
                    <div className="space-y-0.5 md:space-y-1 text-blue-800">
                      <p><span className="font-medium">Nombre:</span> Secretaría General - Instituto Misionero</p>
                      <p><span className="font-medium">Entidad:</span> Mercado Pago</p>
                      <p><span className="font-medium">Tipo de cuenta:</span> Cuenta Institucional</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={descripcion}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescripcion(e.target.value)}
                  rows={4}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg shadow-sm resize-y focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm md:text-base"
                  placeholder="Comparte un mensaje con tu donación (opcional)..."
                />
              </div>

              {/* Grupo (opcional) */}
              <div>
                <label htmlFor="idGrupo" className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                  Grupo al que donar (opcional)
                </label>
                <select
                  id="idGrupo"
                  name="idGrupo"
                  value={idGrupo || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIdGrupo(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm md:text-base"
                >
                  <option value="">Seleccionar grupo (opcional)</option>
                  {grupos.map((grupo) => (
                    <option key={grupo.id_grupo} value={grupo.id_grupo}>
                      {grupo.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Si seleccionas un grupo, tu donación será destinada específicamente a ese grupo, caso contrario, será destinado al Instituto Misionero
                </p>
              </div>

              {/* {!isAuthenticated && ( */}

                <>
                  <div className="pt-4 border-t-2 border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      Para continuar, por favor proporciona tu información de contacto:
                    </p>
                  </div>
                  <div>
                    <label htmlFor="nombre" className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                      Nombre completo
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      value={nombre}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                      placeholder="Ingresa tu nombre"
                      className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm md:text-base"
                    />
                  </div>
                </>
              {/* )} */}

              <div className="flex justify-center pt-2 md:pt-4">
                <LoadingButton
                  type="submit"
                  className="w-full sm:w-auto px-6 md:px-10 py-3 md:py-4 bg-red-700 text-white text-base md:text-lg font-bold rounded-lg shadow-lg hover:bg-red-800 hover:shadow-xl disabled:bg-red-400 transition-all transform hover:scale-105"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Proceder al pago
                </LoadingButton>
              </div>
            </form>
          ) : (
            // --- Vista de Wallet/QR ---
            <div className="text-center space-y-4 md:space-y-6">
              <div className="bg-green-50 p-4 md:p-6 rounded-lg border border-green-200">
                <h2 className="text-lg md:text-xl font-semibold text-green-800 mb-2">
                  Donación preparada
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Monto: <span className="font-bold">${parseFloat(monto).toFixed(2)}</span>
                </p>
                <p className="text-gray-600">
                  Descripción: {descripcion}
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <Wallet
                    initialization={{ preferenceId: preferenceId! }}
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
                {paymentCompleted ? (
                  <p className="text-green-700 font-semibold">Pago completado y donación registrada.</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Una vez completado el pago, la donación será registrada.
                  </p>
                )}
                <button
                  onClick={() => {
                    setPreferenceId(null);
                    setPaymentCompleted(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  Cancelar y cambiar monto
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
