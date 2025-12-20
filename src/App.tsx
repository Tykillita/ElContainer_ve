import { useState } from 'react'

import Header from './components/Header'
import Footer from './components/Footer'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Services from './pages/Services'
import Booking from './pages/Booking'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import AutoStepperDemo from './components/AutoStepperDemo'
import { AppProvider } from './context/AppContext'
import DebugInfo from './components/DebugInfo'

type Page = 'home' | 'services' | 'booking' | 'blog' | 'contact' | 'onboarding' | 'demo'

function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <AppProvider>
      <DebugInfo componentName="App" />
      <div className="relative min-h-screen overflow-hidden bg-[#050505] text-sand">
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-95"
          style={{ background: '#050505', height: '600px' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header currentPage={page} onNavigate={setPage} />
          <main className="flex-1 px-6 pt-28 pb-10">
            <DebugInfo componentName={`Page: ${page}`} />
            {page === 'home' && <Home />}
            {page === 'services' && <Services />}
            {page === 'booking' && <Booking />}
            {page === 'blog' && <Blog />}
            {page === 'contact' && <Contact />}
            {page === 'onboarding' && <Onboarding />}
            {page === 'demo' && <AutoStepperDemo />}
          </main>
          <Footer />
        </div>
      </div>
    </AppProvider>
  )
}

export default App
