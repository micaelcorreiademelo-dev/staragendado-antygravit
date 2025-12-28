-- Script para diagnosticar o problema de funcionários não aparecendo no painel

-- 1. Ver TODOS os usuários na tabela users
SELECT 
    'TODOS OS USUÁRIOS' as categoria,
    id, 
    email, 
    full_name, 
    role,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- 2. Ver apenas funcionários e admins
SELECT 
    'FUNCIONÁRIOS E ADMINS' as categoria,
    id, 
    email, 
    full_name, 
    role,
    created_at
FROM public.users
WHERE role IN ('admin', 'funcionario')
ORDER BY created_at DESC;

-- 3. Ver usuários com role NULL ou diferente
SELECT 
    'USUÁRIOS COM ROLE PROBLEMÁTICO' as categoria,
    id, 
    email, 
    full_name, 
    role,
    created_at
FROM public.users
WHERE role IS NULL OR role NOT IN ('admin', 'funcionario', 'lojista', 'profissional', 'cliente')
ORDER BY created_at DESC;

-- 4. Contar por role
SELECT 
    role,
    COUNT(*) as total
FROM public.users
GROUP BY role
ORDER BY total DESC;

-- 5. CORREÇÃO: Atualizar funcionários sem role para 'admin'
-- Execute este comando se encontrar usuários sem role que deveriam ser funcionários
-- UPDATE public.users 
-- SET role = 'admin'
-- WHERE role IS NULL 
--   AND email LIKE '%@%'  -- Ajuste este filtro conforme necessário
--   AND id IN (
--     SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
--   );
