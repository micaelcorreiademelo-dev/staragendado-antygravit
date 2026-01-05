import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  CalendarCheck,
  Store
} from 'lucide-react';
import { MetricCardProps } from '../types';
import { dashboardService, DashboardMetrics, ChartData, PieData } from '../services/dashboard.service';
import { AdminNotificationBell } from '../components/AdminNotificationBell';

const MetricCard: React.FC<MetricCardProps & { icon: React.ElementType }> = ({ title, value, trend, isPositive, period, icon: Icon }) => (
  <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-2 transition-all hover:border-primary/50 print:border-gray-300 print:bg-white print:text-black">
    <div className="flex justify-between items-start">
      <p className="text-text-muted font-medium print:text-gray-600">{title}</p>
      <div className={`p-2 rounded-lg ${isPositive ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'} print:bg-gray-100 print:text-black`}>
        <Icon size={20} />
      </div>
    </div>
    <h3 className="text-3xl font-bold text-white tracking-tight print:text-black">{value}</h3>
    <p className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      {trend}
      <span className="text-text-muted font-normal ml-1 print:text-gray-500">{period}</span>
    </p>
  </div>
);

export const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'month'>('30d');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [metricsData, chartData, pieData] = await Promise.all([
          dashboardService.getMetrics(timeRange),
          dashboardService.getChartData(timeRange),
          dashboardService.getPlanDistribution()
        ]);
        setMetrics(metricsData);
        setChartData(chartData);
        setPieData(pieData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:space-y-4">
      <style>
        {`
          @media print {
            @page { margin: 1cm; }
            body { background-color: white !important; color: black !important; }
            .bg-surface { background-color: white !important; border: 1px solid #e5e7eb !important; box-shadow: none !important; }
            .text-white { color: black !important; }
            .text-text-muted { color: #6b7280 !important; }
            .print-hidden { display: none !important; }
            /* Fix Chart Colors for Print if needed, though usually browsers handle canvas ok */
          }
        `}
      </style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:mb-8">
        <div>
          <h1 className="text-3xl font-black text-white print:text-black">Dashboard</h1>
          <p className="text-text-muted mt-1 print:text-gray-600">Visão geral da performance da plataforma.</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <AdminNotificationBell />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-surface border border-border text-white text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none cursor-pointer hover:bg-white/5 transition-colors"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="month">Visão Anual</option>
          </select>
        </div>
      </div>

      {/* Print Header (Visible only on print) */}
      <div className="hidden print:block mb-6 text-sm text-gray-500">
        <p>Relatório gerado em: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
        <p>Período: {timeRange === '7d' ? 'Últimos 7 dias' : timeRange === '30d' ? 'Últimos 30 dias' : 'Anual'}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
        <MetricCard
          title="Total de Lojas"
          value={metrics.stores.value}
          trend={metrics.stores.trend}
          isPositive={metrics.stores.isPositive}
          period="vs. período anterior"
          icon={Store}
        />
        <MetricCard
          title="Faturamento"
          value={metrics.revenue.value}
          trend={metrics.revenue.trend}
          isPositive={metrics.revenue.isPositive}
          period="vs. período anterior"
          icon={DollarSign}
        />
        <MetricCard
          title="Agendamentos"
          value={metrics.appointments.value}
          trend={metrics.appointments.trend}
          isPositive={metrics.appointments.isPositive}
          period="vs. período anterior"
          icon={CalendarCheck}
        />
        <MetricCard
          title="Novos Clientes"
          value={metrics.clients.value}
          trend={metrics.clients.trend}
          isPositive={metrics.clients.isPositive}
          period="vs. período anterior"
          icon={Users}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:break-inside-avoid">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm print:border-gray-300 print:bg-white">
          <h3 className="text-lg font-medium text-white mb-6 print:text-black">Evolução do Faturamento e Agendamentos</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#137fec" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#324d67" vertical={false} />
                <XAxis dataKey="name" stroke="#92adc9" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#92adc9" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A242E', borderColor: '#324d67', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#137fec" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Faturamento" />
                <Area type="monotone" dataKey="appointments" stroke="#F5A623" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" name="Agendamentos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col shadow-sm print:border-gray-300 print:bg-white print:break-inside-avoid">
          <h3 className="text-lg font-medium text-white mb-6 print:text-black">Distribuição de Planos</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A242E', borderColor: '#324d67', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white print:text-black">{metrics.stores.value}</span>
              <span className="text-xs text-text-muted">Total</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-text-muted print:text-gray-600">{item.name}</span>
                </div>
                <span className="text-white font-medium print:text-black">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
