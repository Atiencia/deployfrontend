import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaEnvelope, FaClock } from 'react-icons/fa';

const VerificarEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<'verificando' | 'exitoso' | 'error' | 'expirado'>('verificando');
  const [mensaje, setMensaje] = useState('');
  const [email, setEmail] = useState('');
  const [enviandoNuevo, setEnviandoNuevo] = useState(false);
  const [yaVerificado, setYaVerificado] = useState(false);

  useEffect(() => {
    // Evitar verificar múltiples veces
    if (yaVerificado) return;

    const token = searchParams.get('token');
    
    if (!token) {
      setEstado('error');
      setMensaje('Token de verificación no encontrado');
      return;
    }

    setYaVerificado(true);
    verificarToken(token);
  }, [searchParams, yaVerificado]);

  const verificarToken = async (token: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/auth/verificar-email?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEstado('exitoso');
        setMensaje(data.message);
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else if (response.status === 410 && data.tokenExpirado) {
        setEstado('expirado');
        setMensaje(data.message);
      } else {
        setEstado('error');
        setMensaje(data.message || 'Error al verificar el correo electrónico');
      }
    } catch (error) {
      console.error('Error al verificar email:', error);
      setEstado('error');
      setMensaje('Error de conexión. Por favor, intenta nuevamente.');
    }
  };

  const reenviarVerificacion = async () => {
    if (!email) {
      alert('Por favor, ingresa tu correo electrónico');
      return;
    }

    setEnviandoNuevo(true);

    try {
      const response = await fetch(
        'http://localhost:5000/auth/reenviar-verificacion',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setEmail('');
      } else {
        alert(data.message || 'Error al reenviar el correo');
      }
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      alert('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setEnviandoNuevo(false);
    }
  };

  const renderContenido = () => {
    switch (estado) {
      case 'verificando':
        return (
          <div className="text-center">
            <FaSpinner className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verificando tu correo electrónico...
            </h2>
            <p className="text-gray-600">
              Por favor, espera un momento mientras validamos tu cuenta.
            </p>
          </div>
        );

      case 'exitoso':
        return (
          <div className="text-center">
            <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Verificación exitosa!
            </h2>
            <p className="text-gray-600 mb-4">{mensaje}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                Serás redirigido al inicio de sesión en unos segundos...
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir al inicio de sesión ahora
            </button>
          </div>
        );

      case 'expirado':
        return (
          <div className="text-center">
            <FaClock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Token expirado
            </h2>
            <p className="text-gray-600 mb-4">{mensaje}</p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800 mb-4">
                Ingresa tu correo electrónico para recibir un nuevo enlace de verificación:
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={reenviarVerificacion}
                  disabled={enviandoNuevo}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {enviandoNuevo ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="w-4 h-4" />
                      Reenviar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error en la verificación
            </h2>
            <p className="text-gray-600 mb-4">{mensaje}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 mb-4">
                ¿Necesitas un nuevo enlace de verificación?
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={reenviarVerificacion}
                  disabled={enviandoNuevo}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {enviandoNuevo ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="w-4 h-4" />
                      Reenviar
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Volver al inicio
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {renderContenido()}
      </div>
    </div>
  );
};

export default VerificarEmail;
