/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { DevicesPage } from './pages/DevicesPage';
import { LiveSensorsPage } from './pages/LiveSensorsPage';
import { CameraPage } from './pages/CameraPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AutomationsPage } from './pages/AutomationsPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpPage } from './pages/HelpPage';
import { store } from './services/store';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  useEffect(() => {
    // Listen to store updates if needed
    const unsub = store.subscribe(() => {
      // Store triggers re-renders on components
    });
    return unsub;
  }, []);

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveSection} />;
      case 'devices':
        return <DevicesPage onNavigate={setActiveSection} />;
      case 'sensors':
        return <LiveSensorsPage />;
      case 'camera':
        return <CameraPage />;
      case 'ai':
        return <AIAssistantPage />;
      case 'automations':
        return <AutomationsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'history':
        return <HistoryPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'help':
        return <HelpPage />;
      default:
        return <DashboardPage onNavigate={setActiveSection} />;
    }
  };

  return (
    <AppShell activeSection={activeSection} onNavigate={setActiveSection}>
      {renderCurrentSection()}
    </AppShell>
  );
}

