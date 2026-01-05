import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ChevronRight } from 'lucide-react';

import { Professional } from '../../types';

const defaultProfessionals = [
  { id: 'any', name: 'Qualquer profissional', role: 'O primeiro disponível', image: null },
  { id: '1', name: 'Carlos Silva', role: 'Barbeiro Master', image: 'https://i.pravatar.cc/150?u=carlos', rating: 4.9 },
];

export const ClientSelectProfessional = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = React.useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('shop_professionals');
    const loadedProfs = saved ? JSON.parse(saved) : [];

    const formattedProfs = loadedProfs.map((p: Professional) => ({
      id: p.id,
      name: p.name,
      role: 'Profissional', // Mock role for now
      image: p.avatar,
      rating: 5.0 // Mock rating
    }));

    setProfessionals([
      { id: 'any', name: 'Qualquer profissional', role: 'O primeiro disponível', image: null },
      ...formattedProfs
    ]);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Escolha o Profissional</h1>
          <p className="text-text-muted text-sm">Para o serviço: Corte Masculino</p>
        </div>
      </div>

      <div className="grid gap-4">
        {professionals.map((prof) => (
          <div
            key={prof.id}
            onClick={() => {
              const draft = JSON.parse(localStorage.getItem('client_booking_draft') || '{}');
              localStorage.setItem('client_booking_draft', JSON.stringify({ ...draft, professional: prof }));
              navigate('/client/book/datetime');
            }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface cursor-pointer hover:border-primary hover:ring-1 hover:ring-primary transition-all"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${!prof.image ? 'bg-primary/10 text-primary' : ''}`}>
              {prof.image ? (
                <img src={prof.image} alt={prof.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-xl">?</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">{prof.name}</h3>
              <p className="text-sm text-text-muted">{prof.role}</p>
            </div>
            {prof.rating && (
              <div className="flex items-center gap-1 text-sm font-medium text-white bg-background px-2 py-1 rounded-md">
                <Star size={14} className="text-secondary fill-secondary" />
                {prof.rating}
              </div>
            )}
            <ChevronRight size={20} className="text-text-muted" />
          </div>
        ))}
      </div>
    </div>
  );
};
