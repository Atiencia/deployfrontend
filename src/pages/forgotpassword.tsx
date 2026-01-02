import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputField from "../components/input";
import logo from "../assets/Logo-IM.png"

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("El email es obligatorio");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    // Aquí iría el fetch al backend para enviar el enlace
    toast.success("Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.");
    setEmail("");
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-red-100">
        <div className="w-100 px-4 md:px-0 max-w-2xl">
          <div className="flex flex-col items-center mb-4">
            <img src={logo} alt="Logo" className="w-24 h-24 drop-shadow-lg" />
          </div>
          <form onSubmit={handleForgotPassword} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col md:col-span-2">
              <label className="mb-2 text-base font-semibold text-black"></label>
              <InputField type="email" placeholder="EMAIL" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex flex-col items-center mt-4">
              <button type="submit" className="w-full md:full bg-red-700 text-white py-2 rounded-xl font-bold text-xl shadow-lg hover:bg-red-800 transition-all duration-200">
                Enviar enlace
              </button>
            </div>
          </form>
          <div className="mt-4 text-sm text-center md:col-span-2">
            <a href="/login" className="text-red-600 hover:underline">Volver al login</a>
          </div>
        </div>
      </div>
    </>
  );
}
