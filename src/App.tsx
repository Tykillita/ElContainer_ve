
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { PlanProvider } from './context/PlanContext';
import { useAuth } from './context/useAuth';
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Booking = lazy(() => import('./pages/Booking'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardCliente = lazy(() => import('./pages/DashboardCliente'));
const Lavados = lazy(() => import('./pages/Lavados'));
const Progreso = lazy(() => import('./pages/Progreso'));
const ProgresoCliente = lazy(() => import('./pages/ProgresoCliente'));
const Planes = lazy(() => import('./pages/Planes'));
const PlanesCliente = lazy(() => import('./pages/PlanesCliente'));
const Clientes = lazy(() => import('./pages/Clientes'));
const Calendario = lazy(() => import('./pages/Calendario'));
const Cuenta = lazy(() => import('./pages/Cuenta'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const ReservasCliente = lazy(() => import('./pages/ReservasCliente'));
// import BeamsFixed from './components/BeamsFixed';
//import ParticleSystem, { AmbientLight } from './components/ParticleSystem';

const BackgroundCompositor = lazy(() => import('./components/BackgroundEffects'));
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';



function AppLayout() {
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const { isReady, initializePage } = useLoading();

  function DashboardByRole() {
    const { user } = useAuth();
    const role = (user?.user_metadata?.rol as 'admin' | 'it' | 'cliente' | undefined) ?? 'cliente';
    return role === 'admin' || role === 'it' ? <Dashboard /> : <DashboardCliente />;
  }

  function ProgresoByRole() {
    const { user } = useAuth();
    const role = (user?.user_metadata?.rol as 'admin' | 'it' | 'cliente' | undefined) ?? 'cliente';
    return role === 'admin' || role === 'it' ? <Progreso /> : <ProgresoCliente />;
  }

  function PlanesByRole() {
    const { user } = useAuth();
    const role = (user?.user_metadata?.rol as 'admin' | 'it' | 'cliente' | undefined) ?? 'cliente';
    return role === 'admin' || role === 'it' ? <Planes /> : <PlanesCliente />;
  }

  // Function to be called when the page has completely rendered
  const handlePageLoadComplete = () => {
    setShowInitialLoader(false);
    window.scrollTo(0, 0);
  };

  // Initialize the page loading system
  useEffect(() => {
    initializePage();
  }, [initializePage]);
  const location = useLocation();
  const isDashboardArea = ['/dashboard','/lavados','/progreso','/planes','/clientes','/calendario','/cuenta','/admin-panel','/mis-reservas']
    .some(path => location.pathname.startsWith(path));
  const mainRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);
  return (
    <PageLoader 
      loading={showInitialLoader} 
      type="full-screen" 
      onComplete={handlePageLoadComplete}
      waitForReady={true}
      isReady={isReady}
    >
      <div className="relative min-h-screen text-sand" style={{backgroundColor: 'rgba(0,0,0,0)'}}>
        {/* Fondo 3D con beams gestionado por BackgroundCompositor */}
        {/* Sistema de partículas flotantes */}
        {/* <ParticleSystem
          particleCount={30}
          colors={['#ffffff', '#e35c27', '#fb923c', '#ffffffaa']}
          className="z-0"
          enabled={true}
        /> */}
        {/* Luz ambiental animada gestionada solo desde BackgroundCompositor si se requiere en el futuro */}
        {/* Compositor de efectos de fondo avanzados */}
        <Suspense fallback={<div className="background-compositor-fallback" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'black', zIndex: 0 }} />}>  
          <BackgroundCompositor
            showBeams={true}
            showAnimatedBackground={true}
            showGeometricShapes={true}
            showEnergyWaves={true}
            showAurora={true}
            className="z-0"
          />
        </Suspense>
        {/* Fallback CSS eliminado para evitar superposiciones. Si se requiere, integrarlo como opción en BackgroundCompositor. */}
        <div className="relative z-50 flex min-h-screen flex-col">
          {/* Mostrar Header y Footer solo fuera del área dashboard */}
          {!isDashboardArea && <Header />}
          <main className={`flex-1 px-6 pb-10 ${!isDashboardArea ? 'pt-28' : ''}`} ref={mainRef}>
            <Suspense>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/servicios" element={<Services />} />
                <Route path="/reservas" element={<Booking />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                {/* DashboardLayout wraps all dashboard-related routes */}
                <Route element={<DashboardLayout />}>
                  {/* Must be logged in to access dashboard area */}
                  <Route element={<ProtectedRoute redirectTo="/login" />}>
                    {/* Shared paths; component chosen by role */}
                    <Route path="/dashboard" element={<DashboardByRole />} />
                    <Route path="/progreso" element={<ProgresoByRole />} />
                    <Route path="/planes" element={<PlanesByRole />} />

                    {/* Common routes for all roles */}
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/cuenta" element={<Cuenta />} />

                    {/* Cliente-only routes */}
                    <Route element={<ProtectedRoute allowedRoles={[ 'cliente' ]} redirectTo="/dashboard" />}>
                      <Route path="/mis-reservas" element={<ReservasCliente />} />
                    </Route>

                    {/* Admin/IT-only routes */}
                    <Route element={<ProtectedRoute allowedRoles={[ 'admin', 'it' ]} redirectTo="/dashboard" />}>
                      <Route path="/lavados" element={<Lavados />} />
                      <Route path="/clientes" element={<Clientes />} />
                      <Route path="/admin-panel" element={<AdminPanel />} />
                    </Route>
                  </Route>
                </Route>
                {/* Puedes agregar más rutas aquí */}
              </Routes>
            </Suspense>
          </main>
          {!isDashboardArea && <Footer />}
        </div>
      </div>

    </PageLoader>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <LoadingProvider>
          <PlanProvider>
          <BrowserRouter 
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppLayout />
          </BrowserRouter>
          </PlanProvider>
        </LoadingProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

