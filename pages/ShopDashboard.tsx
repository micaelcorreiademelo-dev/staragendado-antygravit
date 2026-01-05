import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Clock, Store as StoreIcon, Link as LinkIcon, Copy, Check, AlertTriangle, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '../../types';
import { format, isToday, isThisWeek, isThisMonth, differenceInDays, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';
import { storesService } from '../../services/stores.service';

// --- Mock Data (fallback) ---
const defaultAppointments: Appointment[] = [
  // Today
  { id: '1', clientName: 'Ana Silva', serviceName: 'Corte Feminino', professionalName: 'Carlos Andrade', date: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), duration: 60, status: 'Confirmed' },
  { id: '2', clientName: 'Marcos Rocha', serviceName: 'Barba e Cabelo', professionalName: 'Bruna Costa', date: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(), duration: 90, status: 'Confirmed' },
];

export const ShopDashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'today' | 'week' | 'month'>('today');
  const [copied, setCopied] = useState(false);
  const [expirationWarning, setExpirationWarning] = useState<{ type: 'days' | 'hours', value: string } | null>(null);

  const session = JSON.parse(localStorage.getItem('user_session') || '{}');
  const storeId = session.storeId;
  const clientLink = storeId ? `${window.location.protocol}//${window.location.host}/#/client/${storeId}` : '';

  useEffect(() => {
    const checkExpiration = async () => {
      if (!storeId) return;
      try {
        const store = await storesService.getById(storeId);
        if (store.plan_expires_at) {
          const expires = parseISO(store.plan_expires_at);

          const updateTime = () => {
            const now = new Date();
            const daysLeft = differenceInDays(expires, now);

            if (daysLeft <= 3 && daysLeft >= 1) {
              setExpirationWarning({ type: 'days', value: `${daysLeft} dias` });
            } else if (daysLeft < 1) {
              // Last day or expired
              const hours = differenceInHours(expires, now);
              const minutes = differenceInMinutes(expires, now) % 60;

              if (hours < 0 || minutes < 0) {
                setExpirationWarning({ type: 'hours', value: 'Expirado' }); // Or handled by backend blocking
              } else {
                setExpirationWarning({ type: 'hours', value: `${hours}h ${minutes}m` });
              }
            } else {
              setExpirationWarning(null);
            }
          };

          updateTime();
          const interval = setInterval(updateTime, 60000); // Update every minute
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking plan expiration:', error);
      }
    };

    checkExpiration();
  }, [storeId]);


  const copyToClipboard = () => {
    if (!clientLink) return;
    window.navigator.clipboard.writeText(clientLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const appointments: Appointment[] = useMemo(() => {
    const saved = localStorage.getItem('shop_appointments');
    return saved ? JSON.parse(saved) : defaultAppointments;
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const appDate = new Date(app.date);
      if (activeFilter === 'today') return isToday(appDate);
      if (activeFilter === 'week') return isThisWeek(appDate);
      if (activeFilter === 'month') return isThisMonth(appDate);
      return false;
    });
  }, [activeFilter, appointments]);

  const servicesStats = useMemo(() => {
    const counts = filteredAppointments.reduce((acc, curr) => {
      acc[curr.serviceName] = (acc[curr.serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredAppointments]);

  const professionalPerformance = useMemo(() => {
    const counts = filteredAppointments.reduce((acc, curr) => {
      acc[curr.professionalName] = (acc[curr.professionalName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, score]) => ({ name, score: Number(score) }))
      .sort((a, b) => b.score - a.score);
  }, [filteredAppointments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
            <p className="text-text-muted mt-1">Bem-vindo de volta, {session.name || 'Lojista'}!</p>
          </div>
        </div>

        {/* Filters / Time Range */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Visão Geral</h2>
          <div className="flex bg-surface rounded-lg p-1 border border-border">
            <button onClick={() => setActiveFilter('today')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === 'today' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'}`}>Hoje</button>
            <button onClick={() => setActiveFilter('week')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === 'week' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'}`}>Esta Semana</button>
            <button onClick={() => setActiveFilter('month')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === 'month' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'}`}>Este Mês</button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Próximos Agendamentos</h3>
              <div className="space-y-4">
                {filteredAppointments.length > 0 ? filteredAppointments.map(apt => (
                  <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-white/5 transition-colors border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{format(new Date(apt.date), 'HH:mm')} - {apt.clientName}</p>
                        <p className="text-sm text-text-muted">Profissional: {apt.professionalName} • {apt.serviceName}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${apt.status === 'Confirmed' || apt.status === 'Completed' ? 'bg-success' : 'bg-secondary'}`} title={apt.status} />
                  </div>
                )) : (
                  <div className="text-center py-8 text-text-muted">
                    <p>Nenhum agendamento para este período.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Serviços Mais Agendados</h3>
              <div className="h-64 w-full">
                {servicesStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={servicesStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#324d67" vertical={false} />
                      <XAxis dataKey="name" stroke="#92adc9" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1A242E', borderColor: '#324d67', color: '#fff', borderRadius: '8px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="value" name="Agendamentos" fill="#3A86FF" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-text-muted">
                    <p>Sem dados de serviços para este período.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Desempenho dos Profissionais</h3>
              <div className="space-y-4">
                {professionalPerformance.length > 0 ? professionalPerformance.map((prof, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white">
                        {prof.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-white font-medium">{prof.name}</span>
                    </div>
                    <span className="text-primary font-bold text-lg">{prof.score}</span>
                  </div>
                )) : (
                  <div className="text-center py-8 text-text-muted text-sm">
                    Sem dados de desempenho para este período.
                  </div>
                )}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Status da Assinatura</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-text-muted text-sm">Plano Atual</p>
                  {/* Placeholder for dynamic plan name if we fetched it here, but sticking to design */}
                  <p className="text-xl font-bold text-primary">Consultar</p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">Validade</p>
                  <p className="font-medium text-white">{expirationWarning ? expirationWarning.value + ' restantes' : 'Ver detalhes'}</p>
                </div>
                <button
                  onClick={() => navigate('/shop/subscription')}
                  className="w-full py-2.5 rounded-lg bg-secondary hover:bg-orange-600 text-white font-bold transition-colors"
                >
                  Gerenciar Assinatura
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
