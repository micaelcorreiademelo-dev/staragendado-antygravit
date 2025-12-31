
import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, Save, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { segmentsService, Segment } from '../../services/segments.service';
import { storesService } from '../../services/stores.service';

export const ShopSettings = () => {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [selectedSegment, setSelectedSegment] = useState('');
    const [storeId, setStoreId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Credentials state
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [updatingCredentials, setUpdatingCredentials] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load Segments
                const segmentsData = await segmentsService.getAll();
                setSegments(segmentsData.filter(s => s.active !== false));

                // Load Store Data from Session
                const sessionStr = localStorage.getItem('user_session');
                if (sessionStr) {
                    const session = JSON.parse(sessionStr);
                    let targetStoreId = session.storeId;

                    // Se não tem storeId mas tem ID de usuário (lojista), busca a loja associada
                    // Isso resolve tanto o login real quanto o impersonate sem storeId explícito
                    if (!targetStoreId && session.id) {
                        try {
                            // Assume que o ID da sessão é o lojista_id
                            const myStores = await storesService.getAll({ lojista_id: session.id });
                            if (myStores.length > 0) {
                                targetStoreId = myStores[0].id;
                            }
                        } catch (err) {
                            console.error('Erro ao buscar loja do usuário:', err);
                        }
                    }

                    if (targetStoreId) {
                        setStoreId(targetStoreId);
                        const store = await storesService.getById(targetStoreId);
                        if (store.segmento_id) {
                            setSelectedSegment(store.segmento_id);
                        }
                        // Load current email from store data
                        if (store.email) {
                            setCurrentEmail(store.email);
                        }
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar dados iniciais:", error);
            }
        };
        loadData();
    }, []);

    const handleSave = async () => {
        if (!storeId) {
            alert("Aviso: Não foi possível identificar sua loja. Verifique se está logado corretamente.");
            return;
        }

        setLoading(true);
        try {
            await storesService.update(storeId, {
                segmento_id: selectedSegment || undefined // Envia apenas se selecionado
            });
            alert("Segmento atualizado com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar alterações. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCredentials = async () => {
        if (!storeId) {
            alert("Aviso: Não foi possível identificar sua loja. Verifique se está logado corretamente.");
            return;
        }

        // Validation
        if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            alert("Por favor, insira um email válido.");
            return;
        }

        if (newPassword && newPassword.length < 6) {
            alert("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            alert("As senhas não coincidem. Por favor, verifique.");
            return;
        }

        if (!newEmail && !newPassword) {
            alert("Por favor, preencha pelo menos um campo para atualizar.");
            return;
        }

        setUpdatingCredentials(true);
        try {
            const updateData: any = {};

            if (newEmail) {
                updateData.lojista_email = newEmail;
            }

            if (newPassword) {
                updateData.lojista_senha = newPassword;
            }

            await storesService.update(storeId, updateData);

            alert("Credenciais atualizadas com sucesso!");

            // Update current email and clear form
            if (newEmail) {
                setCurrentEmail(newEmail);
            }
            setNewEmail('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar credenciais. Tente novamente.");
        } finally {
            setUpdatingCredentials(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in p-6 lg:p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white">Configurações da Loja</h1>
                <p className="text-text-muted">Gerencie as informações gerais, identidade visual e políticas.</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-border pb-4">Dados de Contato</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Nome da Loja</label>
                        <input type="text" defaultValue="Barbearia do Zé" className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" disabled />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Telefone</label>
                        <input type="text" defaultValue="(11) 98765-4321" className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" disabled />
                    </div>

                    {/* Campo Segmento Dinâmico */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-white">Segmento de Atuação</label>
                        <div className="relative">
                            <select
                                value={selectedSegment}
                                onChange={(e) => setSelectedSegment(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer hover:border-primary transition-colors"
                            >
                                <option value="">Selecione um segmento...</option>
                                {segments.map(s => (
                                    <option key={s.id} value={s.id}>{s.nome}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={20} />
                        </div>
                        <p className="text-xs text-text-muted">Escolha a categoria que melhor representa seu negócio para que clientes possam encontrá-lo mais facilmente.</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-white">Endereço</label>
                        <input type="text" defaultValue="Rua das Tesouras, 123, São Paulo - SP" className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" disabled />
                    </div>
                </div>
            </div>

            {/* Seção Dados - Redefinir Credenciais */}
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-border pb-4">Dados</h2>
                <p className="text-sm text-text-muted -mt-2">Atualize suas credenciais de acesso ao sistema.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email Atual (Read-only) */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                            <Mail size={16} className="text-primary" />
                            Email Atual
                        </label>
                        <input
                            type="email"
                            value={currentEmail}
                            readOnly
                            className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-text-muted focus:ring-2 focus:ring-primary outline-none cursor-not-allowed"
                        />
                        <p className="text-xs text-text-muted">Este é o email atualmente cadastrado para login.</p>
                    </div>

                    {/* Novo Email */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-white">Novo Email (opcional)</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Digite o novo email"
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary outline-none"
                        />
                        <p className="text-xs text-text-muted">Deixe em branco se não deseja alterar o email.</p>
                    </div>

                    {/* Nova Senha */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                            <Lock size={16} className="text-primary" />
                            Nova Senha (opcional)
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Digite a nova senha"
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 pr-12 text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p className="text-xs text-text-muted">Mínimo de 6 caracteres.</p>
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Confirmar Nova Senha</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirme a nova senha"
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 pr-12 text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Botão Atualizar Credenciais */}
                <div className="flex justify-end pt-4 border-t border-border">
                    <button
                        onClick={handleUpdateCredentials}
                        disabled={updatingCredentials || (!newEmail && !newPassword)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                        <Save size={18} />
                        <span>{updatingCredentials ? 'Atualizando...' : 'Atualizar Credenciais'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 space-y-6 opacity-60 pointer-events-none grayscale">
                <h2 className="text-xl font-bold text-white border-b border-border pb-4">Identidade e Acesso (Em breve)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-white font-medium mb-3">Foto da Loja</p>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-xl bg-background border border-border overflow-hidden">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfl6UTI_7tG2bqUI6kG_7iHYN_D2Y8QDxTwy6s6bZyN4DebDzUWzm3qIplOzzbxUzoBwKxd2vv7iY_U55nFCYMeHtVWnpVdDu0jd1IiMpupApBEPCTM30MZpWDaoql6yU4sAubXLaccvpgi-hV-0UNsb6uRB5mIPPHCqNsyLuUhyUjZ_i8ttS1XiIqD98BCwn7eNkaUwEEru3KGr49QPENfUCY4vlWwg4uZfGq1QkPkKv1L8wloURFAosAjDyvmxzFuNvUO9PdLOxi" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <button className="px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors">Alterar Foto</button>
                                <button className="px-4 py-2 text-danger hover:bg-danger/10 text-sm font-medium rounded-lg transition-colors">Remover</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <p className="text-white font-medium">URL Personalizada</p>
                            <HelpCircle size={16} className="text-secondary cursor-help" />
                        </div>
                        <div className="flex items-center">
                            <span className="bg-background border-y border-l border-border rounded-l-lg px-3 py-3 text-text-muted text-sm">app.com/</span>
                            <input type="text" defaultValue="barbearia-do-ze" className="flex-1 bg-background border border-border rounded-r-lg px-3 py-3 text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pb-8">
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-transparent text-sm font-bold leading-normal text-primary hover:bg-primary/10">
                    <span className="truncate">Descartar</span>
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-secondary text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <span className="truncate">{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
            </div>
        </div>
    );
};
