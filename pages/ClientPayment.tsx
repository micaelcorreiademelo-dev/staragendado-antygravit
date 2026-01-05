import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, Banknote, Store } from 'lucide-react';

export const ClientPayment = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('pix');

  const handleConfirm = () => {
    const draft = JSON.parse(localStorage.getItem('client_booking_draft') || '{}');
    if (!draft.service || !draft.client || !draft.date || !draft.time) {
      alert('Erro: Dados incompletos. Por favor, reinicie o agendamento.');
      return;
    }

    const newAppointment = {
      id: Date.now().toString(),
      clientName: draft.client.name,
      serviceName: draft.service.name,
      professionalName: draft.professional?.name || 'Qualquer profissional',
      date: new Date(`${draft.date}T${draft.time}:00`).toISOString(),
      duration: draft.service.duration,
      status: 'Confirmed',
      paymentMethod: method,
      price: draft.service.price
    };

    const existingAppointments = JSON.parse(localStorage.getItem('shop_appointments') || '[]');
    localStorage.setItem('shop_appointments', JSON.stringify([...existingAppointments, newAppointment]));

    // Clear draft
    localStorage.removeItem('client_booking_draft');

    navigate('/client/book/confirmation');
  };

  // Load draft data for summary
  const [summary, setSummary] = useState<any>(null);
  React.useEffect(() => {
    const draft = JSON.parse(localStorage.getItem('client_booking_draft') || '{}');
    setSummary(draft);
  }, []);

  if (!summary) return <div>Carregando...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Revisão e Pagamento</h1>
          <p className="text-text-muted text-sm">Confira os detalhes e finalize.</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-bold text-white border-b border-border pb-2">Resumo do Pedido</h3>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Serviço</span>
          <span className="font-medium text-white">{summary?.service?.name || '...'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Profissional</span>
          <span className="font-medium text-white">{summary?.professional?.name || 'Qualquer profissional'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Data e Hora</span>
          <span className="font-medium text-white">{summary?.date ? `${summary.date.split('-').reverse().join('/')} às ${summary.time}` : '...'}</span>
        </div>
        <div className="flex justify-between text-base pt-2 border-t border-border font-bold">
          <span className="text-white">Total</span>
          <span className="text-primary">R$ {summary?.service?.price?.toFixed(2).replace('.', ',') || '0,00'}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-3">
        <h3 className="font-bold text-white">Forma de Pagamento</h3>
        <div className="space-y-2">
          {[
            { id: 'pix', label: 'Pix (Instantâneo)', icon: <div className="w-5 h-5 bg-teal-500 rounded-sm flex items-center justify-center text-[10px] text-white font-bold">Px</div> },
            { id: 'card', label: 'Cartão de Crédito', icon: <CreditCard size={20} /> },
            { id: 'store', label: 'Pagar na Loja', icon: <Store size={20} /> },
          ].map((opt) => (
            <div
              key={opt.id}
              onClick={() => setMethod(opt.id)}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all
                        ${method === opt.id
                  ? 'bg-primary/5 border-primary shadow-sm'
                  : 'bg-surface border-border hover:border-primary/50'}
                    `}
            >
              <div className="flex items-center gap-3 text-white">
                {opt.icon}
                <span className="font-medium">{opt.label}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                        ${method === opt.id ? 'border-primary bg-primary text-white' : 'border-border'}
                    `}>
                {method === opt.id && <CheckCircle size={12} fill="currentColor" className="text-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        className="w-full py-3.5 rounded-xl bg-success hover:bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-900/20 transition-all"
      >
        Confirmar Agendamento
      </button>
    </div>
  );
};
