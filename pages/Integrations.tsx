
import React, { useState, useEffect } from 'react';
import { Settings, Plus, MessageCircle, CreditCard, Mail, Search, X, Save, Trash2, CheckCircle, AlertCircle, Code, Key } from 'lucide-react';
import { AdminNotificationBell } from '../components/AdminNotificationBell';

// Tipos
interface Integration {
  id: number | string;
  name: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  desc: string;
  type: 'payment' | 'communication' | 'email' | 'other';
  colorClass: string;
}

// Dados Iniciais
const defaultIntegrations: Integration[] = [
  {
    id: 1,
    name: 'Stripe',
    status: 'Ativo',
    desc: 'Processa pagamentos com cartão de crédito e débito globalmente.',
    type: 'payment',
    colorClass: 'text-[#635BFF]'
  },
  {
    id: 2,
    name: 'Mercado Pago',
    status: 'Inativo',
    desc: 'Oferece diversas opções de pagamento para a América Latina.',
    type: 'payment',
    colorClass: 'text-[#009EE3]'
  },
  {
    id: 3,
    name: 'WhatsApp API',
    status: 'Pendente',
    desc: 'Envie notificações e lembretes de agendamento via WhatsApp.',
    type: 'communication',
    colorClass: 'text-[#25D366]'
  }
];

// FIX: Correctly type the component as a React.FC to handle React-specific props like 'key'.
const IntegrationCard: React.FC<{
  data: Integration;
  onToggle: (id: number | string) => void;
  onConfigure: (data: Integration) => void;
}> = ({
  data,
  onToggle,
  onConfigure
}) => {
    const isActive = data.status === 'Ativo';

    const getIcon = () => {
      switch (data.type) {
        case 'payment': return CreditCard;
        case 'communication': return MessageCircle;
        case 'email': return Mail;
        default: return Settings;
      }
    };

    const Icon = getIcon();

    return (
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-primary/50 transition-all">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-lg h-14 w-14 flex items-center justify-center shrink-0 shadow-sm">
            <Icon className={data.colorClass} size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{data.name}</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-success' : data.status === 'Pendente' ? 'bg-secondary' : 'bg-danger'}`}></div>
              <span className={`text-sm font-medium ${isActive ? 'text-success' : data.status === 'Pendente' ? 'text-secondary' : 'text-danger'}`}>
                {data.status}
              </span>
            </div>
          </div>

          <button
            onClick={() => onToggle(data.id)}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isActive ? 'bg-success' : 'bg-border'}`}
            title={isActive ? 'Desativar' : 'Ativar'}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isActive ? 'left-[calc(100%-22px)]' : 'left-0.5'}`} />
          </button>
        </div>

        <p className="text-text-muted text-sm flex-1 line-clamp-2">{data.desc}</p>

        <button
          onClick={() => onConfigure(data)}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-background border border-border text-white font-bold text-sm hover:bg-primary hover:border-primary hover:text-white transition-colors"
        >
          <Settings size={16} />
          Configurar
        </button>
      </div>
    );
  };

export const Integrations = () => {
  // Estados
  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    const saved = localStorage.getItem('app_integrations');
    return saved ? JSON.parse(saved) : defaultIntegrations;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    type: 'other',
    apiKey: '',
    webhookUrl: '',
    isActive: false
  });

  // Persistência
  useEffect(() => {
    localStorage.setItem('app_integrations', JSON.stringify(integrations));
  }, [integrations]);

  // Handlers
  const handleToggleStatus = (id: number | string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'Ativo' ? 'Inativo' : 'Ativo';
        return { ...item, status: newStatus };
      }
      return item;
    }));
    showFeedback('Status da integração atualizado.');
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      desc: '',
      type: 'other',
      apiKey: '',
      webhookUrl: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (data: Integration) => {
    setEditingId(data.id);
    setFormData({
      name: data.name,
      desc: data.desc,
      type: data.type as string,
      apiKey: 'sk_live_********************', // Simulação
      webhookUrl: `https://api.agendamento.com/webhooks/${data.id}`, // Simulação
      isActive: data.status === 'Ativo'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newIntegration: Integration = {
      id: editingId || Date.now(),
      name: formData.name,
      desc: formData.desc,
      status: formData.isActive ? 'Ativo' : 'Inativo',
      type: formData.type as any,
      colorClass: 'text-primary' // Default color
    };

    if (editingId) {
      setIntegrations(prev => prev.map(i => i.id === editingId ? { ...newIntegration, colorClass: i.colorClass } : i));
      showFeedback('Integração atualizada com sucesso!');
    } else {
      setIntegrations(prev => [...prev, newIntegration]);
      showFeedback('Nova integração adicionada!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingId && confirm('Tem certeza que deseja remover esta integração?')) {
      setIntegrations(prev => prev.filter(i => i.id !== editingId));
      setIsModalOpen(false);
      showFeedback('Integração removida.');
    }
  };

  const showFeedback = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Filtros
  const filteredIntegrations = integrations.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupamento
  const paymentIntegrations = filteredIntegrations.filter(i => i.type === 'payment');
  const commIntegrations = filteredIntegrations.filter(i => i.type === 'communication');
  const emailIntegrations = filteredIntegrations.filter(i => i.type === 'email');
  const otherIntegrations = filteredIntegrations.filter(i => i.type === 'other');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Gerenciamento de Integrações</h1>
          <p className="text-text-muted mt-1">Gerencie as conexões com serviços externos e APIs.</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminNotificationBell />
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-secondary hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-orange-900/20"
          >
            <Plus size={20} />
            Adicionar Integração
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-surface border border-border rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
          placeholder="Buscar por nome ou categoria..."
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <Search size={20} />
        </div>
      </div>

      {/* Sections */}
      {paymentIntegrations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard size={24} className="text-primary" />
            Gateways de Pagamento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentIntegrations.map(item => (
              <IntegrationCard key={item.id} data={item} onToggle={handleToggleStatus} onConfigure={handleOpenEdit} />
            ))}
          </div>
        </section>
      )}

      {commIntegrations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle size={24} className="text-success" />
            Comunicação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commIntegrations.map(item => (
              <IntegrationCard key={item.id} data={item} onToggle={handleToggleStatus} onConfigure={handleOpenEdit} />
            ))}
          </div>
        </section>
      )}

      {emailIntegrations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail size={24} className="text-text-muted" />
            E-mail Transacional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emailIntegrations.map(item => (
              <IntegrationCard key={item.id} data={item} onToggle={handleToggleStatus} onConfigure={handleOpenEdit} />
            ))}
          </div>
        </section>
      )}

      {otherIntegrations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings size={24} className="text-text-muted" />
            Outras Integrações
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherIntegrations.map(item => (
              <IntegrationCard key={item.id} data={item} onToggle={handleToggleStatus} onConfigure={handleOpenEdit} />
            ))}
          </div>
        </section>
      )}

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12 text-text-muted bg-surface border border-border rounded-xl border-dashed">
          <p>Nenhuma integração encontrada.</p>
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-background/50 shrink-0">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Configurar Integração' : 'Nova Integração'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Nome da Integração</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Slack, Zapier..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Categoria</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="payment">Pagamento</option>
                    <option value="communication">Comunicação</option>
                    <option value="email">E-mail</option>
                    <option value="other">Outros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Status</label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Descrição</label>
                <textarea
                  rows={2}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="Para que serve esta integração?"
                />
              </div>

              {/* Mock Technical Configs */}
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center gap-2 text-text-muted text-xs uppercase font-bold tracking-wider">
                  <Settings size={12} /> Configurações Técnicas
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Key size={14} className="text-text-muted" /> API Key
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="sk_..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Code size={14} className="text-text-muted" /> Webhook URL
                  </label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-2 items-start p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-text-muted">
                    As chaves de API são armazenadas de forma criptografada. Nunca compartilhe suas credenciais.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center sticky bottom-0 bg-surface pb-2 border-t border-border mt-4 pt-4">
                {editingId ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-danger hover:bg-danger/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-border text-text-muted hover:text-white transition-colors font-medium text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-colors text-sm shadow-lg shadow-blue-900/20"
                  >
                    <Save size={16} />
                    Salvar Configuração
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[150] bg-surface border border-border p-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="p-1 bg-success/20 rounded-full text-success">
            <CheckCircle size={20} />
          </div>
          <p className="text-white font-medium">{toastMsg}</p>
        </div>
      )}
    </div>
  );
};
