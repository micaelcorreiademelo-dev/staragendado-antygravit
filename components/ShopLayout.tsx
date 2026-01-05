import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Scissors, Users, BarChart2, Settings,
  LogOut, CreditCard, Menu, X, Clock, DollarSign, Bell, ExternalLink, LifeBuoy, Store, Plus,
  ChevronLeft, ChevronRight, Timer
} from 'lucide-react';
import { Notification } from '../types';
import { NotificationsPopover } from './NotificationsPopover';
import { ConfirmationModal } from './ConfirmationModal';
import { storesService } from '../services/stores.service';
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';

export const ShopLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCaixaOpen, setIsCaixaOpen] = useState(() => {
    const saved = localStorage.getItem('caixa_status');
    return saved === 'open';
  });
  const [showCaixaModal, setShowCaixaModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [expirationWarning, setExpirationWarning] = useState<{ type: 'days' | 'hours', value: string } | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('app_notifications_1');
    return saved ? JSON.parse(saved) : [];
  });

  const [userSession, setUserSession] = useState<any>(() => {
    const saved = localStorage.getItem('user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('app_notifications_1');
      setNotifications(saved ? JSON.parse(saved) : []);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userSession) {
      navigate('/shop-login');
    }
  }, [userSession, navigate]);

  useEffect(() => {
    const checkExpiration = async () => {
      if (!userSession?.storeId) return;
      try {
        const store = await storesService.getById(userSession.storeId);
        if (store.plan_expires_at) {
          const expires = parseISO(store.plan_expires_at);

          const updateTime = () => {
            const now = new Date();
            const daysLeft = differenceInDays(expires, now);

            if (daysLeft <= 3 && daysLeft >= 1) {
              setExpirationWarning({ type: 'days', value: `${daysLeft} dias` });
            } else if (daysLeft < 1) {
              const hours = differenceInHours(expires, now);
              const minutes = differenceInMinutes(expires, now) % 60;

              if (hours < 0 || minutes < 0) {
                setExpirationWarning({ type: 'hours', value: 'Expirado' });
              } else {
                setExpirationWarning({ type: 'hours', value: `${hours}h ${minutes}m` });
              }
            } else {
              setExpirationWarning(null);
            }
          };

          updateTime();
          const interval = setInterval(updateTime, 60000);
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking plan expiration:', error);
      }
    };

    checkExpiration();
  }, [userSession?.storeId]);

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('app_notifications_1', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    navigate('/shop-login');
  };

  const handleCaixaToggle = () => {
    setShowCaixaModal(true);
  };

  const handleCaixaConfirm = () => {
    const newStatus = !isCaixaOpen;
    setIsCaixaOpen(newStatus);
    localStorage.setItem('caixa_status', newStatus ? 'open' : 'closed');
    setShowCaixaModal(false);
  };

  const handleCaixaCancel = () => {
    setShowCaixaModal(false);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/shop/dashboard', show: userSession?.permissions?.canViewDashboard ?? true },
    { icon: Calendar, label: 'Agenda', path: '/shop/calendar', show: true }, // Always show calendar (professionals need to see their schedule)
    { icon: Scissors, label: 'Serviços', path: '/shop/services', show: userSession?.permissions?.canManageServices ?? true },
    { icon: Users, label: 'Profissionais', path: '/shop/professionals', show: userSession?.type === 'shopkeeper' }, // Only shopkeeper manages professionals
    { icon: Clock, label: 'Horários', path: '/shop/hours', show: userSession?.type === 'shopkeeper' },
    { icon: DollarSign, label: 'Pagamentos', path: '/shop/payments', show: userSession?.type === 'shopkeeper' },
    { icon: BarChart2, label: 'Relatórios', path: '/shop/reports', show: userSession?.type === 'shopkeeper' },
    { icon: CreditCard, label: 'Assinatura', path: '/shop/subscription', show: userSession?.type === 'shopkeeper' },
    { icon: Settings, label: 'Configurações', path: '/shop/settings', show: userSession?.type === 'shopkeeper' },
  ];

  /* --- IMPERSONATION LOGIC --- */
  const handleExitImpersonation = () => {
    localStorage.removeItem('user_session');
    navigate(userSession?.adminReturnUrl || '/stores');
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Banner de Modo Admin (Impersonate) */}
      {userSession?.isImpersonated && (
        <div className="bg-orange-600 text-white px-4 py-2 flex justify-between items-center shadow-md z-[60]">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-xs">ADMIN</span>
            <span className="text-sm font-medium">Você está acessando o painel de: <strong>{userSession.name}</strong></span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-2 bg-white text-orange-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-orange-50 transition-colors"
          >
            <LogOut size={14} />
            Voltar para Admin
          </button>
        </div>
      )}

      {/* Main Layout Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 flex flex-col 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        bg-[#0f172a] text-slate-200 border-r border-slate-800 shadow-sm relative`}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-8 bg-slate-800 text-slate-400 hover:text-white p-1 rounded-full shadow-md border border-slate-700 z-50 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className="flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className={`p-6 flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3'}`}>
              <div className="bg-blue-600/10 p-2 rounded-lg shrink-0">
                <Scissors size={isSidebarCollapsed ? 24 : 24} className="text-blue-600" />
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden whitespace-nowrap">
                  <h1 className="text-lg font-bold text-slate-800">BarberFlow</h1>
                  <p className="text-xs text-slate-500 font-medium">Painel Lojista</p>
                </div>
              )}
              <button className="ml-auto lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 py-2 px-3 space-y-1">
              {menuItems.filter(item => item.show).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isSidebarCollapsed ? item.label : ''}
                  className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-white/10 hover:text-white'}
                  ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                `}
                >
                  <item.icon size={20} className={`shrink-0 ${isSidebarCollapsed ? '' : ''}`} />
                  {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}

                  {/* Tooltip for collapsed state */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className={`p-3 space-y-1 mt-auto ${isSidebarCollapsed ? 'px-2' : ''}`}>
              {/* Divider */}
              <div className="h-px bg-slate-700/50 my-2 mx-2"></div>

              <NavLink
                to="/shop/support"
                onClick={() => setIsMobileMenuOpen(false)}
                title={isSidebarCollapsed ? 'Suporte' : ''}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white/50 hover:text-blue-700 transition-colors ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <LifeBuoy size={20} />
                {!isSidebarCollapsed && <span>Suporte</span>}
              </NavLink>

              <button
                onClick={() => navigate(userSession?.storeId ? `/client/${userSession.storeId}` : '/client')}
                title={isSidebarCollapsed ? 'Ver Loja Online' : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white/50 hover:text-blue-700 transition-colors ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <ExternalLink size={20} />
                {!isSidebarCollapsed && <span>Ver Loja</span>}
              </button>

              <button
                onClick={handleLogout}
                title={isSidebarCollapsed ? 'Sair' : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600/80 hover:bg-red-50 hover:text-red-600 transition-colors ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <LogOut size={20} />
                {!isSidebarCollapsed && <span>Sair</span>}
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden bg-surface border-b border-border p-4 flex items-center justify-between">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-text-muted"><Menu size={24} /></button>
            <span className="font-semibold text-white">{menuItems.find(i => i.path === location.pathname)?.label}</span>
            <div className="relative">
              <button onClick={() => setIsNotificationsOpen(o => !o)} className="text-text-muted relative">
                <Bell size={24} />
                {unreadCount > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-danger text-white rounded-full flex items-center justify-center">{unreadCount}</div>}
              </button>
              {isNotificationsOpen && <NotificationsPopover notifications={notifications} onMarkAllAsRead={handleMarkAllAsRead} onNotificationClick={() => { }} onClose={() => setIsNotificationsOpen(false)} />}
            </div>
          </header>


          <main className="flex-1 overflow-y-auto">
            {/* Expiration Notification Banner */}
            {expirationWarning && (
              <div className="sticky top-0 z-40 bg-secondary/90 backdrop-blur-md text-white px-6 py-3 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full animate-pulse">
                    <Timer size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wide">Atenção: Seu plano expira em breve!</p>
                    <p className="text-xs font-medium opacity-90">Renove agora para evitar interrupções.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black font-mono bg-black/20 px-3 py-1 rounded">
                    {expirationWarning.value}
                  </div>
                  <button
                    onClick={() => navigate('/shop/subscription')}
                    className="bg-white text-secondary px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
                  >
                    Renovar Agora
                  </button>
                </div>
              </div>
            )}

            <div className="hidden lg:flex justify-end items-center gap-3 p-4 h-20 border-b border-border bg-background sticky top-0 z-10">
              {/* Ver Loja Button */}
              <button
                onClick={() => navigate(userSession?.storeId ? `/client/${userSession.storeId}` : '/client')}
                className="flex items-center gap-2 bg-surface hover:bg-white/5 text-white border border-border px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <Store size={18} />
                Ver Loja
              </button>

              {/* Agenda Button */}
              <button
                onClick={() => navigate('/shop/calendar')}
                className="flex items-center gap-2 bg-surface hover:bg-white/5 text-white border border-border px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <Calendar size={18} />
                Agenda
              </button>

              {/* Novo Agendamento Button */}
              <button
                onClick={() => navigate('/shop/calendar')}
                className="flex items-center gap-2 bg-secondary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-orange-900/20"
              >
                <Plus size={18} />
                Novo Agendamento
              </button>

              {/* Caixa Toggle Button */}
              <button
                onClick={handleCaixaToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors ${isCaixaOpen
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {isCaixaOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button onClick={() => setIsNotificationsOpen(o => !o)} className="text-text-muted relative p-2 hover:bg-white/5 rounded-full">
                  <Bell size={22} />
                  {unreadCount > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></div>}
                </button>
                {isNotificationsOpen && <NotificationsPopover notifications={notifications} onMarkAllAsRead={handleMarkAllAsRead} onNotificationClick={() => { }} onClose={() => setIsNotificationsOpen(false)} />}
              </div>
            </div>
            <Outlet />
          </main>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showCaixaModal}
          title={isCaixaOpen ? 'Fechar Caixa' : 'Abrir Caixa'}
          message={isCaixaOpen ? 'Tem certeza que deseja fechar o caixa?' : 'Tem certeza que deseja abrir o caixa?'}
          confirmText="Confirmar"
          cancelText="Cancelar"
          confirmColor={isCaixaOpen ? 'red' : 'green'}
          onConfirm={handleCaixaConfirm}
          onCancel={handleCaixaCancel}
        />
      </div>
    </div>
  );
};