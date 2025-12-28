-- ============================================
-- FIX LOJAS SCHEMA - Adicionar suporte a Planos
-- ============================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR E CRIAR TABELA DE PLANOS (se não existir)
CREATE TABLE IF NOT EXISTS public.planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    limite_profissionais INTEGER NOT NULL DEFAULT 2,
    limite_agendamentos INTEGER NOT NULL DEFAULT 50,
    permite_pagamentos_online BOOLEAN DEFAULT FALSE,
    permite_integracao_calendar BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADICIONAR COLUNA plano_id NA TABELA LOJAS (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lojas' AND column_name = 'plano_id'
    ) THEN
        ALTER TABLE public.lojas ADD COLUMN plano_id UUID REFERENCES public.planos(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. INSERIR PLANOS PADRÃO (verificando se já existem)
DO $$ 
BEGIN
    -- Inserir plano Básico se não existir
    IF NOT EXISTS (SELECT 1 FROM planos WHERE nome = 'Básico') THEN
        INSERT INTO planos (nome, limite_profissionais, limite_agendamentos, permite_pagamentos_online, permite_integracao_calendar)
        VALUES ('Básico', 2, 50, FALSE, FALSE);
    END IF;
    
    -- Inserir plano Profissional se não existir
    IF NOT EXISTS (SELECT 1 FROM planos WHERE nome = 'Profissional') THEN
        INSERT INTO planos (nome, limite_profissionais, limite_agendamentos, permite_pagamentos_online, permite_integracao_calendar)
        VALUES ('Profissional', 5, 200, TRUE, FALSE);
    END IF;
    
    -- Inserir plano Enterprise se não existir
    IF NOT EXISTS (SELECT 1 FROM planos WHERE nome = 'Enterprise') THEN
        INSERT INTO planos (nome, limite_profissionais, limite_agendamentos, permite_pagamentos_online, permite_integracao_calendar)
        VALUES ('Enterprise', 20, 1000, TRUE, TRUE);
    END IF;
END $$;

-- 4. CRIAR FUNÇÃO is_admin() SE NÃO EXISTIR
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. HABILITAR RLS NA TABELA PLANOS
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLICY PARA PLANOS (todos podem ler)
DROP POLICY IF EXISTS "Public read planos" ON public.planos;
CREATE POLICY "Public read planos" ON public.planos
    FOR SELECT USING (true);

-- 7. ADMIN pode gerenciar planos
DROP POLICY IF EXISTS "Admin manage planos" ON public.planos;
CREATE POLICY "Admin manage planos" ON public.planos
    FOR ALL USING (is_admin());

-- 8. VERIFICAR ESTRUTURA
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'lojas' AND column_name IN ('id', 'nome', 'email', 'status', 'plano_id', 'user_id')
ORDER BY ordinal_position;

-- 9. VERIFICAR PLANOS CRIADOS
SELECT id, nome, limite_profissionais, limite_agendamentos FROM planos;

-- ============================================
-- PRÓXIMO PASSO: Executar init-data.sql para criar lojas de exemplo
-- ============================================
