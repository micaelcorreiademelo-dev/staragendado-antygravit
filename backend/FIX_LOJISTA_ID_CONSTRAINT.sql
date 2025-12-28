-- ============================================
-- VERIFICAR E CORRIGIR CONSTRAINT lojista_id
-- ============================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA LOJAS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'lojas'
ORDER BY ordinal_position;

-- 2. TORNAR lojista_id NULLABLE (se existir)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lojas' AND column_name = 'lojista_id'
    ) THEN
        ALTER TABLE public.lojas ALTER COLUMN lojista_id DROP NOT NULL;
        RAISE NOTICE 'Coluna lojista_id agora é NULLABLE';
    END IF;
END $$;

-- 3. TORNAR user_id NULLABLE (se existir)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lojas' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.lojas ALTER COLUMN user_id DROP NOT NULL;
        RAISE NOTICE 'Coluna user_id agora é NULLABLE';
    END IF;
END $$;

-- 4. VERIFICAR ESTRUTURA ATUALIZADA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'lojas'
ORDER BY ordinal_position;
