
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, UploadCloud, ArrowLeft, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Service, Professional, WeekSchedule } from '../../types';

// --- MOCK DATA (if localStorage is empty) ---
const defaultServices: Service[] = [
  { id: '1', name: 'Corte de Cabelo Masculino', category: 'Cabelo', duration: 45, price: 80, description: 'Corte clássico ou moderno com tesoura e máquina.', professionalIds: ['1', '3'] },
  { id: '2', name: 'Barba Tradicional', category: 'Barba', duration: 30, price: 50, description: 'Barba feita com navalha e toalha quente.', professionalIds: ['1', '2', '3'] },
  { id: '3', name: 'Corte e Barba', category: 'Pacotes', duration: 75, price: 120, description: 'Pacote completo de corte e barba.', professionalIds: ['1', '3'] },
  { id: '4', name: 'Hidratação Capilar', category: 'Cabelo', duration: 40, price: 90, description: 'Tratamento profundo para revitalizar os fios.', professionalIds: ['2'] },
];

const defaultSchedule: WeekSchedule = {
  sunday: { isWorking: false, intervals: [] },
  monday: { isWorking: true, intervals: [{ start: '09:00', end: '18:00' }] },
  tuesday: { isWorking: true, intervals: [{ start: '09:00', end: '18:00' }] },
  wednesday: { isWorking: true, intervals: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
  thursday: { isWorking: true, intervals: [{ start: '09:00', end: '18:00' }] },
  friday: { isWorking: true, intervals: [{ start: '09:00', end: '18:00' }] },
  saturday: { isWorking: false, intervals: [] },
};

const mockProfessionals: Professional[] = [
  { id: '1', name: 'Carlos Silva', email: 'carlos.silva@example.com', phone: '(11) 98765-4321', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=carlos', workSchedule: defaultSchedule, permissions: { canViewDashboard: true, canManageCalendar: true, canManageServices: false, canManageClients: false }, unavailability: [] },
  { id: '2', name: 'Ana Pereira', email: 'ana.pereira@example.com', phone: '(11) 98765-4322', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=ana', workSchedule: defaultSchedule, permissions: { canViewDashboard: true, canManageCalendar: true, canManageServices: false, canManageClients: false }, unavailability: [] },
  { id: '3', name: 'Marcos Souza', email: 'marcos.souza@example.com', phone: '(11) 98765-4323', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=marcos', workSchedule: defaultSchedule, permissions: { canViewDashboard: true, canManageCalendar: true, canManageServices: false, canManageClients: false }, unavailability: [] }
];

const emptyService: Omit<Service, 'id'> = {
  name: '',
  category: '',
  duration: 30,
  price: 0,
  description: '',
  professionalIds: [],
};


export const ShopServices = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('shop_services');
    return saved ? JSON.parse(saved) : defaultServices;
  });

  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState(emptyService);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Feedback States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('shop_services', JSON.stringify(services));
  }, [services]);

  const showFeedback = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddNew = () => {
    setCurrentService(null);
    setFormData(emptyService);
    setView('form');
  };

  const handleEdit = (service: Service) => {
    setCurrentService(service);
    setFormData({
      ...emptyService,
      ...service,
      professionalIds: service.professionalIds || []
    });
    setView('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentService) { // Editing
      setServices(services.map(s => s.id === currentService.id ? { ...s, ...formData } : s));
      showFeedback('Serviço atualizado com sucesso!');
    } else { // Creating
      const newService: Service = { ...formData, id: Date.now().toString() };
      setServices([newService, ...services]);
      showFeedback('Novo serviço cadastrado!');
    }
    setView('list');
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      setServices(services.filter(s => s.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      showFeedback('Serviço excluído com sucesso.');
    }
  };

  const handleToggleProfessional = (profId: string) => {
    const isSelected = formData.professionalIds.includes(profId);
    setFormData(prev => ({
      ...prev,
      professionalIds: isSelected
        ? prev.professionalIds.filter(id => id !== profId)
        : [...prev.professionalIds, profId]
    }));
  };

  const sortedAndFilteredServices = useMemo(() => {
    return services
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'duration') return a.duration - b.duration;
        return 0;
      });
  }, [services, searchTerm, sortBy]);

  // --- RENDER FUNCTIONS ---

  const renderListView = () => (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Meus Serviços</h1>
          <p className="text-text-muted mt-1">Gerencie os serviços oferecidos em seu estabelecimento.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} />
          Adicionar Novo Serviço
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-grow min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Buscar serviço pelo nome..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-surface border border-border text-white text-sm rounded-lg px-4 py-3 outline-none"
          >
            <option value="name">Ordenar por: Nome</option>
            <option value="price">Preço</option>
            <option value="duration">Duração</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-background/50 border-b border-border text-text-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Nome do Serviço</th>
              <th className="px-6 py-4 font-medium">Duração</th>
              <th className="px-6 py-4 font-medium">Preço</th>
              <th className="px-6 py-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedAndFilteredServices.map((service) => (
              <tr key={service.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{service.name}</td>
                <td className="px-6 py-4 text-text-muted">{service.duration} min</td>
                <td className="px-6 py-4 text-text-muted">R$ {service.price.toFixed(2).replace('.', ',')}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(service)} className="text-primary hover:text-blue-400 transition-colors"><Edit size={18} /></button>
                    <button onClick={() => setShowDeleteConfirm(service.id)} className="text-danger hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFormView = () => (
    <form onSubmit={handleSave} className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center gap-4 mb-8">
        <button type="button" onClick={() => setView('list')} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-white">{currentService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">Detalhes do Serviço</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nome do Serviço</label>
            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="Ex: Corte de Cabelo Masculino" className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Categoria</label>
            <input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} type="text" placeholder="Ex: Cabelo" className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Duração (min)</label>
              <input required value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} type="number" placeholder="Ex: 45" className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Preço (R$)</label>
              <input required value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} type="number" step="0.01" placeholder="Ex: 50.00" className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Descrição</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Descreva os detalhes do serviço..." className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none resize-none" />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Disponibilidade por Profissional</h2>
            <p className="text-text-muted text-sm mb-6">Selecione quem pode realizar este serviço.</p>
            <div className="space-y-4">
              {mockProfessionals.map(prof => (
                <label key={prof.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border cursor-pointer">
                  <span className="text-white text-sm font-medium">{prof.name}</span>
                  <input
                    type="checkbox"
                    checked={formData.professionalIds.includes(prof.id)}
                    onChange={() => handleToggleProfessional(prof.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" className="w-full py-3 rounded-lg bg-secondary hover:bg-orange-600 text-white font-bold transition-colors shadow-lg shadow-orange-900/20">
              {currentService ? 'Salvar Alterações' : 'Salvar Serviço'}
            </button>
            <button type="button" onClick={() => setView('list')} className="w-full py-3 rounded-lg border border-border text-text-muted hover:text-white transition-colors font-medium">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <>
      {view === 'list' ? renderListView() : renderFormView()}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md p-6 text-center animate-in zoom-in-95 duration-200">
            <AlertCircle size={48} className="text-danger mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
            <p className="text-text-muted mt-2">Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg border border-border text-text-muted hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-danger hover:bg-red-700 text-white font-bold transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[150] bg-surface border border-border p-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle size={20} className="text-success" />
          <p className="text-white font-medium">{toastMessage}</p>
        </div>
      )}
    </>
  );
};
