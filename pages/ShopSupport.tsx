import React, { useState, useEffect } from 'react';
import { LifeBuoy, MessageSquare, Bell, Search } from 'lucide-react';
import { SupportArticle, ChatMessage, Notification } from '../../types';
import { ChatWidget } from '../../components/ChatWidget';

const mockArticles: SupportArticle[] = [
  { id: '1', category: 'Primeiros Passos', title: 'Como configurar seu horário de funcionamento', content: 'Vá para a aba Horários e defina os dias e horários de trabalho da sua loja. Você pode adicionar intervalos e aplicar a mesma configuração para todos os dias.' },
  { id: '2', category: 'Serviços', title: 'Adicionando um novo serviço à sua loja', content: 'Na aba Serviços, clique em "Adicionar Novo Serviço". Preencha nome, duração, preço e defina quais profissionais podem realizar este serviço.' },
  { id: '3', category: 'Pagamentos', title: 'Como configurar o pagamento com Pix', content: 'Na aba Pagamentos, ative a cobrança online e certifique-se de que "Pix" está selecionado como método de pagamento.' },
  { id: '4', category: 'Agenda', title: 'Como realizar um agendamento manual', content: 'Na aba Agenda, clique no botão "Novo Agendamento" ou diretamente no horário desejado no calendário para abrir o formulário.' },
];

export const ShopSupport = () => {
  const [activeTab, setActiveTab] = useState<'help' | 'chat' | 'notifications'>('help');
  const [searchTerm, setSearchTerm] = useState('');

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('app_notifications_1');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chat_messages_1');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const interval = setInterval(() => {
        const savedMessages = localStorage.getItem('chat_messages_1');
        setMessages(savedMessages ? JSON.parse(savedMessages) : []);
    }, 2000); // Poll for new messages
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      storeId: '1',
      sender: 'shop',
      text,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chat_messages_1', JSON.stringify(updatedMessages));
  };
  
  const filteredArticles = mockArticles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'help':
        return (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20}/>
              <input 
                type="text" 
                placeholder="Busque por tutoriais ou FAQs..." 
                className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              {filteredArticles.map(article => (
                <div key={article.id} className="bg-surface border border-border p-4 rounded-lg hover:border-primary/50 transition-colors">
                  <span className="text-xs font-bold text-primary uppercase">{article.category}</span>
                  <h3 className="font-bold text-white mt-1">{article.title}</h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2">{article.content}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'chat':
        return (
            <div className="bg-surface border border-border rounded-xl h-[600px] flex flex-col">
              <ChatWidget
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  title="Fale com o Suporte"
                  currentUserId="shop"
              />
            </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n.id} className={`p-4 rounded-lg border ${n.read ? 'border-border bg-surface' : 'border-primary/50 bg-primary/10'}`}>
                <p className="font-bold text-white">{n.title}</p>
                <p className="text-sm text-text-muted mt-1">{n.message}</p>
                <p className="text-xs text-text-muted/50 mt-3">{new Date(n.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            )) : <p className="text-center text-text-muted py-10">Nenhuma notificação.</p>}
          </div>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-black text-white">Central de Suporte</h1>
        <p className="text-text-muted mt-1">Encontre ajuda, fale conosco e veja seus avisos.</p>
      </div>

      <div className="flex border-b border-border">
        {[
          { id: 'help', label: 'Ajuda e FAQs', icon: LifeBuoy },
          { id: 'chat', label: 'Falar com Suporte', icon: MessageSquare },
          { id: 'notifications', label: 'Histórico de Avisos', icon: Bell },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>
      
      <div>{renderContent()}</div>
    </div>
  );
};