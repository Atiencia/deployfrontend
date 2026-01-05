import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { LoadingSpinner } from "../components/LoadingComponents";
import PinIcon from "../components/icons/PinIcon";
import NoticiaDetalleModal from "../components/NoticiasDetalleModal";
import { API_BASE_URL } from '../config/api';
import user from "../assets/avatar.png"
import donacion from "../assets/charity.png"
// import directivaIM from "../assets/directiva.im.JPG" // Imagen problemática - usar fetch desde backend
import grupoIM from "../assets/grupo-im.jpeg"
import biblia from "../assets/biblia.jpeg.jpg"
import ensenanza from "../assets/ensenanza.jpeg.jpg"
import mayores from "../assets/mayores.jpeg.jpg"
import alimentos from "../assets/alimentos.jpeg.jpg"
import salud from "../assets/salud.jpeg.jpg"
import amor from "../assets/amor.jpeg.jpg"
import { useLogout } from "../queries/listaQueries";
import { LoadingButton } from "../components/LoadingButton";
import { useNoticias } from "../queries/noticiasQueries";


type Noticia = {
  id_noticia: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagen_path?: string | null;
  autor_id?: number;
  grupo_id?: number | null;
  fijada?: boolean;
  fijada_hasta?: string | null; // <-- añadido
};

interface ParticiparProps {
  onClose: () => void;
}

const Participar = ({ onClose }: ParticiparProps) => {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">Únete a la Misión</h2>
        <p className="text-gray-600 mb-8">Elige cómo quieres ser parte del cambio</p>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate("/login")}
            className="flex flex-col items-center p-6 bg-gray-50 border-2 border-gray-200 rounded-lg transition-all hover:border-red-700 hover:bg-red-50"
          >
            <img src={user} alt="Ser miembro" width={48} className="mb-3" />
            <span className="font-bold text-gray-900">Ser Miembro</span>
            <span className="text-sm text-gray-600 mt-1">Únete al equipo</span>
          </button>
          <button
            onClick={() => navigate("/donaciones/donar")}
            className="flex flex-col items-center p-6 bg-gray-50 border-2 border-gray-200 rounded-lg transition-all hover:border-red-700 hover:bg-red-50"
          >
            <img src={donacion} alt="Donar" width={48} className="mb-3" />
            <span className="font-bold text-gray-900">Donar</span>
            <span className="text-sm text-gray-600 mt-1">Apoya la misión</span>
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// NUEVO: Lightbox para mostrar imagen ampliada
interface ImageLightboxProps {
  src: string;
  onClose: () => void;
}

const ImageLightbox = ({ src, onClose }: ImageLightboxProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100] p-4"
      onClick={onClose}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-auto max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="sticky top-4 float-right mr-4 mt-4 text-gray-600 hover:text-gray-900 text-3xl font-bold z-[110] transition-colors bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
          aria-label="Cerrar imagen"
        >
          &times;
        </button>

        <div className="p-6 pt-2">
          <img
            src={src}
            alt="Vista ampliada"
            className="w-full h-auto max-h-[65vh] object-contain rounded-lg"
          />
        </div>
        </div>
      </div>
    
  );
}

export default function ViewerHome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [mostrarParticipacion, setMostrarParticipacion] = useState(false);
  const [showVerMas, setShowVerMas] = useState(false);
  const Logout = useLogout();

  const {data : noticias, isLoading} = useNoticias()



  // NUEVO: estado para lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Add new state for modal
  const [selectedNoticiaId, setSelectedNoticiaId] = useState<number | null>(null);

  // Add handler functions for modal
  const handleNoticiaClick = (id: number) => {
    setSelectedNoticiaId(id);
  };

  const handleCloseModal = () => {
    setSelectedNoticiaId(null);
  };

  useEffect(() => {
    const nombreGuardado = localStorage.getItem("userName");
    if (nombreGuardado) setUserName(nombreGuardado);
  }, []);

  // Scroll-to-Info handler
  function handleScrollToInfo() {
    const el = document.getElementById("info-section");
    if (!el) {
      navigate("/Info");
      return;
    }

    const nav = document.getElementById("main-nav");
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    const start = window.pageYOffset;
    const targetY = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 24;
    const distance = targetY - start;

    const duration = 800;
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let startTime: number | null = null;

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, start + distance * eased);

      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        (el as HTMLElement).setAttribute("tabindex", "-1");
        (el as HTMLElement).focus({ preventScroll: true });
        setTimeout(() => (el as HTMLElement).removeAttribute("tabindex"), 800);
      }
    }

    requestAnimationFrame(step);
  }

  // Scroll-to-Contact handler
  function handleScrollToContact() {
    const el = document.getElementById("contact-section");
    if (!el) return;

    const nav = document.getElementById("main-nav");
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    const start = window.pageYOffset;
    const targetY = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 24;
    const distance = targetY - start;

    const duration = 800;
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let startTime: number | null = null;

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, start + distance * eased);

      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        (el as HTMLElement).setAttribute("tabindex", "-1");
        (el as HTMLElement).focus({ preventScroll: true });
        setTimeout(() => (el as HTMLElement).removeAttribute("tabindex"), 800);
      }
    }

    requestAnimationFrame(step);
  }

  function InfoInline() {
    return (
      <>
        <section id="info-section" className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-red-50">
          <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 mb-16 md:mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-semibold text-red-700 mb-4">
                  El ejemplo de los primeros cristianos
                </h3>
                <p className="text-gray-700 text-lg mb-4">
                  Los primeros discípulos entendieron que la misión era un estilo de vida. Iban juntos, apoyándose, sirviendo y compartiendo. Hoy podemos revivir ese espíritu de servicio.
                </p>
                <blockquote className="text-gray-700 italic border-l-4 border-red-200 pl-4">
                  “Y compartían lo que tenían, ayudando a todos según la necesidad de cada uno.”
                  <span className="block mt-1 font-semibold text-gray-800">— Hechos 2:42,45</span>
                </blockquote>
              </div>

              <div className="flex justify-center items-center bg-white p-4 rounded-xl shadow-xl border border-red-100 h-full overflow-hidden">
                <img
                  src="/src/assets/directiva.im.JPG"
                  alt="Primeros cristianos compartiendo"
                  className="w-full h-auto object-cover rounded-lg cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => setLightboxImage("/src/assets/directiva.im.JPG")}
                />
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 mb-16 md:mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-gradient-to-br from-red-50 to-white p-6 rounded-xl shadow-xl border border-red-100">
                <img src={biblia} alt="Estudios bíblicos" className="w-full h-32 object-cover rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer" onClick={() => setLightboxImage(biblia)} />
                <img src={ensenanza} alt="Enseñanza a niños" className="w-full h-32 object-cover rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer" onClick={() => setLightboxImage(ensenanza)} />
                <img src={mayores} alt="Acompañar a mayores" className="w-full h-32 object-cover rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer" onClick={() => setLightboxImage(mayores)} />
                <img src={alimentos} alt="Distribución de alimentos" className="w-full h-32 object-cover rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer" onClick={() => setLightboxImage(alimentos)} />
                <img src={salud} alt="Programas de salud" className="w-full h-32 object-cover rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer" onClick={() => setLightboxImage(salud)} />
                <img src={amor} alt="Amor y servicio" className="w-full h-32 object-cover rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer" onClick={() => setLightboxImage(amor)} />
              </div>

              <div>
                <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                  Educar, servir, amar: nuestra misión integral
                </h3>
                <p className="text-gray-700 text-lg mb-6">
                  Creemos que servir es actuar. Formamos y enviamos grupos comprometidos que:
                </p>
                <ul className="space-y-3 text-gray-700 font-medium">
                  <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-50 shadow-sm">
                    <span className="text-red-600 font-bold">›</span>
                    <span>Ofrecen estudios bíblicos en hogares y comunidades.</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-50 shadow-sm">
                    <span className="text-red-600 font-bold">›</span>
                    <span>Enseñan a los niños valores, educación y hábitos saludables.</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-50 shadow-sm">
                    <span className="text-red-600 font-bold">›</span>
                    <span>Acompañan a los mayores, llevando compañía y oración.</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-50 shadow-sm">
                    <span className="text-red-600 font-bold">›</span>
                    <span>Realizan proyectos de ayuda comunitaria, distribuyendo alimentos y esperanza.</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-50 shadow-sm">
                    <span className="text-red-600 font-bold">›</span>
                    <span>Desarrollan programas de salud y educación ambiental.</span>
                  </li>
                </ul>
                <blockquote className="mt-6 text-gray-800 italic border-l-4 border-red-200 pl-4">
                  “En cada obra de misericordia, en cada palabra de amor, Cristo se manifiesta al mundo.”
                  <br />
                  <span className="font-semibold text-gray-800">— Elena G. de White, El Deseado de Todas las Gentes, p. 350.</span>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-28 bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.08),transparent_50%)]"></div>

          <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-24 text-center relative z-10">
            <div className="inline-block mb-6 px-5 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold tracking-widest uppercase border border-white/20">
              EL LLAMADO
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Llamados a Servir
            </h2>
            <p className="text-xl md:text-2xl text-red-50 mb-8 max-w-3xl mx-auto font-light leading-relaxed">
              No esperes a sentirte completamente preparado para ayudar. Todos podemos ser reflejo de amor y esperanza en nuestro entorno.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                <blockquote className="text-lg md:text-xl italic leading-relaxed">
                  "Y recorrió Jesús todas las ciudades y aldeas, enseñando en las sinagogas de ellos, y predicando el evangelio del reino, y sanando toda enfermedad y toda dolencia en el pueblo."
                  <span className="block mt-4 font-semibold text-red-100 not-italic text-base">— Mateo 9:35</span>
                </blockquote>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                <blockquote className="text-lg md:text-xl italic leading-relaxed">
                  "Entonces oí la voz del Señor, que decía: ¿A quién enviaré, y quién irá por nosotros? Y respondí yo: Heme aquí, envíame a mí."
                  <span className="block mt-4 font-semibold text-red-100 not-italic text-base">— Isaías 6:8</span>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-section" className="py-20 md:py-28 px-8 md:px-16 lg:px-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-block px-4 py-1.5 bg-red-50 border border-red-200 rounded-full mb-6">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-widest">Comienza Hoy</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Sé parte del cambio
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Si deseas vivir una experiencia de fe auténtica, contribuir al bienestar de otros y crecer espiritualmente, este es tu momento.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <a 
                href="/register" 
                className="group px-8 py-4 bg-red-700 text-white text-sm font-semibold uppercase tracking-wide rounded-lg shadow-md hover:bg-red-800 hover:shadow-lg transition-all duration-300"
              >
                <span>Registrarse</span>
                <svg className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a 
                href="/contact" 
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold uppercase tracking-wide rounded-lg shadow-md hover:border-red-700 hover:text-red-700 transition-all duration-300"
              >
                Contactar
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-white to-red-50">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-56">
        {/* Navbar Profesional */}
        <nav id="main-nav" className="flex justify-between items-center px-8 md:px-10 lg:px-15 py-4 bg-white/95 backdrop-blur-sm shadow-sm fixed top-0 right-0 left-0 md:left-56 z-30 border-b border-gray-200">
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <li>
              <button
                onClick={handleScrollToInfo}
                className="hover:text-red-700 transition-colors duration-200 uppercase tracking-wide"
              >
                Acerca de
              </button>
            </li>
            <li>
              <button
                onClick={handleScrollToContact}
                className="hover:text-red-700 transition-colors duration-200 uppercase tracking-wide"
              >
                Contacto
              </button>
            </li>
          </ul>

          {userName ? (
            <div className="flex items-center gap-4 ml-auto">
              <span className="hidden sm:inline text-sm text-gray-600">
                Bienvenido, <span className="font-semibold text-gray-800">{userName}</span>
              </span>
              {Logout.isPending ?
                <LoadingButton loading={true} loadingText="Saliendo..." children></LoadingButton>
                :
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-red-700 transition-colors font-medium uppercase tracking-wide"
                  onClick={() => Logout.mutate()}
                >
                  Salir
                </button>
              }
            </div>
          ) : (
            <button
              type="button"
              className="px-6 py-2 bg-red-700 text-white text-sm font-medium uppercase tracking-wide rounded hover:bg-red-800 transition-colors ml-auto"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </nav>

        <div className="pt-16">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-red-25 via-30% to-white to-90%">
            <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-24 md:py-35">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Contenido */}
                <div className="space-y-6">
                  <div className="inline-block">
                    <span className="text-xs font-semibold text-red-700 uppercase tracking-widest border-b-2 border-red-700 pb-1">
                      Misión y Servicio
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Transformando vidas a través del
                    <span className="text-red-700 block mt-1">servicio misionero</span>
                  </h1>
                  
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Una comunidad comprometida con llevar esperanza, educación y amor a quienes más lo necesitan.
                  </p>
                  
                  <button
                    className="px-8 py-3 bg-red-700 text-white text-sm font-semibold uppercase tracking-wide rounded hover:bg-red-800 transition-all shadow-lg hover:shadow-xl"
                    onClick={() => setMostrarParticipacion(true)}
                  >
                    Participar
                  </button>
                </div>
                
                {/* Imagen */}
                <div className="relative">
                  <div className="absolute inset-0 bg-red-200/30 rounded-2xl transform rotate-3"></div>
                  <img
                    src={grupoIM}
                    alt="Comunidad misionera"
                    className="relative rounded-2xl shadow-2xl w-full cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => setLightboxImage("src/assets/grupo-im.jpeg")}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sección Noticias */}
          <section className="px-8 md:px-16 lg:px-24 py-20 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="mb-12">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-widest">Actualidad</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Últimas Noticias</h2>
              </div>

              {isLoading ? (
                <div className="bg-gray-50 p-12 rounded-xl flex justify-center items-center min-h-[400px]">
                  <LoadingSpinner
                    size="lg"
                    message="Cargando noticias"
                    subtitle="Por favor espera mientras cargamos el contenido"
                  />
                </div>
              ) : Logout.error ? (
                <div className="text-red-600 text-center py-12 bg-red-50 rounded-xl">{Logout.error.message}</div>
              ) : noticias?.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <p className="text-lg text-gray-600">No hay noticias disponibles en este momento.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  {noticias?.slice(0, 3).map((n: Noticia) => (
                    <article
                      key={n.id_noticia}
                      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-red-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => handleNoticiaClick(n.id_noticia)}
                    >
                      {n.fijada && (
                        <div
                          className="absolute top-3 right-3 p-1.5 bg-red-700 text-white rounded-full shadow-md z-10"
                          title="Noticia fijada"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PinIcon />
                        </div>
                      )}

                      {n.imagen_path ? (
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          <img
                            src={n.imagen_path.startsWith("http") ? n.imagen_path : `${API_BASE_URL}${n.imagen_path}`}
                            alt={n.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                      )}
                      
                      <div className="p-5">
                        <time className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          {new Date(n.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </time>
                        <h3 className="font-bold text-lg text-gray-900 mt-2 line-clamp-2 group-hover:text-red-700 transition-colors">
                          {n.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                          {n.descripcion}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <InfoInline />
        </div>

        {mostrarParticipacion && <Participar onClose={() => setMostrarParticipacion(false)} />}

        {showVerMas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg max-w-md w-full p-8 text-center shadow-xl animate-fade-in">
              <h3 className="text-2xl font-bold mb-4 text-red-700">¿Quieres ver más noticias?</h3>
              <p className="text-gray-700 mb-6">
                Regístrate para estar al tanto de todo lo que te interese y acceder a todas las noticias del Instituto.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowVerMas(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={() => {
                    setShowVerMas(false);
                    navigate("/register");
                  }}
                  className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition"
                >
                  Registrarme
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RENDER LIGHTBOX */}
        {lightboxImage && <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}

        {/* Add the modal at the end of the component, before the closing div */}
        {selectedNoticiaId !== null && (
          <NoticiaDetalleModal
            noticiaId={selectedNoticiaId}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}
