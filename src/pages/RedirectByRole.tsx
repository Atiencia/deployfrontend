// src/pages/RedirectByRole.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingComponents";

export default function RedirectByRole() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simplemente redirigir al /home que ya maneja la lógica de roles correctamente
    navigate("/home");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoadingSpinner size="lg" message="Redirigiendo..." />
    </div>
  );
}