
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
import { AppProvider } from './context/AppContext';
import DebugInfo from './components/DebugInfo';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-sand">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-95"
        style={{ background: '#050505', height: '600px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 px-6 pt-28 pb-10">
          <DebugInfo componentName={`Page: ${window.location.pathname}`} />
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
      <DebugInfo componentName="App" />
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
