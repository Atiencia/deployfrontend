import type { grupo } from "../../../types/evento";

// src/components/GrupoCard.tsx
interface GrupoCardProps {
  grupo: grupo;
  onClick?: () => void;
}

export default function GrupoCard({ grupo, onClick }: GrupoCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-red-100"
    >
      {/* Contenedor de la imagen */}
      <div className="relative h-16 w-16 mb-3">
        <img
          src={grupo.imagen_url}
          alt={grupo.nombre}
          className="h-full w-full rounded-full object-cover shadow-sm ring-4 ring-red-50 group-hover:ring-red-100 transition-all"
        />
      </div>

      <p className="text-sm font-bold text-gray-700 text-center group-hover:text-red-600 transition-colors">
        {grupo.nombre}
      </p>
    </div>
  );
}