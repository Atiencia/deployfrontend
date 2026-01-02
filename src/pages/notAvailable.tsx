import { useLocation } from 'react-router-dom';

export default function NotAvailable() {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
      <p className="text-xl">
        La ruta "<span className="font-medium">{pathname}</span>" aún no está disponible o no tienes permiso para acceder a ella.
      </p>
    </div>
  );
}