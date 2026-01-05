import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatWidgetProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  title: string;
  currentUserId: 'admin' | 'shop';
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ messages, onSendMessage, title, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('');
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border shrink-0">
        <h3 className="font-bold text-white text-center">{title}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender === currentUserId;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl ${isCurrentUser ? 'bg-primary text-white rounded-br-md' : 'bg-background text-white rounded-bl-md'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs opacity-50 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 border-t border-border shrink-0">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..." 
            className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-3 text-white focus:ring-2 focus:ring-primary outline-none" 
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary hover:bg-blue-600 text-white transition-colors">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};