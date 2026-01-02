import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Register from "./pages/register";
import Login from "./pages/login";
import Home from "./pages/home";
import ForgotPassword from "./pages/forgotpassword";
import VerificarEmail from "./pages/VerificarEmail";
import RecuperarContrasena from "./pages/RecuperarContrasena";
import RestablecerContrasena from "./pages/RestablecerContrasena";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Importar el interceptor de axios para inicializarlo
import "./config/axiosConfig";

import NotAvailable from "./pages/notAvailable";
import EventsRegistration from "./pages/EventsRegistration";
import CrearEvento from "./pages/CrearEvento";
import CrearGrupo from "./pages/CrearGrupo";
import EventosTranscurridosPage from "./pages/EventosTranscurridos";
import EventosCanceladosPage from "./pages/EventosCancelados";
import EventosDisponiblesPage from "./pages/EventosDisponibles";
import { NoAutorizado } from "./pages/NoAutorizado";
import ModificarEvento from "./pages/modificarEvento";
import GruposList from "./pages/GruposList";
import EventosParticipantes from "./pages/EventosParticipantes";
import MisEventos from "./pages/MisEventos";


// donaciones
import DonacionPage from "./pages/DonacionPage";
import DonacionesListPage from "./pages/DonacionesListPage";
import DonadoresListPage from "./pages/DonadoresListPage";
import CrearDonantePage from "./pages/CrearDonantePage";
import ModificarDonantePage from "./pages/ModificarDonantePage";
import PagoExitoDonacion from "./pages/PagoExitoDonacion";


import SecretariaGrupalHome from "./pages/SecretariaGrupalHome";
import GestionRoles from "./pages/GestionRoles";
import GrupoView from "./pages/GrupoUser";
import ModificarGrupo from "./pages/ModificarGrupo";
import EventosComponent from "./pages/EventsList";
import Info from "./pages/Info";
import NoticiaDetalle from "./pages/NoticiaDetalle";
import CrearNoticia from "./pages/CrearNoticia";
import ListarNoticias from "./pages/ListarNoticias";
import EditarNoticia from "./pages/ModificarNoticia";
import NoticiasUsuario from "./pages/NoticiasUsuario";
import IntegrantesList from "./components/IntegrantesList";
import UsuariosSecreGrupal from "./pages/MiembrosSecreGrupal";

export default function App() {
  //considerar implementar el lazy loading para estas paginas
  return (
    <>
      <Toaster position="top-right" richColors expand={false} />
      <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verificar-email" element={<VerificarEmail />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />


        {/* {eventos} */}
        <Route path="/usuarios" element={<UsuariosSecreGrupal />} />
        <Route path="/eventos" element={<EventosComponent />} />
        <Route path="/eventos/lista/participantes" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[2, 4, 5]}>
            <EventosParticipantes />
          </ProtectedRoute>
        } />
        <Route path="/eventos/:id" element={
          <ProtectedRoute requireAuth={true}>
            <EventsRegistration />
          </ProtectedRoute>
        } />
        <Route path="/noticias/:id" element={
          <ProtectedRoute requireAuth={true}>
            <NoticiaDetalle />
          </ProtectedRoute>
        } />
        <Route path="/mis-eventos" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[3]}>
            <MisEventos />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotAvailable />} />
        <Route path="/info" element={<Info />} />
        <Route path="/crear-evento" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[2, 4, 5]}>
            <CrearEvento />
          </ProtectedRoute>
        } />
        <Route path="/eventos/transcurridos" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4, 5]}>
            <EventosTranscurridosPage />
          </ProtectedRoute>
        } />
        <Route path="/eventos/cancelados" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4, 5]}>
            <EventosCanceladosPage />
          </ProtectedRoute>
        } />
        <Route path="/eventos-disponibles" element={<EventosDisponiblesPage />} />  
        <Route path="/no-autorizado" element={<NoAutorizado />} />
        <Route path="/modificar-evento/:id" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4, 5]}>
            <ModificarEvento />
          </ProtectedRoute>
        } />
        <Route path="/editar-grupo/:id" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4, 5]}>
            <ModificarGrupo />
          </ProtectedRoute>
        } />
        <Route path="/integrantes/:id" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4, 5]}>
            <IntegrantesList />
          </ProtectedRoute>
        } />


        
        {/* donaciones */}
        <Route path="/donaciones" element={
          <ProtectedRoute requireAuth={true}>
            <DonacionesListPage />
          </ProtectedRoute>
        } />
        <Route path="/donaciones/donar" element={<DonacionPage />} />
        <Route path="/donaciones/exito" element={
          <ProtectedRoute requireAuth={true}>
            <PagoExitoDonacion />
          </ProtectedRoute>
        } />
        <Route path="/donadores" element={
          <ProtectedRoute requireAuth={true}>
            <DonadoresListPage />
          </ProtectedRoute>
        } />
        <Route path="/crear-donador" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[4, 5]}>
            <CrearDonantePage />
          </ProtectedRoute>
        } />
        <Route path="/modificar-donador/:id" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[4, 5]}>
            <ModificarDonantePage />
          </ProtectedRoute>
        } />
        <Route path="/donaciones/mis-donaciones" element={
          <ProtectedRoute requireAuth={true}>
            <DonacionesListPage />
          </ProtectedRoute>
        } />
       
       
        <Route path="/eventos-transcurridos" element={<EventosTranscurridosPage />} />
        <Route path="/noticias/crear" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4]}>
            <CrearNoticia />
          </ProtectedRoute>
        } />
        <Route path="/noticias/admin" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4]}>
            <ListarNoticias />
          </ProtectedRoute>
        } />
        <Route path="/noticias/modificar/:id" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4]}>
            <EditarNoticia />
          </ProtectedRoute>
        } />
        <Route path="/noticias" element={<NoticiasUsuario />} />
        
        {/* Rutas de grupos */}
        <Route path="/grupos" element={<GruposList />}></Route>
        <Route path="/crear-grupo" element={<CrearGrupo />} />
        <Route path="/grupos/:id" element={
          <ProtectedRoute requireAuth={true}>
            <GrupoView />
          </ProtectedRoute>
        }></Route>
        
        {/* Rutas de Admin */}
        <Route path="/admin/gestion-roles" element={
          <ProtectedRoute requireAuth={true} allowedRoles={[1, 2]}>
            <GestionRoles />
          </ProtectedRoute>
        } />

          {/* donaciones */}
          <Route path="/donaciones" element={
            <ProtectedRoute requireAuth={true}>
              <DonacionesListPage />
            </ProtectedRoute>
          } />
          <Route path="/donaciones/donar" element={<DonacionPage />} />
          <Route path="/donadores" element={
            <ProtectedRoute requireAuth={true}>
              <DonadoresListPage />
            </ProtectedRoute>
          } />
          <Route path="/donaciones/mis-donaciones" element={
            <ProtectedRoute requireAuth={true}>
              <DonacionesListPage />
            </ProtectedRoute>
          } />


          <Route path="/noticias/crear" element={
            <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4]}>
              <CrearNoticia />
            </ProtectedRoute>
          } /> 
          <Route path="/noticias/admin" element={
            <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4]}>
              <ListarNoticias />
            </ProtectedRoute>
          } /> 
          <Route path="/noticias/modificar/:id" element={
            <ProtectedRoute requireAuth={true} allowedRoles={[1, 2, 4]}>
              <EditarNoticia />
            </ProtectedRoute>
          } /> 
          <Route path="/noticias" element={<NoticiasUsuario />} /> 
          <Route path="/grupos" element={<GruposList />}></Route>
          <Route path="/grupos/:id" element={
            <ProtectedRoute requireAuth={true}>
              <GrupoView />
            </ProtectedRoute>
          }></Route>

          {/* Rutas de Admin */}
          <Route path="/admin/gestion-roles" element={
            <ProtectedRoute requireAuth={true} allowedRoles={[1, 2]}>
              <GestionRoles />
            </ProtectedRoute>
          } />

          {/* Rutas de Secretaria Grupal */}
          <Route path="/secretaria-grupal/home" element={<SecretariaGrupalHome />} />
        </Routes>
      </Router>
    </>
  );
}
