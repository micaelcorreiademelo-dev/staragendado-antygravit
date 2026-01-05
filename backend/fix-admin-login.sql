-- Script para verificar e corrigir o login do admin

-- 1. Verificar se o admin existe na tabela auth.users
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email LIKE '%admin%' OR raw_user_meta_data->>'role' = 'admin';

-- 2. Verificar se o admin existe na tabela public.users
SELECT id, email, full_name, role 
FROM public.users 
WHERE role = 'admin' OR email LIKE '%admin%';

-- 3. Se o admin existir no auth mas não no public.users, inserir:
-- IMPORTANTE: Substitua 'SEU_ADMIN_ID' pelo ID real do admin encontrado na query 1
-- IMPORTANTE: Substitua 'admin@example.com' pelo email real do admin
-- IMPORTANTE: Substitua 'Admin User' pelo nome real do admin

-- INSERT INTO public.users (id, email, full_name, role, permissions)
-- SELECT 
--     id,
--     email,
--     COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
--     'admin',
--     '{"dashboard": true, "users": true, "stores": true, "services": true, "appointments": true}'::jsonb
-- FROM auth.users
-- WHERE email = 'admin@example.com'
-- ON CONFLICT (id) DO UPDATE SET
--     role = 'admin',
--     permissions = '{\"dashboard\": true, \"users\": true, \"stores\": true, \"services\": true, \"appointments\": true}'::jsonb;

-- 4. Atualizar o role de todos os admins existentes
UPDATE public.users 
SET role = 'admin',
    permissions = COALESCE(permissions, '{\"dashboard\": true, \"users\": true, \"stores\": true, \"services\": true, \"appointments\": true}'::jsonb)
WHERE email LIKE '%admin%' OR id IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
);
