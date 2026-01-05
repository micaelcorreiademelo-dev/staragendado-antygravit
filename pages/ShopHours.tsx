
import React from 'react';
import { Clock, Plus, Trash2, ChevronLeft, ChevronRight, Edit } from 'lucide-react';

export const ShopHours = () => {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white">Horário de Funcionamento</h1>
        <p className="text-text-muted">Defina os horários padrão de atendimento e datas especiais.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-bold text-white mb-4">Configurações Globais</h3>
          <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[250px] max-w-xs space-y-2">
                  <label className="text-sm font-medium text-text-muted">Intervalo padrão entre agendamentos</label>
                  <select className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-primary">
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 hora</option>
                  </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-bold text-sm">
                  <Clock size={18} />
                  Aplicar a todos os dias
              </button>
          </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <h3 className="font-bold text-white p-6 border-b border-border">Horários da Semana</h3>
          <div className="divide-y divide-border">
              {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'].map((day, idx) => (
                  <div key={day} className="p-6 hover:bg-white/5 transition-colors">
                      <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-4">
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" defaultChecked />
                                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                              <span className="font-medium text-white">{day}</span>
                          </div>
                          <button className="p-1 hover:bg-white/10 rounded text-text-muted"><Plus size={20} /></button>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                              <input type="time" defaultValue="09:00" className="bg-background border border-border rounded px-3 py-2 text-white text-sm" />
                              <span className="text-text-muted">-</span>
                              <input type="time" defaultValue={idx === 1 ? "12:00" : "18:00"} className="bg-background border border-border rounded px-3 py-2 text-white text-sm" />
                          </div>
                          {idx === 1 && (
                              <div className="flex items-center gap-2">
                                  <input type="time" defaultValue="14:00" className="bg-background border border-border rounded px-3 py-2 text-white text-sm" />
                                  <span className="text-text-muted">-</span>
                                  <input type="time" defaultValue="18:00" className="bg-background border border-border rounded px-3 py-2 text-white text-sm" />
                              </div>
                          )}
                          <button className="p-2 text-danger hover:bg-danger/10 rounded ml-auto"><Trash2 size={18} /></button>
                      </div>
                  </div>
              ))}
              {['Sábado', 'Domingo'].map(day => (
                  <div key={day} className="p-6 opacity-60">
                      <div className="flex items-center gap-4 mb-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                          <span className="font-medium text-white">{day}</span>
                      </div>
                      <p className="text-text-muted text-sm ml-16">Fechado</p>
                  </div>
              ))}
          </div>
      </div>

      {/* Special Hours Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Horários Especiais</h2>
            <button className="flex items-center gap-2 bg-secondary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                <Plus size={16} /> Adicionar Data
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <button className="p-1 hover:bg-white/10 rounded"><ChevronLeft size={20} className="text-text-muted" /></button>
                    <span className="font-bold text-white">Dezembro 2024</span>
                    <button className="p-1 hover:bg-white/10 rounded"><ChevronRight size={20} className="text-text-muted" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-muted mb-2">
                    {['D','S','T','Q','Q','S','S'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-white">
                    <span /><span /><span />
                    {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                        <button key={d} className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 ${[24, 25, 31].includes(d) ? 'bg-primary text-white' : ''}`}>
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
                {[
                    { date: '24 DEZ', name: 'Véspera de Natal', hours: 'Aberto: 09:00 - 14:00' },
                    { date: '25 DEZ', name: 'Feriado de Natal', hours: 'Fechado' },
                    { date: '31 DEZ', name: 'Véspera de Ano Novo', hours: 'Aberto: 09:00 - 14:00' },
                ].map((item, i) => (
                    <div key={i} className="p-4 flex justify-between items-center hover:bg-white/5">
                        <div className="flex gap-4 items-center">
                            <div className="bg-primary/10 text-primary rounded-lg w-12 h-12 flex flex-col items-center justify-center leading-none">
                                <span className="text-[10px] font-bold">{item.date.split(' ')[1]}</span>
                                <span className="text-lg font-black">{item.date.split(' ')[0]}</span>
                            </div>
                            <div>
                                <p className="font-bold text-white">{item.name}</p>
                                <p className="text-sm text-text-muted">{item.hours}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-white/10 rounded text-text-muted"><Edit size={18} /></button>
                            <button className="p-2 hover:bg-danger/10 rounded text-danger"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
          <button className="px-6 py-3 bg-secondary hover:bg-orange-600 text-white rounded-lg font-bold shadow-lg shadow-orange-900/20">
              Salvar Alterações
          </button>
      </div>
    </div>
  );
};
