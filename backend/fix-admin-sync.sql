-- Script para corrigir o login do admin após mudanças na gestão de funcionários
-- Execute este script no SQL Editor do Supabase

-- PASSO 1: Verificar o estado atual do admin
SELECT 'AUTH.USERS' as tabela, id, email, raw_user_meta_data->>'role' as role_metadata
FROM auth.users 
WHERE email = 'admin@staragendado.com'
UNION ALL
SELECT 'PUBLIC.USERS' as tabela, id::text, email, role
FROM public.users 
WHERE email = 'admin@staragendado.com';

-- PASSO 2: Sincronizar o admin na tabela public.users
-- Isso garante que o admin exista na tabela users com o role correto
INSERT INTO public.users (id, email, full_name, role, permissions)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Administrador') as full_name,
    'admin' as role,
    '{\"dashboard\": true, \"users\": true, \"stores\": true, \"services\": true, \"appointments\": true, \"employees\": true}'::jsonb as permissions
FROM auth.users au
WHERE au.email = 'admin@staragendado.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    email = EXCLUDED.email,
    full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
    permissions = '{\"dashboard\": true, \"users\": true, \"stores\": true, \"services\": true, \"appointments\": true, \"employees\": true}'::jsonb;

-- PASSO 3: Atualizar o user_metadata no auth.users para garantir consistência
UPDATE auth.users
SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
        'role', 'admin',
        'full_name', COALESCE(raw_user_meta_data->>'full_name', 'Administrador')
    )
WHERE email = 'admin@staragendado.com';

-- PASSO 4: Verificar o resultado final
SELECT 
    'Verificação Final' as status,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    pu.role as db_role,
    pu.full_name,
    pu.permissions
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'admin@staragendado.com';
