-- ==============================================================================
-- SCRIPT DE CORREÇÃO DE PERMISSÕES (RLS) E ESTRUTURA
-- ==============================================================================

-- 1. Garantir que a tabela LOJAS existe com a estrutura correta
CREATE TABLE IF NOT EXISTS public.lojas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    plano_id BIGINT REFERENCES public.planos(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;

-- 3. Limpar políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura publica em planos" ON public.planos;
DROP POLICY IF EXISTS "Permitir escrita publica em planos" ON public.planos;
DROP POLICY IF EXISTS "Permitir tudo em planos" ON public.planos;

DROP POLICY IF EXISTS "Permitir leitura publica em lojas" ON public.lojas;
DROP POLICY IF EXISTS "Permitir escrita publica em lojas" ON public.lojas;
DROP POLICY IF EXISTS "Permitir tudo em lojas" ON public.lojas;

-- 4. Criar políticas permissivas (Backend está usando chave anon, então precisa disso)
-- ATENÇÃO: Em produção, isso deve ser restrito. Para desenvolvimento local, libera o acesso.

-- PLANOS
CREATE POLICY "Permitir tudo em planos" 
ON public.planos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- LOJAS
CREATE POLICY "Permitir tudo em lojas" 
ON public.lojas 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Inserir dados de teste se estiver vazio
INSERT INTO public.planos (nome, price, description, active, highlight, limite_profissionais, limite_agendamentos, permite_pagamentos_online, permite_integracao_calendar)
SELECT 'Plano Básico', 49.90, 'Ideal para iniciantes', true, false, 2, 100, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.planos);

INSERT INTO public.lojas (nome, endereco, telefone, email)
SELECT 'Loja Exemplo', 'Rua das Flores, 123', '11999999999', 'contato@lojaexemplo.com'
WHERE NOT EXISTS (SELECT 1 FROM public.lojas);
