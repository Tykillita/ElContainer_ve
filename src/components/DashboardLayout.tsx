import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DockBar from './DockBar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth <= 1024);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const paddingLeft = isMobile ? 0 : sidebarOpen ? 220 : 100;

  return (
    <div
      className="min-h-screen relative"
      style={{ paddingLeft, transition: 'padding-left 0.3s' }}
    >
      {!isMobile && <Sidebar expanded={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />}
      {isMobile && <DockBar />}
      <main
        className="flex-1 w-full mx-auto max-w-6xl px-4 pt-5 pb-28 md:p-8"
        style={{ paddingBottom: isMobile ? '170px' : undefined }}
      >
        <Outlet />
      </main>
    </div>
  );
}
