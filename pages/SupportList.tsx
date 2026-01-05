import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { Store, StoreStatus } from '../types';

const initialStores: Store[] = [
  { id: '1', name: 'Barbearia do Zé', email: 'ze@barbearia.com', status: StoreStatus.ACTIVE, plan: 'Profissional', joinedDate: '2024-07-15' },
  { id: '2', name: 'Salão Beleza Pura', email: 'contato@belezapura.com', status: StoreStatus.BLOCKED, plan: 'Premium', joinedDate: '2024-07-12' },
  { id: '3', name: 'Studio de Tatuagem Art', email: 'tattoo@artstudio.com', status: StoreStatus.ACTIVE, plan: 'Básico', joinedDate: '2024-07-10' },
];

export const SupportList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [stores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('app_stores');
    return saved ? JSON.parse(saved) : initialStores;
  });

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-black text-white">Suporte ao Lojista</h1>
        <p className="text-text-muted mt-1">Selecione uma loja para ver as ferramentas de suporte e comunicação.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
        <input 
          type="text" 
          placeholder="Buscar loja por nome ou e-mail..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="bg-surface border border-border rounded-xl divide-y divide-border">
        {filteredStores.map(store => (
          <div 
            key={store.id}
            onClick={() => navigate(`/support/${store.id}`)}
            className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {store.name.substring(0, 2).toUpperCase()}
               </div>
              <div>
                <p className="font-bold text-white">{store.name}</p>
                <p className="text-sm text-text-muted">{store.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                store.status === StoreStatus.ACTIVE ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
              }`}>
                {store.status}
              </span>
              <ChevronRight size={20} className="text-text-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
