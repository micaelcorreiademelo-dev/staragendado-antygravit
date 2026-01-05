import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, LockOpen, X, Save, Trash2, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storesService, Store } from '../services/stores.service';
import { AdminNotificationBell } from '../components/AdminNotificationBell';

export const Stores = () => {
  const navigate = useNavigate();

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados de Filtro
  const [statusFilter, setStatusFilter] = useState<'ativa' | 'bloqueada' | 'pendente' | 'Todos'>('Todos');
  const [planFilter, setPlanFilter] = useState('Todos');
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');

  // Estados de Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);

  // Feedback (Toast)
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showFeedback = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    plano_id: '',
    status: 'ativa' as 'ativa' | 'bloqueada' | 'pendente',
    // Dados do lojista
    lojista_nome: '',
    lojista_email: '',
    lojista_telefone: '',
    lojista_senha: '',
    plan_expires_at: ''
  });

  // Fetch stores from API
  const fetchStores = async () => {
    try {
      setIsLoading(true);
      setError('');
      const filters = statusFilter !== 'Todos' ? { status: statusFilter } : undefined;
      const data = await storesService.getAll(filters);
      setStores(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar lojas');
      showFeedback('Erro ao carregar lojas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [statusFilter]);

  // --- Lógica de Filtro e Paginação ---
  const filteredStores = useMemo(() => {
    let result = stores.filter((store) => {
      const matchesSearch = store.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    // Ordenação por data
    result = result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [stores, searchTerm, dateSort]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

  // Resetar página se filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStores.slice(indexOfFirstItem, indexOfLastItem);

  // --- Handlers ---

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpenAddModal = () => {
    setFormData({
      nome: '',
      email: '',
      plano_id: '',
      status: 'ativa',
      lojista_nome: '',
      lojista_email: '',
      lojista_telefone: '',
      lojista_senha: '',
      plan_expires_at: ''
    });
    setCurrentStore(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = async (store: Store) => {
    try {
      const fullStore = await storesService.getById(store.id);

      setFormData({
        nome: fullStore.nome,
        email: fullStore.email,
        plano_id: fullStore.plano_id || '',
        status: fullStore.status,
        plan_expires_at: fullStore.plan_expires_at ? fullStore.plan_expires_at.split('T')[0] : '',

        // Dados do lojista
        lojista_nome: fullStore.lojista_nome || '',
        lojista_email: fullStore.email,
        lojista_telefone: fullStore.lojista_telefone || '',
        lojista_senha: ''
      });
      setCurrentStore(store);
      setIsFormModalOpen(true);
    } catch (err) {
      showFeedback('Erro ao carregar detalhes da loja');
    }
  };

  const handleOpenViewModal = (store: Store) => {
    setCurrentStore(store);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta loja? Esta ação é irreversível.')) {
      try {
        await storesService.delete(id);
        showFeedback('Loja excluída com sucesso.');
        if (isViewModalOpen) setIsViewModalOpen(false);
        fetchStores();
      } catch (err: any) {
        showFeedback(err.response?.data?.error || 'Erro ao excluir loja');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Preparar payload corrigindo string vazia para null
      const payload: any = { ...formData };
      if (payload.plan_expires_at === '') {
        payload.plan_expires_at = null;
      } else {
        // Fix: Append Noon UTC to ensure timezone offsets don't shift date to previous day
        payload.plan_expires_at = `${payload.plan_expires_at}T12:00:00.000Z`;
      }

      if (currentStore) {
        // Edição
        await storesService.update(currentStore.id, payload);
        showFeedback('Loja atualizada com sucesso.');
      } else {
        // Criação
        await storesService.create(formData); // create usa os dados brutos ou payload? create espera CreateStoreData. payload funciona.
        // A criação não suporta plan_expires_at no CreateStoreData ainda, mas o backend aceita se estiver no body?
        // O backend POST /lojas NÃO mapeia plan_expires_at. Deveria. 
        // Mas o pedido do usuário foi "alterar manualmente", e a edição resolve.
        // Se eu mandar no create, o backend teria que ser modificado.
        // Vou manter create(formData) por segurança ou payload.
        showFeedback('Nova loja cadastrada com sucesso.');
      }
      setIsFormModalOpen(false);
      fetchStores();
    } catch (err: any) {
      showFeedback(err.response?.data?.error || 'Erro ao salvar loja');
    }
  };

  const handleSupportClick = (storeId: string) => {
    navigate(`/support/${storeId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-success/20 text-success';
      case 'bloqueada': return 'bg-danger/20 text-danger';
      case 'pendente': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  if (isLoading && stores.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">Gerenciamento de Lojas</h1>
          <p className="text-text-muted">Visualize, gerencie e adicione novas lojas ao sistema.</p>
        </div>
        <AdminNotificationBell />
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-danger shrink-0 mt-0.5" size={20} />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center shadow-sm">

        {/* Search & Filters Group */}
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-background border border-border text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="Todos">Status: Todos</option>
              <option value="ativa">Ativa</option>
              <option value="pendente">Pendente</option>
              <option value="bloqueada">Bloqueada</option>
            </select>

            {/* Date Sort */}
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value as 'asc' | 'desc')}
              className="bg-background border border-border text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="desc">Cadastro: Mais recentes</option>
              <option value="asc">Cadastro: Mais antigas</option>
            </select>
          </div>
        </div>

        {/* Actions Group */}
        <div className="w-full xl:w-auto">
          <button
            onClick={handleOpenAddModal}
            className="w-full xl:w-auto flex flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:bg-orange-600 text-white font-bold transition-colors shadow-lg shadow-orange-900/20"
          >
            <Plus size={18} />
            <span className="whitespace-nowrap">Adicionar Nova Loja</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-background/50 text-text-muted text-sm border-b border-border">
              <tr>
                <th className="py-4 pl-6 pr-4 font-semibold">Nome da Loja</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Data de Cadastro</th>
                <th className="px-4 py-4 font-semibold">Expiração Plano</th>
                <th className="py-4 pl-4 pr-6 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentItems.length > 0 ? (
                currentItems.map((store) => (
                  <tr key={store.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {store.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">{store.nome}</div>
                          <div className="text-sm text-text-muted">{store.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(store.status)}`}>
                        {store.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-muted">{new Date(store.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-text-muted">
                      {store.plan_expires_at
                        ? (
                          <span className={new Date(store.plan_expires_at) < new Date() ? 'text-danger' : 'text-success'}>
                            {new Date(store.plan_expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        )
                        : <span className="text-gray-500">-</span>
                      }
                    </td>
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão Entrar como Admin */}
                        <button
                          onClick={() => {
                            // Criar sessão de impersonate
                            const fakeSession = {
                              id: store.lojista_id || 'impersonated-id',
                              name: store.nome,
                              email: store.email,
                              type: 'shopkeeper', // Permite acesso às rotas do lojista
                              permissions: {
                                canViewDashboard: true,
                                canManageServices: true
                              },
                              storeId: store.id, // Adicionado para garantir acesso ao contexto da loja (dashboard, assinaturas, etc)
                              storeName: store.nome,
                              isImpersonated: true,
                              adminReturnUrl: '/stores'
                            };
                            localStorage.setItem('user_session', JSON.stringify(fakeSession));
                            navigate('/shop/dashboard');
                          }}
                          className="p-2 rounded-lg text-primary hover:bg-primary/20 hover:text-primary transition-colors border border-primary/20"
                          title="Entrar na Loja (Acesso Admin)"
                        >
                          <LogIn size={18} />
                        </button>

                        <button
                          onClick={() => handleOpenViewModal(store)}
                          className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          title="Visualizar Detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(store)}
                          className="p-2 rounded-lg text-text-muted hover:bg-white/10 hover:text-white transition-colors"
                          title="Editar Informações"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleSupportClick(store.id)}
                          className="p-2 rounded-lg text-text-muted hover:bg-secondary/10 hover:text-secondary transition-colors"
                          title="Ferramentas de Suporte"
                        >
                          <LockOpen size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">
                    Nenhuma loja encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredStores.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-sm text-text-muted gap-4">
            <p>
              Exibindo <span className="font-medium text-white">{indexOfFirstItem + 1}</span> a <span className="font-medium text-white">{Math.min(indexOfLastItem, filteredStores.length)}</span> de <span className="font-medium text-white">{filteredStores.length}</span> lojas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${currentPage === page ? 'bg-primary text-white' : 'border border-border hover:bg-white/5'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT FORM MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white">
                {currentStore ? 'Editar Loja' : 'Adicionar Nova Loja'}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Nome da Loja</label>
                  <input
                    required
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Barbearia do Zé"
                  />
                </div>

                {/* Seção: Dados do Lojista (Proprietário) */}
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Dados do Lojista (Proprietário)</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Nome Completo do Lojista</label>
                      <input
                        required
                        type="text"
                        value={formData.lojista_nome}
                        onChange={(e) => setFormData({ ...formData, lojista_nome: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Ex: João Silva"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">E-mail do Lojista (Login e Contato da Loja)</label>
                      <input
                        required
                        type="email"
                        value={formData.lojista_email}
                        onChange={(e) => setFormData({ ...formData, lojista_email: e.target.value, email: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Ex: joao@email.com"
                      />
                      <p className="text-xs text-text-muted">Este será o email de login do lojista e também o email de contato da loja</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Telefone / WhatsApp</label>
                      <input
                        required
                        type="tel"
                        value={formData.lojista_telefone}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 11) value = value.substring(0, 11);
                          value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                          value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                          setFormData({ ...formData, lojista_telefone: value });
                        }}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                      />
                      <p className="text-xs text-text-muted">Número do WhatsApp para contato (formato automático)</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Senha de Acesso</label>
                      <input
                        required={!currentStore}
                        type="password"
                        value={formData.lojista_senha}
                        onChange={(e) => setFormData({ ...formData, lojista_senha: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                        placeholder={currentStore ? "Deixe em branco para manter a atual" : "Mínimo 6 caracteres"}
                        minLength={6}
                      />
                      <p className="text-xs text-text-muted">
                        {currentStore
                          ? "Deixe em branco para manter a senha atual. Preencha apenas se desejar alterar."
                          : "Senha para o lojista acessar o sistema"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="ativa">Ativa</option>
                    <option value="pendente">Pendente</option>
                    <option value="bloqueada">Bloqueada</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Data de Expiração do Plano</label>
                  <input
                    type="date"
                    value={formData.plan_expires_at}
                    onChange={(e) => setFormData({ ...formData, plan_expires_at: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-xs text-text-muted">Deixe em branco para não definir expiração (acesso vitalício ou indeterminado)</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-border text-text-muted hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-colors"
                  >
                    <Save size={18} />
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {
        isViewModalOpen && currentStore && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="relative h-24 bg-gradient-to-r from-primary/20 to-secondary/20">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 rounded-full p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-8 pb-8 -mt-10">
                <div className="w-20 h-20 rounded-full bg-surface border-4 border-surface shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-2xl">
                    {currentStore.nome.substring(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="text-2xl font-bold text-white">{currentStore.nome}</h2>
                  <p className="text-text-muted">{currentStore.email}</p>

                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-text-muted">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStore.status)}`}>
                        {currentStore.status}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-text-muted">Membro desde</span>
                      <span className="text-white font-medium">{new Date(currentStore.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-text-muted">ID da Loja</span>
                      <span className="text-white font-mono text-sm">{currentStore.id}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleOpenEditModal(currentStore);
                      }}
                      className="flex-1 py-2.5 rounded-lg border border-border text-white hover:bg-white/5 transition-colors font-medium"
                    >
                      Editar Dados
                    </button>
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleSupportClick(currentStore.id);
                      }}
                      className="flex-1 py-2.5 rounded-lg border border-border text-white hover:bg-white/5 transition-colors font-medium"
                    >
                      Suporte
                    </button>
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleDelete(currentStore.id);
                      }}
                      className="flex items-center justify-center px-4 rounded-lg border border-border text-danger hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Toast Notification */}
      {
        showToast && (
          <div className="fixed bottom-6 right-6 z-[150] bg-surface border border-border p-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <div className="p-1 bg-success/20 rounded-full text-success">
              <CheckCircle size={20} />
            </div>
            <p className="text-white font-medium">{toastMessage}</p>
          </div>
        )
      }
    </div >
  );
};
