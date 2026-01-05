import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, MapPin } from 'lucide-react';

export const ClientConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-2">
        <CheckCircle2 className="text-success w-12 h-12" />
      </div>
      
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Agendado com Sucesso!</h1>
        <p className="text-text-muted">Enviamos os detalhes para seu WhatsApp e E-mail.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm text-left shadow-sm">
        <div className="flex items-start gap-4 border-b border-border pb-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1599351431202-6e0c06e72ed3?auto=format&fit=crop&q=80&w=100&h=100" className="w-full h-full object-cover" />
            </div>
            <div>
                <h3 className="font-bold text-white">Corte Masculino</h3>
                <p className="text-sm text-text-muted">com Carlos Silva</p>
            </div>
        </div>
        
        <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-white">
                <Calendar className="text-primary" size={18} />
                <span>Quinta-feira, 24 de Outubro</span>
            </div>
            <div className="flex items-center gap-3 text-white">
                <Clock className="text-primary" size={18} />
                <span>09:00 - 09:45</span>
            </div>
            <div className="flex items-center gap-3 text-white">
                <MapPin className="text-primary" size={18} />
                <span>BarberFlow - Rua das Flores, 123</span>
            </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button 
            onClick={() => navigate('/client/my-appointments')}
            className="w-full py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold transition-all"
        >
            Ver Meus Agendamentos
        </button>
        <button 
            onClick={() => navigate('/client')}
            className="w-full py-3 rounded-xl bg-transparent border border-border text-text-muted hover:text-white font-medium transition-all"
        >
            Voltar ao Início
        </button>
      </div>
    </div>
  );
};
