
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Check, Play } from 'lucide-react';

export const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar */}
            <header className="border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="text-secondary" size={32} />
                        <span className="text-xl font-bold text-white tracking-tight">StarAgendado</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-text-muted hover:text-white transition-colors text-sm font-medium">Funcionalidades</a>
                        <a href="#" className="text-text-muted hover:text-white transition-colors text-sm font-medium">Preços</a>
                        <a href="#" className="text-text-muted hover:text-white transition-colors text-sm font-medium">Contato</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/shop-login')}
                            className="text-white/80 hover:text-white font-medium px-3 py-2 text-sm transition-colors border border-transparent hover:border-white/10 rounded-lg hidden sm:block"
                        >
                            Área do Lojista
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-white/80 hover:text-white font-medium px-3 py-2 text-sm transition-colors border border-transparent hover:border-white/10 rounded-lg hidden sm:block"
                        >
                            Administração
                        </button>
                        <button
                            onClick={() => navigate('/shop-register')}
                            className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20"
                        >
                            Começar Agora
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="flex-1 flex items-center">
                <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1]">
                            Simplifique seus Agendamentos, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-400">
                                Expanda seu Negócio
                            </span>
                        </h1>
                        <p className="text-xl text-text-muted max-w-lg leading-relaxed">
                            A plataforma completa de agendamento online para negócios modernos. Automatize reservas, lembretes e pagamentos em um só lugar.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/shop-register')}
                                className="bg-secondary hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                            >
                                Teste Grátis
                            </button>
                            <button className="bg-surface border border-border hover:bg-white/5 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                                <Play size={20} fill="currentColor" />
                                Ver Demonstração
                            </button>
                        </div>
                        <div className="flex items-center gap-6 pt-4 text-sm text-text-muted">
                            <span className="flex items-center gap-2"><Check size={16} className="text-success" /> Sem cartão de crédito</span>
                            <span className="flex items-center gap-2"><Check size={16} className="text-success" /> 14 dias de teste grátis</span>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="relative bg-surface border border-white/10 rounded-2xl p-2 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop"
                                alt="Visualização do Painel"
                                className="rounded-xl shadow-inner w-full"
                            />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/10 bg-surface/50 py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-text-muted text-sm">
                    &copy; 2024 StarAgendado. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
};