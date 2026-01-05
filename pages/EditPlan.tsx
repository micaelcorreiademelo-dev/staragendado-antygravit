
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, ChevronRight, AlertCircle, CheckSquare, Square, Infinity } from 'lucide-react';
import { Plan } from '../types';
import { plansService, Plan as ApiPlan } from '../services/plans.service';

const defaultEmptyPlan: Plan = {
  id: '',
  name: '',
  price: '',
  vigencia_dias: 30,
  description: '',
  professionalsLimit: 0,
  appointmentsLimit: 0,
  services: [],
  features: {
    onlinePayments: false,
    calendarIntegration: false,
    apiAccess: false,
    whatsappNotifications: false,
    emailNotifications: false
  },
  displayFeatures: [],
  active: true,
  highlight: false,
  hidden: false
};

export const EditPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Plan>(defaultEmptyPlan);
  const [newService, setNewService] = useState('');

  // Local states for "Unlimited" toggles
  const [isProfUnlimited, setIsProfUnlimited] = useState(false);
  const [isAppUnlimited, setIsAppUnlimited] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (id === 'new') {
          setFormData({ ...defaultEmptyPlan, id: Date.now() }); // Temporary ID for new
        } else {
          const plans = await plansService.getAll();
          const foundPlan = plans.find(p => p.id.toString() === id);

          if (foundPlan) {
            setFormData({
              id: foundPlan.id,
              name: foundPlan.nome,
              price: foundPlan.price ? foundPlan.price.toString().replace('.', ',') : '',
              vigencia_dias: foundPlan.vigencia_dias || 30,
              description: foundPlan.description || '',
              professionalsLimit: foundPlan.limite_profissionais,
              appointmentsLimit: foundPlan.limite_agendamentos,
              services: foundPlan.features?.services || [],
              displayFeatures: foundPlan.features?.displayFeatures || [],
              active: foundPlan.active ?? true,
              highlight: foundPlan.highlight ?? false,
              features: {
                onlinePayments: foundPlan.permite_pagamentos_online,
                calendarIntegration: foundPlan.permite_integracao_calendar,
                apiAccess: foundPlan.features?.apiAccess || false,
                whatsappNotifications: foundPlan.features?.whatsappNotifications || false,
                emailNotifications: foundPlan.features?.emailNotifications || false
              },
              hidden: foundPlan.hidden || false
            });
            // Set initial unlimited states
            setIsProfUnlimited(foundPlan.limite_profissionais === -1);
            setIsAppUnlimited(foundPlan.limite_agendamentos === -1);
          } else {
            navigate('/plans');
          }
        }
      } catch (error) {
        console.error("Erro ao carregar plano:", error);
        navigate('/plans');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  // Handlers for Unlimited Toggles
  const toggleProfUnlimited = () => {
    const newValue = !isProfUnlimited;
    setIsProfUnlimited(newValue);
    setFormData(prev => ({
      ...prev,
      professionalsLimit: newValue ? -1 : 0
    }));
  };

  const toggleAppUnlimited = () => {
    const newValue = !isAppUnlimited;
    setIsAppUnlimited(newValue);
    setFormData(prev => ({
      ...prev,
      appointmentsLimit: newValue ? -1 : 0
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        nome: formData.name,
        price: parseFloat(formData.price.replace(',', '.')) || 0,
        description: formData.description,
        limite_profissionais: isProfUnlimited ? -1 : formData.professionalsLimit,
        limite_agendamentos: isAppUnlimited ? -1 : formData.appointmentsLimit,
        vigencia_dias: formData.vigencia_dias || 30,
        permite_pagamentos_online: formData.features.onlinePayments,
        permite_integracao_calendar: formData.features.calendarIntegration,
        active: formData.active,
        highlight: formData.highlight,
        hidden: formData.hidden,
        features: {
          apiAccess: formData.features.apiAccess,
          whatsappNotifications: formData.features.whatsappNotifications,
          emailNotifications: formData.features.emailNotifications,
          services: formData.services,
          displayFeatures: formData.displayFeatures
        }
      };

      if (id === 'new') {
        await plansService.create(payload as any);
      } else {
        // Se id existir e não for 'new', update
        if (id) await plansService.update(id, payload as any);
      }

      navigate('/plans');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Erro ao salvar plano. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s !== serviceToRemove)
    });
  };

  const handleAddService = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newService.trim()) {
      e.preventDefault();
      if (!formData.services.includes(newService.trim())) {
        setFormData({
          ...formData,
          services: [...formData.services, newService.trim()]
        });
        setNewService('');
      }
    }
  };

  const handleToggleFeature = (feature: keyof typeof formData.features) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [feature]: !formData.features[feature]
      }
    });
  };

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className="hover:text-white cursor-pointer" onClick={() => navigate('/dashboard')}>Painel</span>
        <ChevronRight size={14} />
        <span className="hover:text-white cursor-pointer" onClick={() => navigate('/plans')}>Planos</span>
        <ChevronRight size={14} />
        <span className="text-white font-medium">{id === 'new' ? 'Novo Plano' : 'Editar Plano'}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">{id === 'new' ? 'Criar Novo Plano' : `Editar: ${formData.name}`}</h1>
          <p className="text-text-muted mt-1">Gerencie as configurações, preços e limites de uso.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/plans')}
            className="px-4 py-2 rounded-lg border border-border text-white hover:bg-white/5 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Salvando...' : (id === 'new' ? 'Criar Plano' : 'Salvar Alterações')}
          </button>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="bg-surface border border-border rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white border-b border-border pb-4">Informações Básicas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nome do Plano</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Ex: Plano Gold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Preço Mensal (R$)</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Ex: 99,90"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Vigência (Dias)</label>
            <input
              type="number"
              value={formData.vigencia_dias}
              onChange={(e) => setFormData({ ...formData, vigencia_dias: parseInt(e.target.value) || 30 })}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Ex: 30"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white">Descrição Curta</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary outline-none transition-all resize-y"
              placeholder="Ex: Ideal para empresas em crescimento..."
            />
          </div>

          <div className="flex flex-wrap gap-6 md:col-span-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.active ? 'bg-primary border-primary' : 'border-border bg-background'}`}>
                {formData.active && <CheckSquare size={14} className="text-white" />}
              </div>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="hidden"
              />
              <div>
                <span className="text-white text-sm font-medium group-hover:text-primary transition-colors">Plano Ativo</span>
                <p className="text-xs text-text-muted">Visível para novas assinaturas</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.highlight ? 'bg-secondary border-secondary' : 'border-border bg-background'}`}>
                {formData.highlight && <CheckSquare size={14} className="text-white" />}
              </div>
              <input
                type="checkbox"
                checked={formData.highlight}
                onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
                className="hidden"
              />
              <div>
                <span className="text-white text-sm font-medium group-hover:text-secondary transition-colors">Destaque (Popular)</span>
                <p className="text-xs text-text-muted">Recomendado na página de preços</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.hidden ? 'bg-danger border-danger' : 'border-border bg-background'}`}>
                {formData.hidden && <CheckSquare size={14} className="text-white" />}
              </div>
              <input
                type="checkbox"
                checked={formData.hidden}
                onChange={(e) => setFormData({ ...formData, hidden: e.target.checked })}
                className="hidden"
              />
              <div>
                <span className="text-white text-sm font-medium group-hover:text-danger transition-colors">Ocultar do Lojista</span>
                <p className="text-xs text-text-muted">Não aparecerá no painel de compra</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Limits & Capacity Section */}
      <div className="bg-surface border border-border rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white border-b border-border pb-4">Limites e Capacidade</h2>
        <p className="text-sm text-text-muted -mt-2">Defina os limites operacionais. Marque "Ilimitado" para remover restrições.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Professionals Limit */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white">Limite de Profissionais</label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-secondary hover:text-orange-400 transition-colors">
                <input
                  type="checkbox"
                  checked={isProfUnlimited}
                  onChange={toggleProfUnlimited}
                  className="rounded bg-background border-border text-secondary focus:ring-secondary"
                />
                Ilimitado (-1)
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                value={isProfUnlimited ? '' : formData.professionalsLimit}
                disabled={isProfUnlimited}
                onChange={(e) => setFormData({ ...formData, professionalsLimit: parseInt(e.target.value) || 0 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={isProfUnlimited ? "Infinito" : "0"}
              />
              {isProfUnlimited && (
                <div className="absolute inset-0 flex items-center pl-4 pointer-events-none">
                  <Infinity size={20} className="text-white" />
                  <span className="ml-2 text-white font-medium">Infinito</span>
                </div>
              )}
            </div>
          </div>

          {/* Appointments Limit */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white">Limite de Agendamentos/Mês</label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-secondary hover:text-orange-400 transition-colors">
                <input
                  type="checkbox"
                  checked={isAppUnlimited}
                  onChange={toggleAppUnlimited}
                  className="rounded bg-background border-border text-secondary focus:ring-secondary"
                />
                Ilimitado (-1)
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                value={isAppUnlimited ? '' : formData.appointmentsLimit}
                disabled={isAppUnlimited}
                onChange={(e) => setFormData({ ...formData, appointmentsLimit: parseInt(e.target.value) || 0 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={isAppUnlimited ? "Infinito" : "0"}
              />
              {isAppUnlimited && (
                <div className="absolute inset-0 flex items-center pl-4 pointer-events-none">
                  <Infinity size={20} className="text-white" />
                  <span className="ml-2 text-white font-medium">Infinito</span>
                </div>
              )}
            </div>
          </div>

          {/* Services Tags */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-white">Serviços Inclusos (Exibição)</label>
            <div className="w-full bg-background border border-border rounded-lg p-3 min-h-[3.5rem] flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              {formData.services.map((service) => (
                <span key={service} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                  {service}
                  <button onClick={() => handleRemoveService(service)} className="hover:text-white transition-colors rounded-full p-0.5 hover:bg-primary/20">
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={handleAddService}
                placeholder="Digite e pressione Enter..."
                className="bg-transparent border-none text-white placeholder:text-text-muted/50 focus:ring-0 flex-1 min-w-[200px] py-1 px-2 outline-none"
              />
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <AlertCircle size={12} /> Lista de serviços pré-definidos para exibição no card do plano.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-surface border border-border rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white border-b border-border pb-4">Recursos Tecnológicos</h2>

        <div className="grid grid-cols-1 gap-4">
          <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${formData.features.onlinePayments ? 'bg-primary/5 border-primary' : 'bg-background border-border hover:border-primary/30'}`}>
            <div>
              <p className="text-white font-medium">Pagamentos Online</p>
              <p className="text-sm text-text-muted">Permitir checkout transparente e split de pagamento.</p>
            </div>
            <div
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${formData.features.onlinePayments ? 'bg-primary' : 'bg-border'}`}
              onClick={(e) => { e.preventDefault(); handleToggleFeature('onlinePayments'); }}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${formData.features.onlinePayments ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </label>

          <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${formData.features.calendarIntegration ? 'bg-primary/5 border-primary' : 'bg-background border-border hover:border-primary/30'}`}>
            <div>
              <p className="text-white font-medium">Sincronização de Calendário</p>
              <p className="text-sm text-text-muted">Integração bidirecional com Google Calendar/Outlook.</p>
            </div>
            <div
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${formData.features.calendarIntegration ? 'bg-primary' : 'bg-border'}`}
              onClick={(e) => { e.preventDefault(); handleToggleFeature('calendarIntegration'); }}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${formData.features.calendarIntegration ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </label>

          <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${formData.features.apiAccess ? 'bg-primary/5 border-primary' : 'bg-background border-border hover:border-primary/30'}`}>
            <div>
              <p className="text-white font-medium">Acesso à API (Webhooks)</p>
              <p className="text-sm text-text-muted">Para integrações avançadas e sistemas legados.</p>
            </div>
            <div
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${formData.features.apiAccess ? 'bg-primary' : 'bg-border'}`}
              onClick={(e) => { e.preventDefault(); handleToggleFeature('apiAccess'); }}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${formData.features.apiAccess ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </label>

          <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${formData.features.whatsappNotifications ? 'bg-primary/5 border-primary' : 'bg-background border-border hover:border-primary/30'}`}>
            <div>
              <p className="text-white font-medium">Notificações WhatsApp</p>
              <p className="text-sm text-text-muted">Envio automático de lembretes e confirmações.</p>
            </div>
            <div
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${formData.features.whatsappNotifications ? 'bg-primary' : 'bg-border'}`}
              onClick={(e) => { e.preventDefault(); handleToggleFeature('whatsappNotifications'); }}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${formData.features.whatsappNotifications ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </label>

          <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${formData.features.emailNotifications ? 'bg-primary/5 border-primary' : 'bg-background border-border hover:border-primary/30'}`}>
            <div>
              <p className="text-white font-medium">Notificações por E-mail</p>
              <p className="text-sm text-text-muted">Disparos transacionais ilimitados.</p>
            </div>
            <div
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${formData.features.emailNotifications ? 'bg-primary' : 'bg-border'}`}
              onClick={(e) => { e.preventDefault(); handleToggleFeature('emailNotifications'); }}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${formData.features.emailNotifications ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
