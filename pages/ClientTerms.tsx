import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const ClientTerms = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-2xl font-black text-white">Termos e Políticas</h1>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-6 text-text-muted">
        <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Agendamentos e Cancelamentos</h2>
            <p>
                Solicitamos que os cancelamentos sejam feitos com pelo menos 24 horas de antecedência.
                Cancelamentos tardios ou o não comparecimento podem estar sujeitos a taxas de acordo com a política da loja.
            </p>
        </section>

        <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Privacidade de Dados</h2>
            <p>
                Seus dados pessoais (nome, telefone, e-mail) são utilizados apenas para gerenciar seus agendamentos e enviar lembretes.
                Não compartilhamos suas informações com terceiros para fins de marketing sem seu consentimento.
            </p>
        </section>

        <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Pagamentos</h2>
            <p>
                Pagamentos online são processados de forma segura. Em caso de cancelamento dentro do prazo, o reembolso será processado conforme a política de reembolso da loja.
            </p>
        </section>
      </div>
    </div>
  );
};
