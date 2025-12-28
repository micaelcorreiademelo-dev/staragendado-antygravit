-- Script para corrigir a tabela de profissionais
-- Adiciona colunas que podem estar faltando e causaram o erro na criação

-- 1. Adicionar coluna 'avatar' se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profissionais' AND column_name = 'avatar') THEN
        ALTER TABLE public.profissionais ADD COLUMN avatar TEXT;
    END IF;
END $$;

-- 2. Adicionar coluna 'phone' se não existir (garantia)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profissionais' AND column_name = 'phone') THEN
        ALTER TABLE public.profissionais ADD COLUMN phone TEXT;
    END IF;
END $$;

-- 3. Adicionar coluna 'disponibilidade' se não existir (garantia)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profissionais' AND column_name = 'disponibilidade') THEN
        ALTER TABLE public.profissionais ADD COLUMN disponibilidade JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 4. Adicionar coluna 'indisponibilidades' se não existir (garantia)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profissionais' AND column_name = 'indisponibilidades') THEN
        ALTER TABLE public.profissionais ADD COLUMN indisponibilidades JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 5. Atualizar cache do schema (recarregando a tabela)
NOTIFY pgrst, 'reload schema';
