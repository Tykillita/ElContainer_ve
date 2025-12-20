
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
import AutoStepperDemo from './components/AutoStepperDemo';
import SimpleBackground from './components/SimpleBackground';
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
    <div className="relative min-h-screen overflow-hidden text-sand" style={{backgroundColor: 'transparent'}}>
      {/* Fondo 3D optimizado para producción */}
      <SimpleBackground />
      {/* Fallback CSS en caso de que Three.js no cargue */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-60">
        <div 
          className="absolute inset-0"
          style={{
            background: '#050505',
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(235, 82, 40, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
              linear-gradient(180deg, #050505 0%, #0a0a0a 50%, #050505 100%)
            `,
            height: '100vh'
          }}
        />
      </div>
      <div className="relative z-20 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 px-6 pt-28 pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/reservas" element={<Booking />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/demo" element={<AutoStepperDemo />} />
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
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
