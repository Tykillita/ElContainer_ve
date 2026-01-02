import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen relative" style={{ paddingLeft: sidebarOpen ? 220 : 100, transition: 'padding-left 0.3s' }}>
      <Sidebar expanded={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
