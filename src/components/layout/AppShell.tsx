import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { OfflineIndicator } from '../common/OfflineIndicator';

interface AppShellProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ activeSection, onNavigate, children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 pb-16 lg:pb-0">
      <OfflineIndicator />
      <Header activeSection={activeSection} onNavigate={onNavigate} />

      <div className="flex-1 flex">
        <Sidebar activeSection={activeSection} onNavigate={onNavigate} />
        
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <MobileNav activeSection={activeSection} onNavigate={onNavigate} />
    </div>
  );
};
