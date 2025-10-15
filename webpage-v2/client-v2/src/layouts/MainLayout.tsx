import React from 'react';
import { Outlet } from 'react-router-dom';

import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
