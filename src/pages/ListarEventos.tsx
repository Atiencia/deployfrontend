import { useState } from "react";
import box from "../assets/box.png";
import menu from "../assets/menu.png";
import close from "../assets/close.png";
import logo from "../assets/Logo-IM.png";
import jabes from "../assets/jabes.jpeg";

function ItemMenu({ item }: { item: string }) {
  return (
    <li>
      <a
        href={`/${item.toLowerCase()}`}
        className="flex items-center flex-col text-sm p-2 hover:bg-red-50 rounded-xl"
      >
        <img className="h-7" src={box} alt="" />
        <p>{item}</p>
      </a>
    </li>
  );
}

export default function ListarEventos() {
  const [isOpen, setIsOpen] = useState(false);
  const [evento, setEvento] = useState("");
  const [grupo, setGrupo] = useState("");

  // Opciones de ejemplo
  const eventos = ["salidas", "retiro", "campamento"];
  const grupos = ["Sonrisitas", "JABES", "Huellas"];
  const itemsMenu = ["Grupos", "Salidas", "Eventos", "Noticias"];

  return (
    <div className="flex min-h-screen ">
      {/* Botón menú */}
      <button
        className="p-3 md:hidden fixed top-4 left-3 z-50 "
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <img src={close} alt="cerrar" className="h-6 w-6" />
        ) : (
          <img src={menu} alt="menu" className="h-8 w-8" />
        )}
      </button>

      {/* Barra lateral */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-48 bg-red-100 shadow-lg transform
          transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-35
        `}
      >
        <ul className="mt-6 space-y-6 flex flex-col items-center">
          <li className="flex items-center flex-col text-sm p-6 rounded-xl">
            <img src={logo} alt="logo" className="h-10" />
          </li>
          {itemsMenu.map((i) => (
            <ItemMenu key={i} item={i} />
          ))}
        </ul>
      </div>

      {/* Contenido principal - Añadido margen superior para móviles */}
      <div className="flex-1 p-6 md:p-12 mt-16 md:mt-0">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bold text-4xl mb-8">Lista - Evento</h2>
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-bold text-2xl">JABES - 4</h3>
            <img src={jabes} alt="logo grupo" className="h-16 w-16 rounded-full" />
          </div>
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <label className="font-bold mb-2 block text-lg">Eventos</label>
              <select
                value={evento}
                onChange={e => setEvento(e.target.value)}
                className="border rounded-md p-2 w-full text-lg shadow"
              >
                <option value="">salidas</option>
                {eventos.map(ev => (
                  <option key={ev} value={ev}>{ev}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="font-bold mb-2 block text-lg">Grupos</label>
              <select
                value={grupo}
                onChange={e => setGrupo(e.target.value)}
                className="border rounded-md p-2 w-full text-lg shadow"
              >
                <option value="">Sonrisitas</option>
                {grupos.map(gr => (
                  <option key={gr} value={gr}>{gr}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-32">
            <button className="bg-red-800 text-white px-10 py-3 rounded-md font-bold hover:bg-red-900 text-lg shadow">
              Generar lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}