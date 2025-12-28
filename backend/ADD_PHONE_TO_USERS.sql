-- ============================================
-- ADICIONAR COLUNA PHONE NA TABELA USERS
-- ============================================

-- 1. Verificar e adicionar coluna phone
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
        RAISE NOTICE 'Coluna phone adicionada na tabela users';
    ELSE
        RAISE NOTICE 'Coluna phone já existe na tabela users';
    END IF;
END $$;

-- 2. Verificar estrutura atualizada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
