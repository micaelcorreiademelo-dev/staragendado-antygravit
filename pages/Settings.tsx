
import React, { useState } from 'react';
import { Save, FileText, Bell, Globe, Mail, Smartphone, Clock, CheckCircle } from 'lucide-react';
import { AdminNotificationBell } from '../components/AdminNotificationBell';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<'terms' | 'notifications' | 'general'>('terms');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- States for Terms Tab ---
  const [termsContent, setTermsContent] = useState(
    '# Termos de Uso do SaaS Agendamento\n\n1. Aceitação dos Termos\nAo acessar e usar nossa plataforma, você concorda com os termos descritos abaixo.\n\n2. Responsabilidades do Lojista\nO lojista é responsável por manter a confidencialidade de sua conta e senha.'
  );
  const [privacyContent, setPrivacyContent] = useState(
    '# Política de Privacidade\n\nColetamos dados para melhorar sua experiência. Seus dados são armazenados de forma segura e criptografada.\n\n1. Coleta de Dados\nColetamos nome, e-mail e dados de uso da plataforma.'
  );
  const [requireTerms, setRequireTerms] = useState(true);

  // --- States for Notifications Tab ---
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // --- States for General Tab ---
  const [systemName, setSystemName] = useState('SaaS Agendamento');
  const [supportEmail, setSupportEmail] = useState('suporte@agendamento.com');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [language, setLanguage] = useState('pt-BR');

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const renderTermsTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Terms Editor */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Termos de Uso Padrão</h2>
        <p className="text-sm text-text-muted">Edite o conteúdo que será exibido aos usuários no momento do cadastro.</p>
        <textarea
          value={termsContent}
          onChange={(e) => setTermsContent(e.target.value)}
          className="w-full h-48 bg-background border border-border rounded-lg p-4 text-white placeholder:text-text-muted font-mono text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y"
          placeholder="Digite os termos de uso aqui..."
        />
      </div>

      {/* Privacy Policy */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Política de Privacidade</h2>
        <p className="text-sm text-text-muted">Defina como os dados dos usuários serão tratados.</p>
        <textarea
          value={privacyContent}
          onChange={(e) => setPrivacyContent(e.target.value)}
          className="w-full h-48 bg-background border border-border rounded-lg p-4 text-white placeholder:text-text-muted font-mono text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y"
          placeholder="Digite a política de privacidade aqui..."
        />
      </div>

      {/* Toggles */}
      <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-white font-medium">Exigir aceite dos termos no cadastro</p>
            <p className="text-text-muted text-sm">Novos usuários devem marcar a caixa de seleção obrigatória.</p>
          </div>
        </div>
        <button
          onClick={() => setRequireTerms(!requireTerms)}
          className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${requireTerms ? 'bg-secondary' : 'bg-border'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${requireTerms ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white mb-6">Canais de Comunicação do Sistema</h2>

        {/* Email Alerts */}
        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <div className="flex gap-4 items-center">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-white font-medium">Alertas por E-mail</p>
              <p className="text-text-muted text-sm">Enviar notificações de sistema e faturas por e-mail.</p>
            </div>
          </div>
          <button
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${emailAlerts ? 'bg-secondary' : 'bg-border'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${emailAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* SMS Alerts */}
        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <div className="flex gap-4 items-center">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <Smartphone size={24} />
            </div>
            <div>
              <p className="text-white font-medium">Alertas por SMS</p>
              <p className="text-text-muted text-sm">Permitir envio de alertas críticos via SMS.</p>
            </div>
          </div>
          <button
            onClick={() => setSmsAlerts(!smsAlerts)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${smsAlerts ? 'bg-secondary' : 'bg-border'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${smsAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Security Alerts */}
        <div className="flex items-center justify-between py-4">
          <div className="flex gap-4 items-center">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <Bell size={24} />
            </div>
            <div>
              <p className="text-white font-medium">Alertas de Segurança</p>
              <p className="text-text-muted text-sm">Notificar administradores sobre logins suspeitos.</p>
            </div>
          </div>
          <button
            onClick={() => setSecurityAlerts(!securityAlerts)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${securityAlerts ? 'bg-secondary' : 'bg-border'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${securityAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white mb-4">Informações do Sistema</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nome do Sistema</label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">E-mail de Suporte</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Clock size={16} /> Fuso Horário Padrão
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            >
              <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="Europe/London">London (GMT+0)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Globe size={16} /> Idioma Padrão
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações Globais</h1>
          <p className="text-text-muted">Ajustes que afetam toda a plataforma.</p>
        </div>
        <AdminNotificationBell />
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-border overflow-x-auto gap-8">
        <button
          onClick={() => setActiveTab('terms')}
          className={`pb-4 border-b-[3px] font-bold text-sm transition-colors whitespace-nowrap px-2 ${activeTab === 'terms'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-white'
            }`}
        >
          Termos e Políticas
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-4 border-b-[3px] font-bold text-sm transition-colors whitespace-nowrap px-2 ${activeTab === 'notifications'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-white'
            }`}
        >
          Notificações
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-4 border-b-[3px] font-bold text-sm transition-colors whitespace-nowrap px-2 ${activeTab === 'general'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-white'
            }`}
        >
          Geral
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'terms' && renderTermsTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'general' && renderGeneralTab()}
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <button className="px-6 py-2.5 rounded-lg bg-background border border-border text-text-muted hover:text-white hover:bg-white/5 transition-colors font-medium">
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all
            ${showSuccess ? 'bg-success hover:bg-success' : 'bg-secondary hover:bg-orange-600 shadow-orange-900/20'}
            ${isSaving ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : showSuccess ? (
            <CheckCircle size={18} />
          ) : (
            <Save size={18} />
          )}
          {showSuccess ? 'Salvo!' : isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};
