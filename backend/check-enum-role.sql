-- Script para verificar o ENUM user_role e corrigir o problema

-- PASSO 1: Ver quais valores são permitidos no enum user_role
SELECT 
    enumlabel as valor_permitido
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'user_role'
)
ORDER BY enumsortorder;

-- PASSO 2: Ver a estrutura da tabela users
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASSO 3: Ver todos os usuários e seus roles
SELECT 
    id, 
    email, 
    full_name, 
    role,
    created_at
FROM public.users
ORDER BY created_at DESC;
