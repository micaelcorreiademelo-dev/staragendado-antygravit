
import React from 'react';
import { Download, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const areaData = [
  { name: 'Sem 1', value: 400 },
  { name: 'Sem 2', value: 600 },
  { name: 'Sem 3', value: 800 },
  { name: 'Sem 4', value: 500 },
];

const pieData = [
  { name: 'Compareceram', value: 1178, color: '#3A86FF' },
  { name: 'Cancelados', value: 64, color: '#FFBE0B' },
  { name: 'Não compareceram', value: 38, color: '#324d67' },
];

export const ShopReports = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-black text-white">Análise de Performance</h1>
            <p className="text-text-muted mt-1">Veja as métricas de desempenho do seu negócio.</p>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
                <Calendar size={18} className="text-text-muted" />
                <select className="bg-transparent text-white text-sm outline-none border-none">
                    <option>Últimos 30 dias</option>
                    <option>Últimos 7 dias</option>
                </select>
            </div>
            <button className="flex items-center gap-2 bg-secondary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                <Download size={18} />
                Exportar
            </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { title: 'Total de Agendamentos', val: '1,280', trend: '+12%', pos: true },
            { title: 'Receita Total', val: 'R$ 54.320', trend: '+15%', pos: true },
            { title: 'Taxa de Comparecimento', val: '92%', trend: '+2%', pos: true },
            { title: 'Taxa de Cancelamento', val: '5%', trend: '-1%', pos: false },
        ].map((stat, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-2">
                <p className="text-text-muted font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white">{stat.val}</h3>
                <p className={`text-sm font-bold flex items-center gap-1 ${stat.pos ? 'text-success' : 'text-danger'}`}>
                    {stat.pos ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    {stat.trend}
                </p>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Agendamentos por Período</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3A86FF" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3A86FF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#324d67" vertical={false} />
                        <XAxis dataKey="name" stroke="#92adc9" axisLine={false} tickLine={false} dy={10} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1A242E', borderColor: '#324d67', color: '#fff' }} 
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3A86FF" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Status dos Agendamentos</h3>
            <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={pieData} 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-text-muted">Total</span>
                    <span className="text-2xl font-bold text-white">1,280</span>
                </div>
            </div>
            <div className="space-y-3 mt-4">
                {pieData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-text-muted">{item.name}</span>
                        </div>
                        <span className="text-white font-bold">{item.value} ({Math.round((item.value/1280)*100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services List */}
        <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Serviços Mais Populares</h3>
            <div className="space-y-4">
                {[
                    { name: 'Corte Masculino', count: 340, pct: 100 },
                    { name: 'Barba', count: 280, pct: 82 },
                    { name: 'Combo (Corte + Barba)', count: 255, pct: 75 },
                    { name: 'Sobrancelha', count: 150, pct: 44 },
                    { name: 'Acabamento', count: 120, pct: 35 },
                ].map((svc) => (
                    <div key={svc.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-muted">{svc.name}</span>
                            <span className="text-text-muted">{svc.count}</span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${svc.pct}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Professionals Table */}
        <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Produtividade dos Profissionais</h3>
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b border-border text-text-muted">
                        <th className="pb-3 font-semibold">Profissional</th>
                        <th className="pb-3 font-semibold text-center">Atendimentos</th>
                        <th className="pb-3 font-semibold text-right">Receita</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {[
                        { name: 'Jonas Almeida', count: 450, rev: 'R$ 19.850' },
                        { name: 'Ricardo Lima', count: 415, rev: 'R$ 18.230' },
                        { name: 'Fernanda Costa', count: 390, rev: 'R$ 16.240' },
                        { name: 'Lucas Pereira', count: 25, rev: 'R$ 950' },
                    ].map((prof, i) => (
                        <tr key={i}>
                            <td className="py-3 text-white">{prof.name}</td>
                            <td className="py-3 text-center text-text-muted">{prof.count}</td>
                            <td className="py-3 text-right text-white font-medium">{prof.rev}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
