
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Lock, Mail, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, Store, User } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { storesService } from '../../services/stores.service';
import { api } from '../../services/api';

export const ShopLogin = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'shopkeeper' | 'staff'>('shopkeeper');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let sessionPayload: any = null;

      if (loginType === 'shopkeeper') {
        // === LOGIN DE LOJISTA (Supabase Auth) ===
        try {
          const { user } = await authService.login({ email, password });

          if (user.role !== 'lojista' && user.role !== 'admin') {
            throw new Error('Acesso não autorizado para este tipo de conta.');
          }

          sessionPayload = {
            id: user.id,
            type: 'shopkeeper',
            name: user.full_name,
            email: user.email,
            permissions: user.permissions || {
              canViewDashboard: true,
              canManageCalendar: true,
              canManageServices: true,
              canManageClients: true,
              canManageProfessionals: true
            }
          };

          const stores = await storesService.getAll({ lojista_id: user.id });
          if (stores.length > 0) {
            const store = stores[0];
            if (store.status === 'bloqueada') throw new Error('Sua loja está bloqueada.');
            sessionPayload.storeId = store.id;
            sessionPayload.storeName = store.nome;
            sessionPayload.segmento_id = store.segmento_id;
          }
        } catch (err: any) {
          if (err.message?.includes('Invalid login')) throw new Error('E-mail ou senha de lojista incorretos.');
          throw err;
        }

      } else {
        // === LOGIN DE FUNCIONÁRIO (API Profissionais) ===
        try {
          const { data: prof } = await api.post('/profissionais/login', { email, password });

          sessionPayload = {
            id: prof.id,
            type: 'professional',
            name: prof.nome,
            email: prof.email,
            permissions: prof.permissoes || { canViewDashboard: true, canManageCalendar: true },
            storeId: prof.loja_id
          };

          if (prof.loja_id) {
            const store = await storesService.getById(prof.loja_id);
            sessionPayload.storeName = store.nome;
            sessionPayload.segmento_id = store.segmento_id;
            if (store.status === 'bloqueada') throw new Error('A loja vinculada a este profissional está bloqueada.');
          }
        } catch (err: any) {
          console.error("Staff login error:", err);
          throw new Error('E-mail ou senha de funcionário incorretos.');
        }
      }

      // FINALIZAR
      if (sessionPayload) {
        localStorage.setItem('user_session', JSON.stringify(sessionPayload));
        navigate('/shop/dashboard');
      }

    } catch (err: any) {
      console.error("Login process error:", err);
      setError(err.message || 'Ocorreu um erro ao fazer login.');
      if (loginType === 'shopkeeper') await authService.logout().catch(() => { });
    } finally {
      setIsLoading(false);
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
          <h1 className="text-5xl font-black mb-6">BarberFlow</h1>
          <p className="text-white/80 text-xl max-w-md mx-auto leading-relaxed">
            {loginType === 'shopkeeper'
              ? "Gerencie sua equipe, agendamentos e clientes com eficiência máxima."
              : "Acesse sua agenda, verifique seus horários e gerencie seus atendimentos."}
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-white mb-2">
              {loginType === 'shopkeeper' ? 'Área do Lojista' : 'Área do Profissional'}
            </h2>
            <p className="text-text-muted">Entre com suas credenciais para continuar.</p>
          </div>

          {/* Toggle Slider */}
          <div className="flex p-1 bg-surface border border-border rounded-xl mb-6 relative select-none">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-all duration-300 shadow-sm ${loginType === 'shopkeeper' ? 'left-1' : 'left-[calc(50%+3px)]'}`}
            ></div>
            <button
              type="button"
              onClick={() => setLoginType('shopkeeper')}
              className={`flex-1 flex items-center justify-center gap-2 relative z-10 py-3 text-sm font-bold transition-colors duration-300 ${loginType === 'shopkeeper' ? 'text-white' : 'text-text-muted hover:text-white'}`}
            >
              <Store size={16} /> Lojista
            </button>
            <button
              type="button"
              onClick={() => setLoginType('staff')}
              className={`flex-1 flex items-center justify-center gap-2 relative z-10 py-3 text-sm font-bold transition-colors duration-300 ${loginType === 'staff' ? 'text-white' : 'text-text-muted hover:text-white'}`}
            >
              <User size={16} /> Profissional
            </button>
          </div>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-danger shrink-0 mt-0.5" size={20} />
              <p className="text-danger text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-background border-border text-primary focus:ring-primary" />
                <span className="text-text-muted">Manter conectado</span>
              </label>
              <a href="#" className="text-primary hover:text-blue-400 font-medium">Esqueceu a senha?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${loginType === 'shopkeeper' ? 'bg-primary hover:bg-blue-600 shadow-blue-900/20 text-white' : 'bg-secondary hover:bg-orange-600 shadow-orange-900/20 text-white'}`}
            >
              {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Entrando...</span> : (loginType === 'shopkeeper' ? 'Entrar como Lojista' : 'Entrar como Profissional')}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => navigate('/')} className="text-sm text-text-muted hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
                <ArrowLeft size={16} /> Voltar para o início
              </button>
            </div>
          </form>

          {loginType === 'shopkeeper' && (
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-text-muted">
                Dono de Loja? <button onClick={() => navigate('/shop-register')} className="text-primary hover:underline font-medium">Cadastre sua loja</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
