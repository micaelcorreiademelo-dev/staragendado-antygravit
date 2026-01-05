
import React from 'react';
import { Search, HelpCircle } from 'lucide-react';

export const ShopPayments = () => {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-white">Configurações de Pagamento</h1>
            <p className="text-text-muted">Gerencie métodos de pagamento, sinais e histórico.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Column */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-white">Ativar cobrança online</h3>
                        <p className="text-sm text-text-muted">Receba pagamentos pela plataforma.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-white border-b border-border pb-3">Métodos de Pagamento</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded bg-background border-border text-primary w-5 h-5" />
                            <span className="text-white">Cartão de Crédito</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded bg-background border-border text-primary w-5 h-5" />
                            <span className="text-white">Pix</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="rounded bg-background border-border text-primary w-5 h-5" />
                            <span className="text-white">Boleto Bancário</span>
                        </label>
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                        <h3 className="font-bold text-white">Exigir sinal</h3>
                        <HelpCircle size={16} className="text-text-muted" />
                    </div>
                    <div className="flex bg-background p-1 rounded-lg">
                        <button className="flex-1 py-1 text-sm font-bold bg-surface text-primary rounded shadow-sm">Valor Fixo (R$)</button>
                        <button className="flex-1 py-1 text-sm font-medium text-text-muted hover:text-white">Percentual (%)</button>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">R$</span>
                        <input type="number" defaultValue="50.00" className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-white outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                </div>
                
                <button className="w-full py-3 rounded-lg bg-secondary hover:bg-orange-600 text-white font-bold transition-colors">
                    Salvar Alterações
                </button>
            </div>

            {/* History Column */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden h-fit">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-white">Histórico de Pagamentos</h3>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input type="text" placeholder="Buscar por cliente..." className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-background border-b border-border text-text-muted">
                        <tr>
                            <th className="px-6 py-3 font-medium">Cliente</th>
                            <th className="px-6 py-3 font-medium">Data</th>
                            <th className="px-6 py-3 font-medium">Valor</th>
                            <th className="px-6 py-3 font-medium">Método</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {[
                            { client: 'Ana Silva', date: '15/07/2024', val: 'R$ 50,00', method: 'Crédito', status: 'Aprovado', color: 'bg-success/10 text-success' },
                            { client: 'Bruno Costa', date: '14/07/2024', val: 'R$ 25,00', method: 'Pix', status: 'Pendente', color: 'bg-warning/10 text-warning' },
                            { client: 'Carla Dias', date: '13/07/2024', val: 'R$ 70,00', method: 'Crédito', status: 'Recusado', color: 'bg-danger/10 text-danger' },
                            { client: 'Daniel Moreira', date: '12/07/2024', val: 'R$ 50,00', method: 'Pix', status: 'Aprovado', color: 'bg-success/10 text-success' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/5">
                                <td className="px-6 py-4 text-white font-medium">{row.client}</td>
                                <td className="px-6 py-4 text-text-muted">{row.date}</td>
                                <td className="px-6 py-4 text-text-muted">{row.val}</td>
                                <td className="px-6 py-4 text-text-muted">{row.method}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.color}`}>{row.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
