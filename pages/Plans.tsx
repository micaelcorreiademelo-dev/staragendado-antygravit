
import React, { useState, useEffect } from 'react';
import { CheckCircle, Edit, Trash2, Plus, Check, EyeOff, Settings, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Plan } from '../types';
import { plansService } from '../services/plans.service';
import { AdminNotificationBell } from '../components/AdminNotificationBell';

const defaultPlans: Plan[] = [
  {
    id: 1,
    name: 'Plano Básico',
    price: '49,90',
    description: 'Ideal para profissionais autônomos.',
    professionalsLimit: 2,
    appointmentsLimit: 100,
    services: [],
    features: { onlinePayments: true, calendarIntegration: false, apiAccess: false },
    displayFeatures: [],
    active: true,
    highlight: false
  },
  {
    id: 2,
    name: 'Plano Profissional',
    price: '99,90',
    description: 'Para equipes em crescimento.',
    professionalsLimit: 10,
    appointmentsLimit: 500,
    services: [],
    features: { onlinePayments: true, calendarIntegration: true, apiAccess: false },
    displayFeatures: [],
    active: true,
    highlight: true
  },
  {
    id: 3,
    name: 'Plano Enterprise',
    price: 'Custom',
    description: 'Soluções personalizadas.',
    professionalsLimit: -1,
    appointmentsLimit: -1,
    services: [],
    features: { onlinePayments: true, calendarIntegration: true, apiAccess: true },
    displayFeatures: [],
    active: false,
    highlight: false
  }
];

export const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(false);
  const [selectedDefaultPlanId, setSelectedDefaultPlanId] = useState<string>('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await plansService.getAll();
      // Map API data to UI format if needed, or use directly if interfaces match
      // The UI currently expects 'name' but API returns 'nome'. Let's map it.
      const mappedPlans = data.map(p => ({
        ...p,
        name: p.nome, // Map nome to name for UI compatibility
        price: p.price ? p.price.toString().replace('.', ',') : '0,00',
        features: {
          onlinePayments: p.permite_pagamentos_online,
          calendarIntegration: p.permite_integracao_calendar,
          apiAccess: false, // Default or add to DB
          whatsappNotifications: p.features?.whatsappNotifications || false,
          emailNotifications: p.features?.emailNotifications || false
        },
        services: [], // Placeholder
        professionalsLimit: p.limite_profissionais,
        appointmentsLimit: p.limite_agendamentos,
        vigencia: p.vigencia_dias || 30,
        hidden: p.hidden || false,
        is_default: p.is_default || false
      }));
      setPlans(mappedPlans as any); // Type assertion for now to bridge the gap
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) {
      try {
        await plansService.delete(id.toString());
        setPlans(plans.filter(p => p.id !== id));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Erro ao excluir plano.');
      }
    }
  };

  const handleSetDefault = async () => {
    if (!selectedDefaultPlanId) return;
    try {
      await plansService.setDefault(selectedDefaultPlanId);
      setIsDefaultModalOpen(false);
      loadPlans(); // Reload to update UI
    } catch (error) {
      console.error('Error setting default plan:', error);
      alert('Erro ao definir plano padrão.');
    }
  };

  // Helper to generate display features based on data rules
  const getDisplayFeatures = (plan: any) => {
    const profLimitText = plan.professionalsLimit === -1
      ? 'Profissionais ilimitados'
      : `Até ${plan.professionalsLimit} profissionais`;

    const appLimitText = plan.appointmentsLimit === -1
      ? 'Agendamentos ilimitados'
      : `${plan.appointmentsLimit} agendamentos/mês`;

    const features = [
      `Vigência: ${plan.vigencia || 30} dias`,
      profLimitText,
      appLimitText,
      plan.features?.onlinePayments ? 'Pagamentos Online' : null,
      plan.features?.calendarIntegration ? 'Sincronização de Agenda' : null,
      plan.features?.apiAccess ? 'Acesso à API' : null,
      plan.features?.whatsappNotifications ? 'Notificações WhatsApp' : null,
      plan.features?.emailNotifications ? 'Notificações E-mail' : null,
    ].filter(Boolean) as string[];

    return features;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-white">Carregando planos...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciamento de Planos</h1>
          <p className="text-text-muted mt-1">Crie, edite e gerencie os planos de assinatura e seus limites.</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminNotificationBell />
          <button
            onClick={() => setIsDefaultModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-surface border border-border px-4 py-3 text-white font-medium hover:bg-white/5 transition-colors"
          >
            <Settings size={20} />
            Definir Padrão
          </button>
          <button
            onClick={() => navigate('/plans/edit/new')}
            className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20"
          >
            <Plus size={20} />
            Criar Novo Plano
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {plans.map((plan: any) => (
          <div
            key={plan.id}
            className={`
              relative flex flex-col rounded-xl bg-surface p-6 border transition-all duration-200
              ${plan.highlight ? 'border-primary ring-1 ring-primary shadow-lg shadow-blue-900/20' : 'border-border hover:border-primary/50'}
              ${!plan.active ? 'opacity-75' : ''}
            `}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
                Popular
              </div>
            )}
            {plan.is_default && (
              <div className="absolute -top-3 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm z-20 flex items-center gap-1">
                <Star size={10} fill="white" /> Padrão
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${plan.active ? 'bg-success/10 text-success border-success/20' : 'bg-text-muted/10 text-text-muted border-text-muted/20'}`}>
                {plan.active ? 'Ativo' : 'Inativo'}
              </span>
              {plan.hidden && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-orange-500/10 text-orange-500 border-orange-500/20 ml-2">
                  <EyeOff size={12} />
                  Oculto
                </span>
              )}
            </div>

            <p className="text-text-muted text-sm min-h-[40px]">{plan.description}</p>

            <div className="my-6 border-b border-border pb-6">
              <span className="text-4xl font-black text-white">{plan.price === 'Custom' ? '' : 'R$ '}{plan.price}</span>
              {plan.price !== 'Custom' && <span className="text-text-muted">/mês</span>}
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {getDisplayFeatures(plan).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-text-muted">
                  <CheckCircle size={20} className="text-primary shrink-0" />
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => navigate(`/plans/edit/${plan.id}`)}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-background border border-border text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-background border border-border text-danger hover:bg-danger/10 transition-colors"
                title="Excluir Plano"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-border p-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="p-1 bg-danger/20 rounded-full text-danger">
            <Trash2 size={20} />
          </div>
          <p className="text-white font-medium">Plano excluído com sucesso.</p>
        </div>
      )}

      {/* Default Plan Modal */}
      {isDefaultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Definir Plano Inicial</h3>
            <p className="text-text-muted text-sm">
              Escolha qual plano será atribuído automaticamente às novas lojas criadas.
            </p>

            <select
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
              value={selectedDefaultPlanId}
              onChange={(e) => setSelectedDefaultPlanId(e.target.value)}
            >
              <option value="">Selecione um plano...</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.hidden ? '(Oculto)' : ''}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDefaultModalOpen(false)}
                className="px-4 py-2 hover:text-white text-text-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSetDefault}
                disabled={!selectedDefaultPlanId}
                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
