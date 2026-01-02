// src/components/Sidebar.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UsersIcon,
  UserIcon,
  BanknotesIcon,
  CalendarIcon,
  NewspaperIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  ListBulletIcon,
  ArchiveBoxIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import menuIcon from "../assets/menu.png";
import closeIcon from "../assets/close (2).png";
import logo from "../assets/Logo-IM.png";
import { useAtomValue } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { obtenerMisGrupos } from "../Services/secretariaGrupoService";
import type { grupo } from "../../types/evento";

const navItems = [
  {
    to: "/grupos",
    label: "Grupos",
    icon: UsersIcon,
    hasSubmenu: true,
    submenu: [
      { to: "/grupos", label: "Lista Grupos", icon: ListBulletIcon },
      { to: "/crear-grupo", label: "Crear Grupo", icon: PlusIcon },
    ],
  },

  {
    to: "/eventos",
    label: "Eventos",
    icon: CalendarIcon,
    hasSubmenu: true,
    submenu: [
      { to: "/eventos", label: "Lista Eventos", icon: ListBulletIcon },
      { to: "/crear-evento", label: "Crear Evento", icon: PlusIcon },
      {
        to: "/eventos/transcurridos",
        label: "Eventos Transcurridos",
        icon: ArchiveBoxIcon,
      },
      {
        to: "/eventos/cancelados",
        label: "Eventos Cancelados",
        icon: ArchiveBoxIcon,
      },
    ],
  },

     { to: "/donaciones", 
      label: "Donaciones", 
      icon: BanknotesIcon,
      hasSubmenu: true,
      submenu: [
        { to: "/donaciones", label: "Lista Donaciones", icon: ListBulletIcon },
        { to: "/donadores", label: "Donantes fijos", icon: ListBulletIcon },
        { to: "/donaciones/donar", label: "Donar", icon: ListBulletIcon }
      ],
    },

  // 🔧 Noticias (ajustado dinámicamente según rol)
  {
    to: "/noticias",
    label: "Noticias",
    icon: NewspaperIcon,
    hasSubmenu: false, // se ajusta dinámicamente
    submenu: [
      { to: "/noticias/admin", label: "Listar Noticias", icon: ListBulletIcon },
      { to: "/noticias/crear", label: "Crear Noticia", icon: PlusIcon },
    ],
  },

  {
    to: "/admin",
    label: "Administración",
    icon: CogIcon,
    hasSubmenu: true,
    submenu: [
      { to: "/admin/gestion-roles", label: "Gestión de Roles", icon: UserIcon },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [gruposSubmenuOpen, setGruposSubmenuOpen] = useState(false);
  const [eventosSubmenuOpen, setEventosSubmenuOpen] = useState(false);
  const [donacionesSubmenuOpen, setDonacionessSubmenuOpen] = useState(false);
  const [administracionSubmenuOpen, setAdministracionSubmenuOpen] = useState(false);
  const [noticiasSubmenuOpen, setNoticiasSubmenuOpen] = useState(false);
  const userRole = useAtomValue(userRolAtom);
  const [grupoAsignado, setGrupoAsignado] = useState<grupo | null>(null);

  useEffect(() => {
    setMenuOpen(false);

    const isGruposPath = location.pathname.startsWith("/grupos");
    const isEventosPath =
      location.pathname.startsWith("/eventos") ||
      location.pathname.startsWith("/mis-eventos") ||
      location.pathname.startsWith("/crear-evento");
    const isDonacionesPath = location.pathname.startsWith("/donaciones");
    const isAdminPath = location.pathname.startsWith("/admin");
    const isNoticiasPath = location.pathname.startsWith("/noticias");

    setGruposSubmenuOpen(isGruposPath);
    setEventosSubmenuOpen(isEventosPath);
    setDonacionessSubmenuOpen(isDonacionesPath);

    const grupoAsignado = async () =>{
      const infoSecretaria = await obtenerMisGrupos(); 
      console.log(infoSecretaria.grupos[0])
      setGrupoAsignado(infoSecretaria.grupos[0]);
    } 
    
    if(userRole === 5) grupoAsignado()

    setAdministracionSubmenuOpen(isAdminPath);
    setNoticiasSubmenuOpen(isNoticiasPath);

    // const grupoAsignado = async () => {
    
    //   const infoSecretaria = await obtenerMisGrupos();
    //   setGrupoAsignado(infoSecretaria.grupos[0]);
    // };

    //grupoAsignado();
  }, [location.pathname]);

  return (
    <>
      {/* Botón móvil */}
      <button
        aria-label="Abrir menú"
        className="md:hidden fixed top-4 left-4 z-60 p-2 bg-white rounded-lg shadow"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <img src={menuOpen ? closeIcon : menuIcon} alt="menu" className="h-8 w-8" />
      </button>

      {/* Overlay móvil */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside
        role="navigation"
        className={`fixed top-0 left-0 h-screen w-64 md:w-56 bg-white border-r border-gray-200
          transform transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 z-50 md:z-10 shadow-lg flex flex-col`}
      >
        <div className="px-6 pt-6 pb-4 text-center">
          <button
            onClick={() => {
              navigate("/home");
              setMenuOpen(false);
            }}
            className="focus:outline-none"
            aria-label="Ir al Home"
          >
            <img
              src={logo}
              alt="Logo Instituto Misionero"
              className="h-12 md:h-16 mx-auto mb-2 cursor-pointer transition-transform hover:scale-105"
            />
          </button>
          <span className="font-bold text-lg text-red-700 block">Instituto Misionero</span>
        </div>

        <nav className="px-4 flex-1 overflow-y-auto pb-6">
          <div className="flex flex-col gap-2 text-gray-700 text-base font-semibold">
            {navItems
              .filter((item) => {
                // Filtro para usuarios no logueados (viewer)
                if (!userRole || userRole === null || userRole === undefined) {
                  // Solo mostrar Grupos, Eventos y Donaciones 
                  return item.to === "/grupos" || item.to === "/eventos" || item.to === "/donaciones";
                }
                
                if (item.to === "/admin") {
                  return userRole === 1 || userRole === 2;
                }
                return true;
              })
              .map((item) => {
                const { to, icon: Icon } = item;
                let { label, submenu } = item;
                let hasSubmenu = item.hasSubmenu;

              
                if (to === "/noticias") {
                  if (!userRole || userRole === null || userRole === undefined) {
                    // Usuario no logueado: sin submenú, va directo a /noticias
                    hasSubmenu = false;
                  } else if (userRole === 2 || userRole === 4) {
                    hasSubmenu = true;
                  } else if (userRole === 3 || userRole === 5) {
                    hasSubmenu = false;
                  } else {
                    return null;
                  }
                }

                // Ajustes para secretaria grupal (rol 5)
                if (userRole === 5 && to === "/grupos") {
                  label = "Mi Grupo";
                  submenu = [
                    {
                      to: `/integrantes/${grupoAsignado?.id_grupo}`,
                      label: "Integrantes",
                      icon: ListBulletIcon,
                    },
                  ];
                }
                // Items del submenú
                let itemsToShow = submenu!;
                
                // Modificar menú según el rol y la sección
                if (!userRole || userRole === null || userRole === undefined) { // Usuario no logueado (viewer)
                  // Desactivar submenús para usuarios no registrados
                  if (to === "/grupos" || to === "/eventos" || to === "/donaciones") {
                    hasSubmenu = false;
                  }
                } else if (userRole === 3) { // Usuario normal
                  if (to === "/grupos") {
                    itemsToShow = [
                      { to: "/grupos", label: "Lista Grupos", icon: ListBulletIcon },
                    ];
                  } else if (to === "/eventos") {
                    itemsToShow = [
                      { to: "/eventos-disponibles", label: "Eventos", icon: ListBulletIcon },
                      { to: "/mis-eventos", label: "Mis Eventos", icon: UserIcon },
                    ];
                  } else if (to === "/donaciones") {
                    itemsToShow = [
                      { to: "/donaciones/donar", label: "Donar", icon: PlusIcon },
                      { to: "/donaciones/mis-donaciones", label: "Mis Donaciones", icon: ListBulletIcon },
                    ];
                  }
                } else if ((userRole === 1 || userRole === 2 || userRole === 4 || userRole === 5) && to === "/donaciones") {
                  // Admin y secretarias solo ven Lista Donaciones y Lista Donadores (SIN Donar)
                  itemsToShow = [
                    { to: "/donaciones", label: "Lista Donaciones", icon: ListBulletIcon },
                    { to: "/donadores", label: "Donantes fijos", icon: ListBulletIcon }
                  ];
                }

                if (hasSubmenu) {
                  const isGrupos = to === "/grupos";
                  const isEventos = to === "/eventos";
                  const isDonaciones = to === "/donaciones";
                  const isAdministracion = to === "/admin";
                  const isNoticias = to === "/noticias";

                  let open;
                  let toggle;

                  if (isGrupos) {
                    open = gruposSubmenuOpen;
                    toggle = () => {
                      setGruposSubmenuOpen(!gruposSubmenuOpen);
                      setEventosSubmenuOpen(false);
                      setDonacionessSubmenuOpen(false);
                      setAdministracionSubmenuOpen(false);
                      setNoticiasSubmenuOpen(false);
                    };
                  } else if (isEventos) {
                    open = eventosSubmenuOpen;
                    toggle = () => {
                      setEventosSubmenuOpen(!eventosSubmenuOpen);
                      setGruposSubmenuOpen(false);
                      setDonacionessSubmenuOpen(false);
                      setAdministracionSubmenuOpen(false);
                      setNoticiasSubmenuOpen(false);
                    };
                  } else if (isDonaciones) {
                    open = donacionesSubmenuOpen;
                    toggle = () => {
                      setDonacionessSubmenuOpen(!donacionesSubmenuOpen);
                      setGruposSubmenuOpen(false);
                      setEventosSubmenuOpen(false);
                      setAdministracionSubmenuOpen(false);
                      setNoticiasSubmenuOpen(false);
                    };
                  } else if (isAdministracion) {
                    open = administracionSubmenuOpen;
                    toggle = () => {
                      setAdministracionSubmenuOpen(!administracionSubmenuOpen);
                      setGruposSubmenuOpen(false);
                      setEventosSubmenuOpen(false);
                      setDonacionessSubmenuOpen(false);
                      setNoticiasSubmenuOpen(false);
                    };
                  } else if (isNoticias) {
                    open = noticiasSubmenuOpen;
                    toggle = () => {
                      setNoticiasSubmenuOpen(!noticiasSubmenuOpen);
                      setGruposSubmenuOpen(false);
                      setEventosSubmenuOpen(false);
                      setDonacionessSubmenuOpen(false);
                      setAdministracionSubmenuOpen(false);
                    };
                  }

                  return (
                    <div key={to}>
                      <button
                        onClick={toggle}
                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded transition ${
                          location.pathname.startsWith(to)
                            ? "bg-red-100 text-red-700"
                            : "hover:bg-red-50 hover:text-red-700"
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="w-5 h-5" />
                          <span className="ml-3">{label}</span>
                        </div>
                        {open ? (
                          <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )}
                      </button>

                      {open && itemsToShow.length > 0 && (
                        <div className="ml-6 mt-1 flex flex-col gap-1">
                          {itemsToShow.map((subItem) => (
                            <button
                              key={subItem.to}
                              onClick={() => navigate(subItem.to)}
                              className={`w-full text-left flex items-center px-3 py-2 rounded text-sm transition ${
                                location.pathname === subItem.to
                                  ? "bg-red-100 text-red-700"
                                  : "hover:bg-red-50 hover:text-red-600"
                              }`}
                            >
                              <subItem.icon className="w-4 h-4" />
                              <span className="ml-2">{subItem.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Botones sin submenú
                let targetPath = to;
                // Para usuarios no registrados, redirigir Donaciones a /donaciones/donar
                if ((!userRole || userRole === null || userRole === undefined) && to === "/donaciones") {
                  targetPath = "/donaciones/donar";
                }

                return (
                  <button
                    key={to}
                    onClick={() => navigate(targetPath)}
                    className={`w-full text-left flex items-center px-3 py-2 rounded transition ${
                      location.pathname === targetPath
                        ? "bg-red-100 text-red-700"
                        : "hover:bg-red-50 hover:text-red-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="ml-3">{label}</span>
                  </button>
                );
              })}
          </div>
        </nav>
      </aside>
    </>
  );
}
