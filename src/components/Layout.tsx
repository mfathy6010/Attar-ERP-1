import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  TrendingUp, 
  Factory, 
  FileText, 
  PieChart,
  Moon,
  Sun
} from 'lucide-react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'active-nav-item' 
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`}
  >
    <Icon size={20} className="shrink-0" />
    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
  </button>
);

const Layout: React.FC<{ children: React.ReactNode, currentTab: string, setCurrentTab: (tab: string) => void }> = ({ children, currentTab, setCurrentTab }) => {
  const { settings, setSettings, user, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'pos', label: 'نقطة البيع', icon: ShoppingCart },
    { id: 'inventory', label: 'المخازن', icon: Package },
    { id: 'manufacturing', label: 'التصنيع', icon: Factory },
    { id: 'sales', label: 'المبيعات والمشتريات', icon: TrendingUp },
    { id: 'accounting', label: 'الحسابات والتقارير', icon: FileText },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
  ];

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  return (
    <div 
      className={`flex h-screen overflow-hidden ${settings.theme === 'dark' ? 'dark text-slate-200' : 'text-slate-900'} transition-colors duration-300`} 
      dir="rtl"
      style={{ 
        color: settings.theme === 'dark' ? '#f1f5f9' : settings.fontColor,
        backgroundColor: settings.theme === 'dark' ? '#0f172a' : settings.backgroundColor,
        '--primary-color': settings.primaryColor,
        '--sidebar-color': settings.sidebarColor,
        '--highlight-color': settings.fontHighlightColor,
      } as React.CSSProperties}
    >
      <style>
        {`
          :root {
            --primary-color: ${settings.primaryColor};
            --sidebar-color: ${settings.sidebarColor};
            --highlight-color: ${settings.fontHighlightColor};
            --font-color: ${settings.theme === 'dark' ? '#f1f5f9' : settings.fontColor};
            --bg-color: ${settings.theme === 'dark' ? '#0f172a' : settings.backgroundColor};
          }

          /* Global Font Color Override */
          body, #root, .flex, div, span, p, h1, h2, h3, h4, h5, h6, label, input, select, textarea {
            color: var(--font-color) !important;
          }

          /* Sidebar Styling */
          aside, .sidebar-bg {
            background-color: var(--sidebar-color) !important;
          }
          
          aside *, .sidebar-bg * {
            color: rgba(255, 255, 255, 0.7) !important;
          }

          /* Active Sidebar Item - Lime Green Background from image */
          .active-nav-item {
            background-color: var(--highlight-color) !important;
            color: var(--sidebar-color) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .active-nav-item * {
            color: var(--sidebar-color) !important;
          }

          /* Exceptions for primary colored text and white text on primary backgrounds */
          .text-white, .bg-emerald-600 *, .bg-emerald-500 *, .text-emerald-600, .bg-indigo-600 *, .text-indigo-600 {
            /* Keep these as they are or handle specifically */
          }
          
          .text-white { color: white !important; }
          .text-emerald-600, .text-indigo-600 { color: var(--primary-color) !important; }
          .bg-emerald-600, .bg-indigo-600 { background-color: var(--primary-color) !important; }
          .bg-emerald-600 *, .bg-indigo-600 * { color: white !important; }
          
          /* Theme overrides for emerald classes used in components */
          .text-emerald-400 { color: var(--primary-color) !important; opacity: 0.8; }
          .bg-emerald-50 { background-color: var(--primary-color)15 !important; }
          .bg-emerald-100 { background-color: var(--primary-color)25 !important; }
          .bg-emerald-900\\/20 { background-color: var(--primary-color)20 !important; }
          .shadow-emerald-900\\/20 { --tw-shadow-color: var(--primary-color)33 !important; }
          .border-emerald-500, .border-indigo-500 { border-color: var(--primary-color) !important; }
          .focus\\:ring-emerald-500:focus, .focus\\:ring-indigo-500:focus { --tw-ring-color: var(--primary-color) !important; }

          /* Icon Interaction */
          svg {
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s ease;
          }
          
          button:active svg, a:active svg, .cursor-pointer:active svg {
            transform: scale(0.8) rotate(-5deg);
            filter: brightness(1.2);
          }

          button:hover svg, a:hover svg, .cursor-pointer:hover svg {
            transform: translateY(-1px);
          }
          
          /* Background Overrides */
          .bg-gray-50, .bg-white, .bg-slate-50 { background-color: var(--bg-color) !important; }
          .dark .bg-gray-800, .dark .bg-slate-800 { background-color: #1e293b !important; } /* Card background in dark mode */
          .dark .bg-gray-900, .dark .bg-slate-900 { background-color: var(--bg-color) !important; }
        `}
      </style>
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col border-l border-gray-200 dark:border-gray-800 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
        style={{ backgroundColor: settings.sidebarColor }}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <img src={settings.companyLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-bold text-white truncate">{settings.companyName}</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white p-1">
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentTab === item.id || (currentTab === 'pl_report' && item.id === 'accounting') || (currentTab === 'customers' && item.id === 'sales')}
              onClick={() => setCurrentTab(item.id)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all"
          >
            {settings.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {!collapsed && <span className="font-medium">{settings.theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}</span>}
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
          >
            <LogOut size={20} />
            {!collapsed && <span className="font-medium">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Mobile Toggle */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <img src={settings.companyLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold">{settings.companyName}</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2">
            <Menu size={24} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-64 bg-gray-900 z-50 md:hidden flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img src={settings.companyLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                  <span className="font-bold text-white">{settings.companyName}</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-gray-400">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={currentTab === item.id || (currentTab === 'pl_report' && item.id === 'accounting') || (currentTab === 'customers' && item.id === 'sales')}
                    onClick={() => { setCurrentTab(item.id); setMobileOpen(false); }}
                    collapsed={false}
                  />
                ))}
              </nav>
              <div className="p-4 border-t border-white/10">
                <button 
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-all"
                >
                  <LogOut size={20} />
                  <span className="font-medium">تسجيل الخروج</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
