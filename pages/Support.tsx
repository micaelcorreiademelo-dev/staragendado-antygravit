import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CreditCard, Ban, CheckCircle, Wrench, MessageSquare, Send, Play } from 'lucide-react';
import { Store, StoreStatus, ChatMessage, Notification } from '../types';
import { ChatWidget } from '../components/ChatWidget';

export const Support = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'chat' | 'notify'>('tools');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchStoreAndData = () => {
      const storedStores = localStorage.getItem('app_stores');
      if (storedStores) {
        const stores: Store[] = JSON.parse(storedStores);
        const found = stores.find(s => s.id === id);
        if (found) {
          setStore(found);
          setSelectedPlan(found.plan);
          const storedMessages = localStorage.getItem(`chat_messages_${id}`);
          setMessages(storedMessages ? JSON.parse(storedMessages) : []);
        }
      }
      setLoading(false);
    };
    fetchStoreAndData();

    // Poll for new messages from shop
    const interval = setInterval(() => {
      if (id) {
        const storedMessages = localStorage.getItem(`chat_messages_${id}`);
        setMessages(storedMessages ? JSON.parse(storedMessages) : []);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateStoreInStorage = (updatedStore: Store) => {
    const storedData = localStorage.getItem('app_stores');
    if (storedData) {
      const stores: Store[] = JSON.parse(storedData);
      const newStores = stores.map(s => s.id === updatedStore.id ? updatedStore : s);
      localStorage.setItem('app_stores', JSON.stringify(newStores));
      setStore(updatedStore);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!store) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      storeId: store.id,
      sender: 'admin',
      text,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_messages_${store.id}`, JSON.stringify(updatedMessages));
  };

  const handleSendNotification = (e: React.FormEvent) => {
      e.preventDefault();
      if (!store || !notificationTitle || !notificationMessage) return;

      const newNotification: Notification = {
          id: Date.now().toString(),
          storeId: store.id,
          title: notificationTitle,
          message: notificationMessage,
          timestamp: new Date().toISOString(),
          read: false,
      };

      const storedNotifications = localStorage.getItem(`app_notifications_${store.id}`);
      const currentNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
      const updatedNotifications = [newNotification, ...currentNotifications];
      localStorage.setItem(`app_notifications_${store.id}`, JSON.stringify(updatedNotifications));
      
      showToast('Notificação enviada com sucesso!');
      setNotificationTitle('');
      setNotificationMessage('');
  };

  const handleResetPassword = () => {
    if (!store) return;
    showToast(`Link de redefinição enviado para ${store.email}`);
  };

  const handleUpdatePlan = () => {
    if (!store) return;
    const updated = { ...store, plan: selectedPlan };
    updateStoreInStorage(updated);
    showToast(`Plano alterado para ${selectedPlan} com sucesso!`);
  };

  const handleToggleStatus = () => {
    if (!store) return;
    const newStatus = store.status === StoreStatus.BLOCKED ? StoreStatus.ACTIVE : StoreStatus.BLOCKED;
    const updated = { ...store, status: newStatus };
    updateStoreInStorage(updated);
    showToast(newStatus === StoreStatus.BLOCKED ? 'Conta desativada/bloqueada.' : 'Conta reativada com sucesso.');
  };

  if (loading) return <div className="p-8 text-white">Carregando...</div>;
  if (!store) return <div className="p-8 text-white">Loja não encontrada.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <button onClick={() => navigate('/support')} className="flex items-center gap-2 text-text-muted hover:text-white mb-2">
            <ArrowLeft size={20} /> Voltar para Lojas
          </button>
          <h1 className="text-3xl font-black text-white">Suporte ao Lojista</h1>
          <p className="text-text-muted">Gerenciando: <span className="text-white font-bold">{store.name}</span></p>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button onClick={() => setActiveTab('tools')} className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${activeTab === 'tools' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-white'}`}>
          <Wrench size={16} /> Ferramentas
        </button>
        <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-white'}`}>
          <MessageSquare size={16} /> Chat
        </button>
        <button onClick={() => setActiveTab('notify')} className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${activeTab === 'notify' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-white'}`}>
          <Send size={16} /> Enviar Notificação
        </button>
      </div>

      <div className="pt-4">
        {activeTab === 'tools' && (
           <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Reset de Senha</h3>
                        <p className="text-text-muted text-sm">Um e-mail será enviado para o lojista com instruções para criar uma nova senha.</p>
                    </div>
                    <button onClick={handleResetPassword} className="mt-6 w-full bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
                        <Lock size={18} /> Enviar Link de Reset
                    </button>
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Gerenciamento de Plano</h3>
                        <label className="text-sm text-text-muted block mb-2">Selecione o novo plano</label>
                        <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-primary">
                            <option value="Básico">Básico</option>
                            <option value="Profissional">Profissional</option>
                            <option value="Premium">Premium</option>
                        </select>
                    </div>
                    <button onClick={handleUpdatePlan} className="mt-6 w-full bg-secondary hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
                        <CreditCard size={18} /> Salvar Alterações
                    </button>
                </div>
              </div>
              <div className={`bg-surface border rounded-xl p-6 transition-colors ${store.status === StoreStatus.BLOCKED ? 'border-success/30' : 'border-danger/30'}`}>
                <h3 className="text-lg font-bold text-white mb-4">Manutenção da Conta</h3>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-border">
                    <div>
                        <h4 className="font-semibold text-white">{store.status === StoreStatus.BLOCKED ? 'Reativar Conta' : 'Desativar Conta'}</h4>
                        <p className="text-text-muted text-sm">{store.status === StoreStatus.BLOCKED ? 'Isso permitirá que o lojista acesse a plataforma novamente.' : 'Esta ação irá suspender o acesso do lojista à plataforma.'}</p>
                    </div>
                    <button onClick={handleToggleStatus} className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors text-white ${store.status === StoreStatus.BLOCKED ? 'bg-success hover:bg-green-600' : 'bg-danger hover:bg-red-700'}`}>
                        {store.status === StoreStatus.BLOCKED ? <Play size={18} /> : <Ban size={18} />}
                        {store.status === StoreStatus.BLOCKED ? 'Reativar Conta' : 'Desativar Conta'}
                    </button>
                </div>
              </div>
           </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="bg-surface border border-border rounded-xl h-[600px] flex flex-col animate-in fade-in">
              <ChatWidget
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  title={`Chat com ${store.name}`}
                  currentUserId="admin"
              />
          </div>
        )}

        {activeTab === 'notify' && (
          <form onSubmit={handleSendNotification} className="bg-surface border border-border rounded-xl p-6 space-y-4 animate-in fade-in">
            <h3 className="text-lg font-bold text-white">Enviar Notificação para {store.name}</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Título</label>
              <input value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} required type="text" placeholder="Ex: Atualização Importante" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Mensagem</label>
              <textarea value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} required rows={4} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Digite a mensagem aqui..." />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-colors">
                <Send size={16} /> Enviar
              </button>
            </div>
          </form>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-border p-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <CheckCircle size={20} className="text-primary" />
            <p className="text-white font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};
