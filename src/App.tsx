
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Booking = lazy(() => import('./pages/Booking'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
// import BeamsFixed from './components/BeamsFixed';
//import ParticleSystem, { AmbientLight } from './components/ParticleSystem';

const BackgroundCompositor = lazy(() => import('./components/BackgroundEffects'));
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';



function AppLayout() {
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const { isReady, initializePage } = useLoading();

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
          {/* Mostrar Header y Footer solo si no es dashboard */}
          {location.pathname !== '/dashboard' && <Header />}
          <main className={`flex-1 px-6 pb-10 ${location.pathname !== '/dashboard' ? 'pt-28' : ''}`} ref={mainRef}>
            <Suspense>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/servicios" element={<Services />} />
                <Route path="/reservas" element={<Booking />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
                {/* Puedes agregar más rutas aquí */}
              </Routes>
            </Suspense>
          </main>
          {location.pathname !== '/dashboard' && <Footer />}
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
          <BrowserRouter 
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppLayout />
          </BrowserRouter>
        </LoadingProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

