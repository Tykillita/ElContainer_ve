
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
// import BeamsFixed from './components/BeamsFixed';
//import ParticleSystem, { AmbientLight } from './components/ParticleSystem';
import BackgroundCompositor from './components/BackgroundEffects';
import { AppProvider } from './context/AppContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppLayout() {
  return (
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
      <BackgroundCompositor
        showBeams={true}
        showAnimatedBackground={true}
        showGeometricShapes={true}
        showEnergyWaves={true}
        showAurora={true}
        className="z-0"
      />
      {/* Fallback CSS eliminado para evitar superposiciones. Si se requiere, integrarlo como opción en BackgroundCompositor. */}
      <div className="relative z-50 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 px-6 pt-28 pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/reservas" element={<Booking />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/onboarding" element={<Onboarding />} />
            {/* Demo eliminado: AutoStepperDemo ya no está disponible */}
            {/* Puedes agregar más rutas aquí */}
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
