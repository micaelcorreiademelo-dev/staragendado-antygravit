
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ArrowLeft, Save, Trash2, CheckCircle, AlertCircle, Edit, Settings, CalendarOff, Shield, Clock, Lock, Eye, Loader2 } from 'lucide-react';
import { Professional, WeekSchedule, Unavailability } from '../../types';
import { professionalsService } from '../../services/professionalsService';

const defaultSchedule: WeekSchedule = {
    sunday: { isWorking: false, intervals: [] },
    monday: { isWorking: true, intervals: [{ start: '09:00', end: '18:00' }] },
    tuesday: { isWorking: true, intervals: [{ start: '09:00', end: '18:00' }] },
    wednesday: { isWorking: true, intervals: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
    thursday: { isWorking: true, intervals: [{ start: '09:00', end: '18:00' }] },
    friday: { isWorking: true, intervals: [{ start: '09:00', end: '18:00' }] },
    saturday: { isWorking: false, intervals: [] },
};

const emptyProfessional: Omit<Professional, 'id'> = {
    name: '',
    email: '',
    phone: '',
    avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    status: 'Active',
    workSchedule: JSON.parse(JSON.stringify(defaultSchedule)),
    permissions: { canViewDashboard: false, canManageCalendar: true, canManageServices: false, canManageClients: false },
    unavailability: [],
    password: '',
};

const dayNames: Record<keyof WeekSchedule, string> = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

export const ShopProfessionals = () => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [storeId, setStoreId] = useState<string | null>(null);

    const [currentProfessional, setCurrentProfessional] = useState<Professional | null>(null);
    const [formData, setFormData] = useState(emptyProfessional);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('schedule');

    // Feedback States
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('user_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (parsed.storeId) {
                    setStoreId(parsed.storeId);
                    fetchProfessionals(parsed.storeId);
                }
            } catch (e) {
                console.error("Error parsing session", e);
            }
        }
    }, []);

    const fetchProfessionals = async (lojaId: string) => {
        setIsLoading(true);
        try {
            const data = await professionalsService.getAll(lojaId);
            setProfessionals(data);
        } catch (error) {
            console.error("Error fetching professionals:", error);
            showFeedback('Erro ao carregar profissionais.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleAddNew = () => {
        setCurrentProfessional(null);
        setFormData({ ...emptyProfessional, avatar: `https://i.pravatar.cc/150?u=${Date.now()}` });
        setView('form');
    };

    const handleEdit = (prof: Professional) => {
        setCurrentProfessional(prof);
        setFormData({
            ...prof,
            permissions: { ...emptyProfessional.permissions, ...(prof.permissions || {}) },
            unavailability: prof.unavailability || [],
            workSchedule: prof.workSchedule || defaultSchedule,
            password: '' // Don't expose current password hash/value
        });
        setView('form');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) {
            showFeedback('Erro: Loja não identificada.', 'error');
            return;
        }

        try {
            setIsLoading(true);

            // Prepare DTO
            const dto: any = {
                nome: formData.name,
                email: formData.email,
                phone: formData.phone,
                avatar: formData.avatar,
                loja_id: storeId,
                status: formData.status,
                disponibilidade: formData.workSchedule,
                indisponibilidade: formData.unavailability,
                permissoes: formData.permissions,
            };

            if (formData.password) {
                dto.password = formData.password;
            }

            if (currentProfessional) {
                // Update
                await professionalsService.update(currentProfessional.id, dto);
                showFeedback('Profissional atualizado com sucesso!');
            } else {
                // Create
                if (!formData.password) {
                    showFeedback('Erro: Senha é obrigatória para novos profissionais.', 'error');
                    setIsLoading(false);
                    return;
                }
                await professionalsService.create(dto);
                showFeedback('Novo profissional cadastrado!');
            }

            await fetchProfessionals(storeId);
            setView('list');

        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.error || err.message || 'Erro ao salvar profissional.';
            showFeedback(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (showDeleteConfirm && storeId) {
            try {
                await professionalsService.delete(showDeleteConfirm);
                showFeedback('Profissional excluído com sucesso.');
                fetchProfessionals(storeId);
            } catch (err) {
                showFeedback('Erro ao excluir profissional.', 'error');
            } finally {
                setShowDeleteConfirm(null);
            }
        }
    };

    // --- Schedule Handlers ---
    const handleScheduleChange = (day: keyof WeekSchedule, part: 'isWorking' | 'intervals', value: any) => {
        setFormData(prev => ({
            ...prev,
            workSchedule: {
                ...prev.workSchedule,
                [day]: {
                    ...prev.workSchedule[day],
                    [part]: value
                }
            }
        }));
    };

    const addInterval = (day: keyof WeekSchedule) => {
        const intervals = formData.workSchedule[day].intervals;
        handleScheduleChange(day, 'intervals', [...intervals, { start: '13:00', end: '14:00' }]);
    };

    const removeInterval = (day: keyof WeekSchedule, index: number) => {
        const intervals = formData.workSchedule[day].intervals.filter((_, i) => i !== index);
        handleScheduleChange(day, 'intervals', intervals);
    };

    const updateInterval = (day: keyof WeekSchedule, index: number, part: 'start' | 'end', value: string) => {
        const intervals = formData.workSchedule[day].intervals.map((interval, i) =>
            i === index ? { ...interval, [part]: value } : interval
        );
        handleScheduleChange(day, 'intervals', intervals);
    };

    const applyScheduleToAll = () => {
        const sourceDay = 'monday'; // Use Monday as the template
        const template = formData.workSchedule[sourceDay];
        const newSchedule = { ...formData.workSchedule };
        Object.keys(newSchedule).forEach(day => {
            if (newSchedule[day as keyof WeekSchedule].isWorking) {
                newSchedule[day as keyof WeekSchedule].intervals = JSON.parse(JSON.stringify(template.intervals));
            }
        });
        setFormData(prev => ({ ...prev, workSchedule: newSchedule }));
        showFeedback("Horário aplicado a todos os dias de trabalho.");
    };

    const sortedAndFilteredProfessionals = useMemo(() => {
        return professionals.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [professionals, searchTerm]);

    // --- RENDER FUNCTIONS ---

    const renderListView = () => (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">Gestão de Equipe</h1>
                    <p className="text-text-muted mt-1">Adicione, edite e gerencie os profissionais.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus size={20} />
                    Adicionar Profissional
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-grow min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-background/50 border-b border-border text-text-muted text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Profissional</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading && professionals.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-text-muted"><Loader2 className="animate-spin inline mr-2" /> Carregando...</td></tr>
                        ) : sortedAndFilteredProfessionals.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-text-muted">Nenhum profissional encontrado.</td></tr>
                        ) : (
                            sortedAndFilteredProfessionals.map((prof) => (
                                <tr key={prof.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={prof.avatar || `https://ui-avatars.com/api/?name=${prof.name}`} alt={prof.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <span className="text-white font-medium block">{prof.name}</span>
                                                <span className="text-text-muted text-xs">{prof.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prof.status === 'Active' ? 'bg-success/10 text-success' : 'bg-text-muted/10 text-text-muted'}`}>
                                            {prof.status === 'Active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(prof)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit size={18} /></button>
                                        <button onClick={() => setShowDeleteConfirm(prof.id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors ml-2"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderFormView = () => (
        <form onSubmit={handleSave} className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-right-4">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setView('list')} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white">
                            {currentProfessional ? `Editando ${currentProfessional.name}` : 'Novo Profissional'}
                        </h1>
                        <p className="text-text-muted mt-1">Atualize detalhes, horários e permissões.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setView('list')} className="px-4 py-2 rounded-lg border border-border text-white hover:bg-white/5 font-bold text-sm">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-900/20 disabled:opacity-50">
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center text-center">
                        <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full bg-background mb-4 border-2 border-border object-cover" />
                        <div className="space-y-2 w-full">
                            <label className="text-sm font-medium text-white mb-1 block">URL do Avatar</label>
                            <input
                                type="text"
                                value={formData.avatar}
                                onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white text-xs"
                                placeholder="http://..."
                            />
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white">Informações de Contato</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Nome Completo</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">E-mail</label>
                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Telefone</label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="Active">Ativo</option>
                                <option value="Inactive">Inativo</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white">Acesso ao Sistema</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Senha de Acesso</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password || ''}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg pl-10 pr-10 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Definir senha..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-text-muted">Deixe em branco para manter a senha atual (se editando).</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
                    <div className="flex gap-6 border-b border-border mb-6">
                        <button type="button" onClick={() => setActiveTab('schedule')} className={`pb-3 border-b-2 font-medium text-sm ${activeTab === 'schedule' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-white'}`}><Clock size={16} className="inline mr-1" /> Horário</button>
                        <button type="button" onClick={() => setActiveTab('unavailability')} className={`pb-3 border-b-2 font-medium text-sm ${activeTab === 'unavailability' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-white'}`}><CalendarOff size={16} className="inline mr-1" /> Indisponibilidade</button>
                        <button type="button" onClick={() => setActiveTab('permissions')} className={`pb-3 border-b-2 font-medium text-sm ${activeTab === 'permissions' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-white'}`}><Shield size={16} className="inline mr-1" /> Permissões</button>
                    </div>

                    {activeTab === 'schedule' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">Horário Semanal</h3>
                                <button type="button" onClick={applyScheduleToAll} className="text-sm text-primary font-semibold hover:underline">Aplicar horário da Segunda a todos</button>
                            </div>

                            <div className="space-y-4">
                                {(Object.keys(dayNames) as Array<keyof WeekSchedule>).map(day => (
                                    <div key={day} className={`p-4 rounded-lg border ${formData.workSchedule[day].isWorking ? 'bg-background border-border' : 'border-border'}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" checked={formData.workSchedule[day].isWorking} onChange={e => handleScheduleChange(day, 'isWorking', e.target.checked)} className="rounded bg-surface border-border text-primary focus:ring-primary w-5 h-5" />
                                                <span className={`font-medium transition-colors ${formData.workSchedule[day].isWorking ? 'text-white' : 'text-text-muted'}`}>{dayNames[day]}</span>
                                            </div>
                                            {formData.workSchedule[day].isWorking && (
                                                <button type="button" onClick={() => addInterval(day)} className="text-sm text-primary hover:underline font-medium">+ Add Intervalo</button>
                                            )}
                                        </div>

                                        {formData.workSchedule[day].isWorking ? (
                                            <div className="space-y-2 pl-8">
                                                {formData.workSchedule[day].intervals.map((interval, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <input type="time" value={interval.start} onChange={e => updateInterval(day, index, 'start', e.target.value)} className="bg-surface border border-border rounded px-2 py-1.5 text-white text-sm w-full" />
                                                        <span className="text-text-muted">-</span>
                                                        <input type="time" value={interval.end} onChange={e => updateInterval(day, index, 'end', e.target.value)} className="bg-surface border border-border rounded px-2 py-1.5 text-white text-sm w-full" />
                                                        <button type="button" onClick={() => removeInterval(day, index)} className="text-danger hover:bg-danger/10 p-1 rounded-full"><Trash2 size={16} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-text-muted text-sm pl-8">Não trabalha</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'permissions' && (
                        <div className="animate-in fade-in duration-300 space-y-6">
                            <div className="bg-background/50 p-4 rounded-lg border border-border">
                                <h3 className="text-lg font-bold text-white mb-2">Permissões de Acesso</h3>
                                <p className="text-text-muted text-sm mb-6">Defina o que este profissional pode ver e fazer no sistema. O acesso à própria agenda é sempre garantido.</p>

                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.canViewDashboard}
                                            onChange={e => setFormData({ ...formData, permissions: { ...formData.permissions, canViewDashboard: e.target.checked } })}
                                            className="mt-1 rounded bg-surface border-border text-primary focus:ring-primary w-5 h-5"
                                        />
                                        <div>
                                            <span className="text-white font-medium block">Visualizar Dashboard</span>
                                            <span className="text-text-muted text-sm">Acesso aos gráficos gerais e métricas da loja.</span>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.canManageCalendar}
                                            onChange={e => setFormData({ ...formData, permissions: { ...formData.permissions, canManageCalendar: e.target.checked } })}
                                            className="mt-1 rounded bg-surface border-border text-primary focus:ring-primary w-5 h-5"
                                        />
                                        <div>
                                            <span className="text-white font-medium block">Gerenciar Agenda Completa</span>
                                            <span className="text-text-muted text-sm">Ver e editar agendamentos de outros profissionais.</span>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.canManageServices}
                                            onChange={e => setFormData({ ...formData, permissions: { ...formData.permissions, canManageServices: e.target.checked } })}
                                            className="mt-1 rounded bg-surface border-border text-primary focus:ring-primary w-5 h-5"
                                        />
                                        <div>
                                            <span className="text-white font-medium block">Gerenciar Serviços</span>
                                            <span className="text-text-muted text-sm">Criar, editar e excluir serviços e preços.</span>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.canManageClients}
                                            onChange={e => setFormData({ ...formData, permissions: { ...formData.permissions, canManageClients: e.target.checked } })}
                                            className="mt-1 rounded bg-surface border-border text-primary focus:ring-primary w-5 h-5"
                                        />
                                        <div>
                                            <span className="text-white font-medium block">Gerenciar Clientes</span>
                                            <span className="text-text-muted text-sm">Acesso total à base de clientes e histórico.</span>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={!!formData.permissions.visualizar_apenas_seus_agendamentos}
                                            onChange={e => setFormData({ ...formData, permissions: { ...formData.permissions, visualizar_apenas_seus_agendamentos: e.target.checked } })}
                                            className="mt-1 rounded bg-surface border-border text-primary focus:ring-primary w-5 h-5"
                                        />
                                        <div>
                                            <span className="text-white font-medium block">Visualizar Apenas Seus Agendamentos</span>
                                            <span className="text-text-muted text-sm">Restringe a visualização para exibir somente os próprios agendamentos e comissões.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'unavailability' && (
                        <div className="animate-in fade-in duration-300 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Períodos de Indisponibilidade</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newId = Date.now().toString();
                                        setFormData({
                                            ...formData,
                                            unavailability: [...formData.unavailability, { id: newId, start: '', end: '', reason: '' }]
                                        });
                                    }}
                                    className="text-sm bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg font-bold transition-colors"
                                >
                                    + Adicionar Período
                                </button>
                            </div>

                            {formData.unavailability.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-border rounded-xl">
                                    <p className="text-text-muted">Nenhum período de indisponibilidade registrado.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.unavailability.map((item, index) => (
                                        <div key={item.id} className="bg-background/50 p-4 rounded-lg border border-border flex flex-col gap-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-text-muted">Início</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={item.start}
                                                        onChange={e => {
                                                            const newUnavailability = [...formData.unavailability];
                                                            newUnavailability[index].start = e.target.value;
                                                            setFormData({ ...formData, unavailability: newUnavailability });
                                                        }}
                                                        className="w-full bg-surface border border-border rounded px-3 py-2 text-white text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-text-muted">Fim</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={item.end}
                                                        onChange={e => {
                                                            const newUnavailability = [...formData.unavailability];
                                                            newUnavailability[index].end = e.target.value;
                                                            setFormData({ ...formData, unavailability: newUnavailability });
                                                        }}
                                                        className="w-full bg-surface border border-border rounded px-3 py-2 text-white text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-text-muted">Motivo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={item.reason}
                                                        onChange={e => {
                                                            const newUnavailability = [...formData.unavailability];
                                                            newUnavailability[index].reason = e.target.value;
                                                            setFormData({ ...formData, unavailability: newUnavailability });
                                                        }}
                                                        placeholder="Ex: Férias, Consulta Médica..."
                                                        className="flex-1 bg-surface border border-border rounded px-3 py-2 text-white text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newUnavailability = formData.unavailability.filter((_, i) => i !== index);
                                                            setFormData({ ...formData, unavailability: newUnavailability });
                                                        }}
                                                        className="p-2 text-danger hover:bg-danger/10 rounded-lg"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </form>
    );

    return (
        <>
            {view === 'list' ? renderListView() : renderFormView()}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md p-6 text-center animate-in zoom-in-95 duration-200">
                        <AlertCircle size={48} className="text-danger mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
                        <p className="text-text-muted mt-2">Tem certeza que deseja excluir este profissional? Esta ação é irreversível.</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg border border-border text-text-muted hover:text-white transition-colors">Cancelar</button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-danger hover:bg-red-700 text-white font-bold transition-colors">Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            {showToast && (
                <div className={`fixed bottom-6 right-6 z-[150] bg-surface border p-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 ${toastType === 'error' ? 'border-danger/50 text-danger' : 'border-success/50 text-white'}`}>
                    {toastType === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} className="text-success" />}
                    <p className="font-medium">{toastMessage}</p>
                </div>
            )}
        </>
    );
};
