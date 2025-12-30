
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Store, CreditCard, Settings, LogOut, HelpCircle,
  Puzzle, Menu, X, BarChart3, FileText, Users, ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import { Notification } from '../types';

import { useAuth } from '../contexts/AuthContext';

export const Layout = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Sistema', message: 'Bem-vindo ao painel administrativo.', timestamp: new Date().toISOString(), read: false, type: 'info' }
  ]);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: 'dashboard' },
    { icon: Users, label: 'Funcionários', path: '/employees', permission: 'employees' },
    { icon: Store, label: 'Lojas', path: '/stores', permission: 'stores' },
    { icon: CreditCard, label: 'Planos', path: '/plans', permission: 'plans' },
    { icon: Puzzle, label: 'Integrações Globais', path: '/integrations', permission: 'integrations' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports', permission: 'reports' },
    { icon: FileText, label: 'Auditoria & Logs', path: '/logs', permission: 'logs' },
    { icon: Layers, label: 'Segmentos', path: '/segments', permission: 'settings' },
    { icon: Settings, label: 'Configurações Gerais', path: '/settings', permission: 'settings' },
  ];

  const hasPermission = (perm?: string) => {
    if (!perm) return true;
    if (!user?.permissions || Object.keys(user.permissions).length === 0) return true;
    return !!user.permissions[perm];
  };

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <div className="flex h-screen bg-background overflow-hidden ps-[0px]">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden print:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Fixed structure */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0f172a] border-r border-slate-800 transition-all duration-300 flex flex-col print:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isSidebarCollapsed ? 'w-20' : 'w-64'} relative`}>

        {/* Toggle Button - Absolute */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 bg-surface text-text-muted hover:text-white p-1 rounded-full shadow-md border border-border z-50 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Header - Fixed at Top */}
        <div className={`p-6 flex items-center transition-all duration-300 shrink-0 ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3'}`}>
          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
            {user?.full_name?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-white font-medium max-w-[150px] truncate" title={user?.full_name}>{user?.full_name || 'Admin SaaS'}</h1>
              <p className="text-text-muted text-xs">{user?.role === 'admin' && (!user.permissions || Object.keys(user.permissions).length === 0) ? 'Super Admin' : 'Funcionário'}</p>
            </div>
          )}
          <button className="ml-auto lg:hidden text-text-muted" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content - Nav + Footer */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar w-full min-h-0">
          <nav className="flex-1 py-4 px-3 space-y-1">
            {filteredMenuItems.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}
                title={isSidebarCollapsed ? item.label : ''}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-white/5 hover:text-white'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                <item.icon size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Footer - No Top Border as requested */}
          <div className={`p-4 space-y-1 ${isSidebarCollapsed ? 'px-2' : ''}`}>
            <NavLink to="/support" title={isSidebarCollapsed ? 'Suporte' : ''} className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-white/5 hover:text-white ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <HelpCircle size={20} className="shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">Suporte ao Lojista</span>}
            </NavLink>
            <button onClick={handleLogout} title={isSidebarCollapsed ? 'Sair' : ''} className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger/80 hover:bg-danger/10 hover:text-danger ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <LogOut size={20} className="shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="lg:hidden bg-surface border-b border-border p-4 flex items-center justify-between print:hidden">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-text-muted"><Menu size={24} /></button>
          <span className="font-semibold text-white">{menuItems.find(i => i.path === location.pathname)?.label || 'Admin'}</span>
          <div className="w-6"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth print:p-0">
          <Outlet context={{ notifications, isNotificationsOpen, setIsNotificationsOpen, setNotifications }} />
        </main>
      </div>
    </div>
  );
};
