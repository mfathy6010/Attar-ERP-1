/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Manufacturing from './components/Manufacturing';
import SalesPurchases from './components/SalesPurchases';
import Accounting from './components/Accounting';
import Settings from './components/Settings';
import Login from './components/Login';

const AppContent = () => {
  const { user } = useApp();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard onTabChange={setCurrentTab} />;
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'manufacturing': return <Manufacturing />;
      case 'sales': return <SalesPurchases initialTab="sales" />;
      case 'customers': return <SalesPurchases initialTab="customers" />;
      case 'accounting': return <Accounting initialTab="coa" />;
      case 'pl_report': return <Accounting initialTab="reports" initialReport="pl" />;
      case 'settings': return <Settings />;
      default: return <Dashboard onTabChange={setCurrentTab} />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
