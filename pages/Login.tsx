import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      const { user } = await login(email, password);

      // Validação de Segregação: Apenas Admin pode logar aqui
      if (user.role !== 'admin' && user.role !== 'funcionario_admin') { // funcionario_admin futuro
        // Se for lojista, avise para usar o outro painel
        if (user.role === 'lojista') {
          throw new Error('Lojistas devem usar o Painel do Lojista (/shop/login).');
        }
        // Se for profissional (caso tenha conta Auth, o que não deveria), bloqueie
        if (user.role === 'profissional') {
          throw new Error('Profissionais devem usar o Painel do Lojista (/shop/login).');
        }
        // Bloqueio geral
        throw new Error('Acesso restrito a administradores.');
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      // Se falhou por validação de role, precisamos fazer logout para limpar o estado
      if (err.message && (err.message.includes('Lojista') || err.message.includes('Profissional') || err.message.includes('Administrador'))) {
        // Logout silencioso se possível, ou apenas limpar localstorage se o login já setou algo
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
      setError(err.message || err.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Branding Side (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1A2540] to-[#0d141c] items-center justify-center relative overflow-hidden">
        <div className="relative z-10 p-12 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-2xl mb-6">
            <Calendar size={48} className="text-secondary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">StarAgendado</h1>
          <p className="text-text-muted text-lg max-w-md">
            A plataforma completa para gestão de agendamentos e crescimento do seu negócio.
          </p>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[128px]"></div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-text-muted">Acesse o painel administrativo.</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-danger shrink-0 mt-0.5" size={20} />
              <p className="text-danger text-sm">{error}</p>
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-text-muted/50 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                  placeholder="seu@email.com"
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-text-muted/50 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-surface border-border text-secondary focus:ring-secondary" />
                <span className="text-text-muted">Lembrar-me</span>
              </label>
              <a href="#" className="text-primary hover:text-blue-400 font-medium">Esqueceu a senha?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-900/20 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => navigate('/')} className="text-sm text-text-muted hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
                <ArrowLeft size={16} /> Voltar para o início
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-text-muted">
            Protegido por reCAPTCHA e sujeito à <a href="#" className="underline hover:text-white">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
