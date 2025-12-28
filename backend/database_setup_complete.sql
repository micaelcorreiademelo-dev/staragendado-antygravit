-- ==============================================================================
-- STARAGENDADO V2 - DATABASE SETUP SCRIPT
-- ==============================================================================
-- Este script recria toda a estrutura do banco de dados seguindo as novas especificações.
-- Execute no SQL Editor do Supabase Dashboard.

-- 1. LIMPEZA (Cuidado: Executar apenas em ambiente novo/dev)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- 2. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. TIPOS (ENUMS)
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('admin', 'lojista', 'profissional');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE agendamento_status AS ENUM ('pendente', 'confirmado', 'cancelado', 'concluido');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE loja_status AS ENUM ('ativa', 'bloqueada', 'pendente');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. TABELAS BASE

-- Profile de Usuários (Vinculado ao auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_type NOT NULL DEFAULT 'lojista',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lojas
CREATE TABLE IF NOT EXISTS public.lojas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Dono (Lojista)
    nome TEXT NOT NULL,
    slug TEXT UNIQUE,
    email TEXT, 
    status loja_status DEFAULT 'pendente',
    configuracoes JSONB DEFAULT '{"theme": "light", "notifications": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profissionais
CREATE TABLE IF NOT EXISTS public.profissionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Opcional: Se profissional tiver conta auth própria no futuro
    nome TEXT NOT NULL,
    email TEXT, -- Para contato ou referência de login
    senha_hash TEXT NOT NULL, -- Senha exclusiva do profissional
    funcoes JSONB DEFAULT '[]'::jsonb,
    permissoes JSONB DEFAULT '{"canViewDashboard": false, "canManageCalendar": true, "visualizar_apenas_seus_agendamentos": false}'::jsonb,
    indisponibilidades JSONB DEFAULT '[]'::jsonb, -- Cache
    status TEXT DEFAULT 'Active',
    avatar TEXT,
    phone TEXT,
    disponibilidade JSONB DEFAULT '{}'::jsonb, -- WorkSchedule
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Serviços
CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    duracao_minutos INTEGER NOT NULL,
    profissional_ids JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    servico_id UUID REFERENCES public.servicos(id) ON DELETE SET NULL,
    data_hora TIMESTAMPTZ NOT NULL,
    status agendamento_status DEFAULT 'pendente',
    observacoes TEXT,
    cliente_nome TEXT, -- Desnormalizado para histórico
    cliente_telefone TEXT,
    duracao_minutos INTEGER,
    preco DECIMAL(10,2),
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Indisponibilidade
CREATE TABLE IF NOT EXISTS public.profissionais_indisponibilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE NOT NULL,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    motivo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    data TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FUNÇÕES E SEGURANÇA (RLS)

-- Função auxiliar: Verificar se usuário é Admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Policies: LOJAS
-- Admin vê tudo
CREATE POLICY "Admin full access lojas" ON public.lojas
    FOR ALL USING (is_admin());

-- Lojista vê sua própria loja
CREATE POLICY "Lojista access own loja" ON public.lojas
    FOR ALL USING (user_id = auth.uid());

-- Public Read (para página pública /agenda/slug)
CREATE POLICY "Public read lojas" ON public.lojas
    FOR SELECT USING (true);


-- Policies: PROFISSIONAIS
-- Admin vê tudo
CREATE POLICY "Admin full access profissionais" ON public.profissionais
    FOR ALL USING (is_admin());

-- Lojista gerencia seus profissionais
CREATE POLICY "Lojista manage profissionais" ON public.profissionais
    FOR ALL USING (loja_id IN (SELECT id FROM public.lojas WHERE user_id = auth.uid()));

-- Profissionais podem ver a si mesmos (via API/Service Role normalmente, mas se Authenticado:)
-- CREATE POLICY "Profissional view self" ... (Necessita auth strategy definida)


-- Policies: AGENDAMENTOS
-- Lojista vê agendamentos da sua loja
CREATE POLICY "Lojista manage agendamentos" ON public.agendamentos
    FOR ALL USING (loja_id IN (SELECT id FROM public.lojas WHERE user_id = auth.uid()));


-- 6. RPCs DE AUTENTICAÇÃO E NEGÓCIO

-- Login Profissional Personalizado
CREATE OR REPLACE FUNCTION login_profissional(email_loja TEXT, senha_profissional TEXT)
RETURNS JSONB AS $$
DECLARE
    store_record public.lojas;
    prof_record public.profissionais;
BEGIN
    -- 1. Encontrar loja
    SELECT * INTO store_record FROM public.lojas WHERE email = email_loja LIMIT 1;
    
    IF store_record IS NULL THEN
        RAISE EXCEPTION 'Loja não encontrada com este email.';
    END IF;

    -- 2. Encontrar profissional e validar senha
    SELECT * INTO prof_record FROM public.profissionais 
    WHERE loja_id = store_record.id 
    AND senha_hash = crypt(senha_profissional, senha_hash);

    IF prof_record IS NULL THEN
        RAISE EXCEPTION 'Credenciais de profissional inválidas.';
    END IF;

    IF prof_record.status <> 'Active' THEN
        RAISE EXCEPTION 'Conta inativa.';
    END IF;

    -- 3. Retornar sessão
    RETURN jsonb_build_object(
        'id', prof_record.id,
        'nome', prof_record.nome,
        'email', prof_record.email,
        'loja_id', prof_record.loja_id,
        'role', 'profissional',
        'permissoes', prof_record.permissoes,
        'token_type', 'custom_session' -- Frontend deve gerenciar isso
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
