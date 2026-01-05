import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';

export const ClientPersonalData = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({ name: '', phone: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft = JSON.parse(localStorage.getItem('client_booking_draft') || '{}');
    localStorage.setItem('client_booking_draft', JSON.stringify({ ...draft, client: formData }));
    navigate('/client/book/payment');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Seus Dados</h1>
          <p className="text-text-muted text-sm">Precisamos de algumas informações para confirmar.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Digite seu nome" className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Celular (WhatsApp)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">E-mail (Opcional)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="seu@email.com" className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all">
            Ir para Pagamento
          </button>
        </div>
      </form>
    </div>
  );
};
