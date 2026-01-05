
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Lock, Mail, Eye, EyeOff, User, Store as StoreIcon, Phone, ArrowLeft, Loader2, Target } from 'lucide-react';
import { storesService } from '../../services/stores.service';
import { segmentsService, Segment } from '../../services/segments.service';

export const ShopRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        lojista_nome: '',
        nome_loja: '',
        email: '',
        telefone: '',
        senha: '',
        segmento_id: ''
    });

    const [error, setError] = useState('');

    useEffect(() => {
        const loadSegments = async () => {
            try {
                const data = await segmentsService.getAll();
                setSegments(data.filter(s => s.active !== false));
            } catch (err) {
                console.error(err);
            }
        };
        loadSegments();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await storesService.create({
                nome: formData.nome_loja,
                email: formData.email, // Email da loja = Email do lojista
                lojista_nome: formData.lojista_nome,
                lojista_email: formData.email,
                lojista_telefone: formData.telefone,
                lojista_senha: formData.senha,
                segmento_id: formData.segmento_id || undefined,
                status: 'ativa' // Auto ativação para simplificar trial
            });

            // Sucesso
            alert('Cadastro realizado com sucesso! Faça login para continuar.');
            navigate('/shop-login');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Erro ao cadastrar loja. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background">
            {/* Branding Side */}
            <div className="hidden lg:flex w-1/2 bg-primary items-center justify-center relative overflow-hidden">
                <div className="relative z-10 p-12 text-center text-white">
                    <div className="inline-flex items-center justify-center p-6 bg-white/10 rounded-3xl mb-8 backdrop-blur-sm">
                        <Scissors size={64} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-black mb-6">Junte-se a Nós</h1>
                    <p className="text-white/80 text-xl max-w-md mx-auto leading-relaxed">
                        Crie sua conta e comece a transformar a gestão do seu negócio hoje mesmo.
                    </p>
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface overflow-y-auto">
                <div className="w-full max-w-md space-y-8 my-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="text-text-muted hover:text-white flex items-center gap-2 text-sm transition-colors font-medium mb-4"
                    >
                        <ArrowLeft size={18} /> Voltar para o início
                    </button>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-black text-white mb-2">Cadastre sua Loja</h2>
                        <p className="text-text-muted">Preencha os dados abaixo para começar.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Responsável */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white ml-1">Nome do Responsável</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <input
                                    name="lojista_nome"
                                    required
                                    value={formData.lojista_nome}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-text-muted/50 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Seu nome completo"
                                />
                            </div>
                        </div>

                        {/* Loja */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white ml-1">Nome da Loja</label>
                            <div className="relative">
                                <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <input
                                    name="nome_loja"
                                    required
                                    value={formData.nome_loja}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-text-muted/50 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Ex: Barbearia do Zé"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white ml-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <input
                                    name="email"
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-text-muted/50 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        {/* Telefone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white ml-1">Telefone / WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <input
                                    name="telefone"
                                    required
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-text-muted/50 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        {/* Segmento */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white ml-1">Segmento</label>
                            <div className="relative">
                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <select
                                    name="segmento_id"
                                    required
                                    value={formData.segmento_id}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none appearance-none"
                                >
                                    <option value="">Selecione um segmento...</option>
                                    {segments.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <input
                                    name="senha"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.senha}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-text-muted/50 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Criando conta...</span> : 'Criar Conta Grátis'}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-border">
                        <p className="text-sm text-text-muted">
                            Já tem uma conta? <button onClick={() => navigate('/shop-login')} className="text-primary hover:underline font-medium">Fazer Login</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
