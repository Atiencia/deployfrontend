import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { toast } from 'sonner';

export default function PagoExitoDonacion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Capturar parámetros de Mercado Pago
    const payment_id = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const external_reference = searchParams.get('external_reference');
    const merchant_order_id = searchParams.get('merchant_order_id');

    console.log('Parámetros de Mercado Pago:', { payment_id, status, external_reference, merchant_order_id });

      // Si hay un payment_id y el pago está aprobado, mostrar éxito directamente
      if (payment_id && status === 'approved') {
        toast.success('¡Donación registrada exitosamente!');
        setIsProcessing(false);
    } else if (status && status !== 'approved') {
      console.error('El pago no fue aprobado:', status);
      toast.error('El pago no fue aprobado');
      setIsProcessing(false);
      setTimeout(() => navigate('/donaciones'), 3000);
    } else {
      // Si no hay parámetros, asumir que ya fue procesado
      setIsProcessing(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isProcessing) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            navigate('/donaciones/mis-donaciones');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [navigate, isProcessing]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          {isProcessing ? (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Procesando tu donación...</h2>
                <p className="text-gray-600">Estamos registrando tu pago en nuestra base de datos.</p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago acreditado!</h2>
                <p className="text-gray-600">Tu donación ha sido procesada exitosamente.</p>
              </div>

              {/* Loading button in bottom right */}
              <div className="fixed bottom-4 right-4">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>En {countdown} segundos te llevaremos a tus donaciones</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
