import { useState } from "react";
import InputField from "../components/input";
import logo from "../assets/Logo-IM.png";
import countries from 'world-countries'
import { useRegister } from "../queries/listaQueries";
import { LoadingButton } from "../components/LoadingButton";
import { toast } from "sonner";

export default function Register() {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [nroAlumno, setNroAlumno] = useState("");
  const [password, setPassword] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [tipo_documento, setTipo_documento] = useState("");
  const [alumno, setAlumno] = useState(false);
  const { mutate, isPending } = useRegister()

  // Preparamos la lista con nombre, código y bandera
  const listaPaises = countries.map((c) => ({
    nombre: c.name.common,
    codigo: c.cca2,
    bandera: `https://flagcdn.com/w20/${c.cca2.toLowerCase()}.png`, // tamaño pequeño
  }));

  // Ordenamos alfabéticamente
  listaPaises.sort((a, b) => a.nombre.localeCompare(b.nombre));


  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación simple
    if (!email.trim() || !nombre.trim() || !apellido.trim() || !dni.trim() || !password.trim()) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Email inválido");
      return;
    }
    if (dni.length < 8 || dni.length >12) {
      toast.error("El DNI debe tener entre 8 y 12 dígitos");
      return;
    }
    if (nroAlumno && !/^\d{5}$/.test(nroAlumno)) {
      toast.error("El número de alumno debe tener 5 dígitos");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const numeroAlumno = parseInt(nroAlumno);

    mutate(
      {
        email,
        nombre,
        apellido,
        dni,
        numeroAlumno,
        contrasena: password,
        nacionalidad,
        tipo_documento
      }
    )
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-red-100">
        <div className="w-full px-4 md:px-0 max-w-2xl">
          <div className="flex flex-col items-center mb-4">
            <img src={logo} alt="Logo" className="w-24 h-24  drop-shadow-lg" />
          </div>
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col md:col-span-2">
              <label className="mb-2 text-base font-semibold text-black"></label>
              <InputField type="email" placeholder="E-mail" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-base font-semibold text-black"></label>
              <InputField type="text" placeholder="Nombre" value={nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-base font-semibold text-black"></label>
              <InputField type="text" placeholder="Apellido" value={apellido} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApellido(e.target.value)} />
            </div>
            <label className="block">
              <select
                value={nacionalidad}
                onChange={(e) => setNacionalidad(e.target.value)}
                className="mt-1 block w-full border rounded-sm p-2"
              >
                <option value=""> Nacionalidad</option>
                {listaPaises.map((pais) => (
                  <option key={pais.codigo} value={pais.codigo}>
                    {pais.nombre}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col">
              <select className="border rounded-sm p-2" value={tipo_documento} required onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTipo_documento(e.target.value)}>
                <option> Tipo de Documento</option>
                <option> Cedula </option>
                <option> Pasaporte </option>
                <option> DNI </option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-base font-semibold text-black"></label>
              <InputField type="text" placeholder="Documento de Identidad" value={dni} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDni(e.target.value)} maxLength={12} />
            </div>
            {alumno ?
              <div className="flex justify-baseline gap-2 items-center">
                <button className="border text-white bg-red-400 hover:bg-red-500 p-2 rounded-xl w-1/3 text-xs" onClick={() => setAlumno(!alumno)}>¿Eres alumno de la UAP?</button>
                <div className="w-2/3">
                  <label className="mb-2 text-base font-semibold text-black "></label>
                  <InputField type="text" placeholder="Numero de alumno" value={nroAlumno} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNroAlumno(e.target.value)} maxLength={5} />
                </div>
              </div>
              :
              <div className="flex justify-baseline gap-2 items-center" >
                <button className="border text-white bg-red-400 hover:bg-red-500 p-2 rounded-xl w-full" onClick={() => setAlumno(!alumno)}>¿Eres alumno de la UAP?</button>
              </div>
            }
            <div className="flex flex-col md:col-span-2">
              <label className="mb-2 text-base font-semibold text-black"></label>
              <InputField type="password" placeholder="Contraseña" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex flex-col items-center mt-6">
              {isPending ?
                <LoadingButton loading={true} loadingText="Cargando" children></LoadingButton>
                :
                <button type="submit" className="w-full md:col-span-2 bg-red-700 text-white py-3 rounded-xl font-bold text-xl shadow-lg hover:bg-red-800 transition-all duration-200">
                  Registrarse
                </button>
              }
              <div className="mt-4 text-sm text-center md:col-span-2">
                <a href="/login" className="text-red-600 hover:underline">Volver al login</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}