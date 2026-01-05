
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Download, Calendar, Filter, Store, TrendingUp, Users, DollarSign } from 'lucide-react';
import { AdminNotificationBell } from '../components/AdminNotificationBell';

// Mock Data
const timeSeriesData = [
  { date: '01/10', revenue: 1200, appointments: 15, newClients: 5 },
  { date: '05/10', revenue: 1800, appointments: 22, newClients: 8 },
  { date: '10/10', revenue: 1500, appointments: 18, newClients: 6 },
  { date: '15/10', revenue: 2200, appointments: 28, newClients: 10 },
  { date: '20/10', revenue: 2800, appointments: 35, newClients: 12 },
  { date: '25/10', revenue: 2400, appointments: 30, newClients: 9 },
  { date: '30/10', revenue: 3100, appointments: 40, newClients: 15 },
];

const storePerformanceData = [
  { name: 'Barbearia do Zé', revenue: 12500, appointments: 312 },
  { name: 'Salão Bela Mulher', revenue: 9800, appointments: 250 },
  { name: 'Estúdio Corpo & Arte', revenue: 7200, appointments: 180 },
  { name: 'Petshop Amigo', revenue: 6500, appointments: 155 },
  { name: 'Clínica Sorriso', revenue: 5900, appointments: 140 },
];

export const Reports = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedStore, setSelectedStore] = useState('all');
  const [groupBy, setGroupBy] = useState('day');

  const handleExport = () => {
    // Simula exportação CSV
    const headers = ['Data', 'Receita', 'Agendamentos', 'Novos Clientes'];
    const csvContent = [
      headers.join(','),
      ...timeSeriesData.map(row => `${row.date},${row.revenue},${row.appointments},${row.newClients}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_performance.csv';
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Relatórios Gerenciais</h1>
          <p className="text-text-muted mt-1">Análise detalhada da performance da plataforma.</p>
        </div>
        <div className="flex gap-2 items-center">
          <AdminNotificationBell />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-secondary hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-orange-900/20"
          >
            <Download size={18} />
            Exportar Dados
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Calendar size={20} className="text-text-muted" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-background border border-border text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary flex-1"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 3 meses</option>
            <option value="year">Este Ano</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Store size={20} className="text-text-muted" />
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-background border border-border text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary flex-1"
          >
            <option value="all">Todas as Lojas</option>
            <option value="1">Barbearia do Zé</option>
            <option value="2">Salão Beleza Pura</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto ml-auto">
          <span className="text-text-muted text-sm">Agrupar por:</span>
          <div className="flex bg-background rounded-lg p-1 border border-border">
            {['day', 'week', 'month'].map((type) => (
              <button
                key={type}
                onClick={() => setGroupBy(type)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${groupBy === type ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
              >
                {type === 'day' ? 'Dia' : type === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-text-muted text-sm font-medium">Receita Total</p>
            <div className="p-2 bg-success/10 rounded-lg text-success"><DollarSign size={20} /></div>
          </div>
          <h3 className="text-3xl font-bold text-white">R$ 148.500</h3>
          <p className="text-success text-sm flex items-center gap-1 mt-1"><TrendingUp size={14} /> +12.5% vs período anterior</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-text-muted text-sm font-medium">Agendamentos</p>
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calendar size={20} /></div>
          </div>
          <h3 className="text-3xl font-bold text-white">3,450</h3>
          <p className="text-success text-sm flex items-center gap-1 mt-1"><TrendingUp size={14} /> +8.2% vs período anterior</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-text-muted text-sm font-medium">Novos Clientes</p>
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Users size={20} /></div>
          </div>
          <h3 className="text-3xl font-bold text-white">850</h3>
          <p className="text-danger text-sm flex items-center gap-1 mt-1"><TrendingUp size={14} className="rotate-180" /> -2.1% vs período anterior</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Tendência de Receita</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#137fec" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#324d67" vertical={false} />
                <XAxis dataKey="date" stroke="#92adc9" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#92adc9" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A242E', borderColor: '#324d67', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#137fec" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Receita (R$)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Stores */}
        <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Top Lojas (Faturamento)</h3>
          <div className="space-y-4">
            {storePerformanceData.slice(0, 5).map((store, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium">{store.name}</span>
                  <span className="text-text-muted">R$ {store.revenue.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(store.revenue / 15000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-white">Detalhamento por Loja</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-text-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 font-semibold">Loja</th>
                <th className="px-6 py-3 font-semibold text-right">Faturamento</th>
                <th className="px-6 py-3 font-semibold text-center">Agendamentos</th>
                <th className="px-6 py-3 font-semibold text-right">Ticket Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {storePerformanceData.map((store, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{store.name}</td>
                  <td className="px-6 py-4 text-right text-text-muted">R$ {store.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-text-muted">{store.appointments}</td>
                  <td className="px-6 py-4 text-right text-primary font-bold">
                    R$ {Math.round(store.revenue / store.appointments)},00
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
