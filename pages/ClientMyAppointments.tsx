import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Lock, Phone } from 'lucide-react';

export const ClientMyAppointments = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode) setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
        <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white">Acessar Meus Agendamentos</h1>
            <p className="text-text-muted">Insira seu número de celular para receber um código de acesso.</p>
        </div>

        <form onSubmit={handleAccess} className="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Celular</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                        type="tel" 
                        placeholder="(00) 00000-0000" 
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                    />
                </div>
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold transition-all">
                Enviar Código de Acesso
            </button>
        </form>
        <p className="text-xs text-center text-text-muted flex items-center justify-center gap-1">
            <Lock size={12} /> Acesso seguro sem necessidade de senha.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-white" />
        </button>
        <div>
            <h1 className="text-2xl font-black text-white">Meus Agendamentos</h1>
            <p className="text-sm text-text-muted">Olá, Carlos</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider ml-1">Próximos</h2>
        
        {/* Active Appointment Card */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm border-l-4 border-l-primary">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-white text-lg">Corte Masculino</h3>
                    <p className="text-text-muted text-sm">com Carlos Silva</p>
                </div>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">CONFIRMADO</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white">
                <div className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-text-muted" />
                    24 Out
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-text-muted" />
                    09:00
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex gap-3">
                <button className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-text-muted hover:bg-white/5 transition-colors">
                    Reagendar
                </button>
                <button className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-danger hover:bg-danger/10 transition-colors">
                    Cancelar
                </button>
            </div>
        </div>

        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider ml-1 pt-4">Histórico</h2>
        
        {/* Past Appointment Card */}
        <div className="bg-surface border border-border rounded-xl p-5 opacity-70">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">Barba Tradicional</h3>
                <span className="bg-gray-700 text-text-muted text-xs font-bold px-2 py-1 rounded-full">CONCLUÍDO</span>
            </div>
            <p className="text-text-muted text-sm mb-3">com Ana Pereira</p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
                <span>10 Set - 14:30</span>
            </div>
        </div>
      </div>
    </div>
  );
};
