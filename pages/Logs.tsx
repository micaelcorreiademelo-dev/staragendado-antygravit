import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AdminNotificationBell } from '../components/AdminNotificationBell';

// Mock Data
const initialLogs = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  date: new Date(Date.now() - i * 3600000).toLocaleString('pt-BR'),
  level: i % 10 === 0 ? 'Erro' : i % 5 === 0 ? 'Aviso' : 'Info',
  store: i % 3 === 0 ? 'Barbearia do Zé' : i % 3 === 1 ? 'Salão Beleza Pura' : 'Estúdio Corpo & Arte',
  module: i % 4 === 0 ? 'Pagamento' : i % 4 === 1 ? 'Login' : i % 4 === 2 ? 'Agendamento' : 'Configuração',
  desc: i % 10 === 0
    ? 'Falha na conexão com gateway de pagamento.'
    : `Ação realizada com sucesso pelo usuário ${i % 2 === 0 ? 'Admin' : 'Sistema'}.`
}));

export const Logs = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [storeFilter, setStoreFilter] = useState('Todas');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize search from URL if present
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Filter Logic
  const filteredLogs = initialLogs.filter(log => {
    const matchesSearch =
      log.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === 'Todos' || log.level === levelFilter;
    const matchesStore = storeFilter === 'Todas' || log.store === storeFilter;

    return matchesSearch && matchesLevel && matchesStore;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilter, storeFilter]);

  // Corrected Export Functionality
  const handleExport = () => {
    try {
      const headers = ['ID', 'Data/Hora', 'Nível', 'Loja', 'Módulo', 'Descrição'];
      const csvContent = [
        headers.join(','),
        ...filteredLogs.map(log => {
          // Sanitize description to handle commas by enclosing in quotes
          const sanitizedDesc = `"${log.desc.replace(/"/g, '""')}"`;
          return `${log.id},"${log.date}",${log.level},"${log.store}",${log.module},${sanitizedDesc}`;
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `logs_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link); // Append to body to ensure it's clickable
      link.click(); // Trigger download
      document.body.removeChild(link); // Clean up
      URL.revokeObjectURL(url); // Free up memory
    } catch (error) {
      console.error("Error during export:", error);
      alert("An error occurred while exporting the logs.");
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Erro': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-danger/20 text-danger"><XCircle size={12} /> ERRO</span>;
      case 'Aviso': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-500"><AlertTriangle size={12} /> AVISO</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary"><Info size={12} /> INFO</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white">Auditoria & Logs</h1>
          <p className="text-text-muted">Visualize e filtre todos os eventos importantes.</p>
        </div>
        <AdminNotificationBell />
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none"
            placeholder="Pesquisar por loja, módulo ou descrição..."
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto items-center">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-surface border border-border text-white text-sm rounded-lg px-4 py-2.5 outline-none flex-1 md:flex-none cursor-pointer">
            <option value="Todos">Nível: Todos</option>
            <option value="Erro">Erro</option>
            <option value="Aviso">Aviso</option>
            <option value="Info">Info</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-secondary hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors whitespace-nowrap">
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background/50 border-b border-border text-sm text-text-muted">
              <tr>
                <th className="py-4 px-6 font-semibold">Data/Hora</th>
                <th className="px-4 py-4 font-semibold">Nível</th>
                <th className="px-4 py-4 font-semibold">Loja</th>
                <th className="px-4 py-4 font-semibold">Módulo</th>
                <th className="px-4 py-4 font-semibold">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {currentLogs.length > 0 ? currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-text-muted font-mono whitespace-nowrap">{log.date}</td>
                  <td className="px-4 py-4">
                    {getLevelBadge(log.level)}
                  </td>
                  <td className="px-4 py-4 text-white font-medium">{log.store}</td>
                  <td className="px-4 py-4 text-text-muted">{log.module}</td>
                  <td className="px-4 py-4 text-white">{log.desc}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">Nenhum log encontrado para esta busca.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-muted">Exibindo {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredLogs.length)} de {filteredLogs.length} resultados</p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-white/5 text-white disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 flex items-center text-white">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-white/5 text-white disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
