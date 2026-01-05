import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Shield, Check, X, AlertCircle, Save, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employeesService, Employee } from '../services/employees.service';
import { AdminNotificationBell } from '../components/AdminNotificationBell';

const AVAILABLE_PERMISSIONS = [
    { id: 'dashboard', label: 'Dashboard Resumo' },
    { id: 'stores', label: 'Gerenciar Lojas' },
    { id: 'plans', label: 'Gerenciar Planos' },
    { id: 'employees', label: 'Gerenciar Funcionários' },
    { id: 'reports', label: 'Relatórios' },
    { id: 'support', label: 'Suporte' },
    { id: 'integrations', label: 'Integrações' },
    { id: 'settings', label: 'Configurações' },
    { id: 'logs', label: 'Logs do Sistema' }
];

export const Employees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        permissions: {} as Record<string, boolean>
    });

    const [feedback, setFeedback] = useState({ message: '', type: 'success' as 'success' | 'error' });

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const data = await employeesService.getAll();
            setEmployees(data);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar funcionários.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleOpenModal = (employee?: Employee) => {
        if (employee) {
            setCurrentEmployee(employee);
            setFormData({
                full_name: employee.full_name,
                email: employee.email,
                password: '', // Senha vazia na edição
                permissions: employee.permissions || {}
            });
        } else {
            setCurrentEmployee(null);
            setFormData({
                full_name: '',
                email: '',
                password: '',
                permissions: AVAILABLE_PERMISSIONS.reduce((acc, curr) => ({ ...acc, [curr.id]: false }), {})
            });
        }
        setIsModalOpen(true);
    };

    const handlePermissionChange = (permId: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permId]: !prev.permissions[permId]
            }
        }));
    };

    const handleSelectAllPermissions = () => {
        const allSelected = AVAILABLE_PERMISSIONS.every(p => formData.permissions[p.id]);
        const multiple = !allSelected;
        const newPerms = AVAILABLE_PERMISSIONS.reduce((acc, curr) => ({ ...acc, [curr.id]: multiple }), {});
        setFormData(prev => ({ ...prev, permissions: newPerms }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                role: 'admin' as const // Garantir que o role seja enviado
            };
            if (payload.password === '') delete (payload as any).password;

            if (currentEmployee) {
                await employeesService.update(currentEmployee.id, payload);
                showFeedback('Funcionário atualizado com sucesso!', 'success');
            } else {
                await employeesService.create(payload);
                showFeedback('Funcionário criado com sucesso!', 'success');
            }
            setIsModalOpen(false);
            fetchEmployees();
        } catch (err: any) {
            console.error('Erro ao salvar funcionário:', err);
            showFeedback(err.response?.data?.error || 'Erro ao salvar funcionário', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este funcionário?')) {
            try {
                console.log('🗑️ Tentando deletar funcionário:', id);
                await employeesService.delete(id);
                console.log('✅ Funcionário deletado com sucesso');
                showFeedback('Funcionário removido.', 'success');
                fetchEmployees();
            } catch (err: any) {
                console.error('❌ Erro ao deletar funcionário:', err);
                console.error('   - Resposta:', err.response?.data);
                showFeedback(err.response?.data?.error || 'Erro ao remover funcionário.', 'error');
            }
        }
    };

    const showFeedback = (msg: string, type: 'success' | 'error') => {
        setFeedback({ message: msg, type });
        setTimeout(() => setFeedback({ message: '', type: 'success' }), 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white">Gestão de Funcionários</h1>
                    <p className="text-text-muted">Gerencie o acesso administrativo e permissões do sistema.</p>
                </div>
                <AdminNotificationBell />
            </div>

            {feedback.message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${feedback.type === 'error' ? 'bg-danger/10 border-danger/50 text-danger' : 'bg-success/10 border-success/50 text-success'}`}>
                    <AlertCircle size={20} />
                    {feedback.message}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex justify-end">
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18} />
                    Novo Funcionário
                </button>
            </div>

            {/* Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-background/50 text-text-muted text-sm border-b border-border">
                        <tr>
                            <th className="py-4 pl-6 pr-4 font-semibold">Nome</th>
                            <th className="px-4 py-4 font-semibold">Email</th>
                            <th className="px-4 py-4 font-semibold">Permissões</th>
                            <th className="py-4 pl-4 pr-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-text-muted">Carregando...</td></tr>
                        ) : employees.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-text-muted">Nenhum funcionário encontrado.</td></tr>
                        ) : (
                            employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-6 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <User size={16} />
                                            </div>
                                            <span className="font-medium text-white">{emp.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-text-muted">{emp.email}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(emp.permissions || {}).filter(([, v]) => v).length > 0 ? (
                                                Object.entries(emp.permissions || {})
                                                    .filter(([, v]) => v)
                                                    .slice(0, 3)
                                                    .map(([key]) => (
                                                        <span key={key} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white">
                                                            {AVAILABLE_PERMISSIONS.find(p => p.id === key)?.label || key}
                                                        </span>
                                                    ))
                                            ) : (
                                                <span className="text-text-muted text-sm italic">Nenhuma</span>
                                            )}
                                            {Object.entries(emp.permissions || {}).filter(([, v]) => v).length > 3 && (
                                                <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white">
                                                    +{Object.entries(emp.permissions || {}).filter(([, v]) => v).length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 pl-4 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(emp)} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(emp.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shield className="text-primary" />
                                {currentEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-text-muted hover:text-white" /></button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white">Nome Completo</label>
                                    <input
                                        required
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Ex: João Admin"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white">Email de Acesso</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@admin.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Senha</label>
                                <input
                                    type="password"
                                    required={!currentEmployee}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={currentEmployee ? "Deixe em branco para manter a atual" : "Mínima 6 caracteres"}
                                    minLength={6}
                                />
                            </div>

                            <div className="border-t border-border pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Permissões de Acesso</h3>
                                    <button
                                        type="button"
                                        onClick={handleSelectAllPermissions}
                                        className="text-xs text-primary hover:underline hover:text-blue-400"
                                    >
                                        Selecionar/Deselecionar Todos
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {AVAILABLE_PERMISSIONS.map(perm => (
                                        <label key={perm.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50 hover:bg-white/5 cursor-pointer transition-colors">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.permissions[perm.id] ? 'bg-primary border-primary' : 'border-text-muted'}`}>
                                                {formData.permissions[perm.id] && <Check size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={!!formData.permissions[perm.id]}
                                                onChange={() => handlePermissionChange(perm.id)}
                                            />
                                            <span className="text-sm text-gray-200">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-border bg-background/50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-text-muted hover:text-white">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold flex items-center gap-2">
                                <Save size={18} />
                                Salvar Funcionário
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
