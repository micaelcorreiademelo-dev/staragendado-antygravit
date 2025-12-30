
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';

export const ClientLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Client Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/client')}
          >
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Calendar size={20} />
            </div>
            <h1 className="font-bold text-white text-lg">
              Agendamento Online
            </h1>
          </div>

          <button 
            onClick={() => navigate('/client/my-appointments')}
            className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-white transition-colors"
          >
            <User size={18} />
            <span className="hidden sm:inline">Meus Agendamentos</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:py-8">
        <Outlet />
      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-xs text-text-muted">
        <p>&copy; 2024 Agendamento Online. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
