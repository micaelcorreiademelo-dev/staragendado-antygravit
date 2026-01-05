
import React from 'react';
import { HelpCircle, CheckCircle } from 'lucide-react';

export const ShopNotifications = () => {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-white">Configurações de Notificação</h1>
            <p className="text-text-muted">Gerencie as notificações automáticas enviadas para seus clientes.</p>
        </div>

        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Lembretes de Agendamento</h2>
                <p className="text-text-muted mt-1 text-sm">Ative e configure lembretes para evitar que seus clientes esqueçam do horário marcado.</p>
            </div>

            {[
                { time: '24 horas antes', defaultActive: true },
                { time: '12 horas antes', defaultActive: false },
                { time: '1 hora antes', defaultActive: true },
            ].map((item, idx) => (
                <div key={idx} className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{item.time}</h3>
                            {idx === 0 && <HelpCircle size={16} className="text-text-muted" />}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultActive} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                    </div>
                    <div className="pt-6 border-t border-border flex flex-wrap gap-6">
                        <p className="w-full text-sm font-medium text-text-muted">Canais de envio:</p>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.defaultActive ? 'bg-secondary border-secondary text-white' : 'border-border text-transparent'}`}>
                                <CheckCircle size={16} fill="currentColor" className="text-white" />
                            </div>
                            <span className="text-white">WhatsApp</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.defaultActive ? 'bg-secondary border-secondary text-white' : 'border-border text-transparent'}`}>
                                <CheckCircle size={16} fill="currentColor" className="text-white" />
                            </div>
                            <span className="text-white">E-mail</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer opacity-50">
                            <div className="w-5 h-5 rounded border border-border"></div>
                            <span className="text-text-muted">Notificação Push (App)</span>
                        </label>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex justify-end pt-4">
            <button className="bg-secondary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-orange-900/20">
                Salvar Alterações
            </button>
        </div>
    </div>
  );
};
