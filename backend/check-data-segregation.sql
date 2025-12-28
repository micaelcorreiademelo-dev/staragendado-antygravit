-- Diagnóstico de Segregação de Dados

-- 1. Verificar usuários na tabela USERS que NÃO são 'admin'
-- O painel admin lista usuários filtrando por role='admin'.
-- Se houver outros roles aqui, eles existem mas não deveriam aparecer no painel,
-- A MENOS que tenham sido cadastrados erroneamente como 'admin'.
SELECT 
    id, 
    email, 
    role, 
    full_name, 
    created_at 
FROM public.users
WHERE role != 'admin';

-- 2. Verificar se existem Profissionais que também estão na tabela Users
-- Isso indicaria uma duplicação indevida (profissional criado como usuário do sistema)
SELECT 
    p.id as profissional_id,
    p.nome as profissional_nome,
    p.email as profissional_email,
    u.id as user_id,
    u.role as user_role
FROM public.profissionais p
JOIN public.users u ON u.email = p.email;

-- 3. Contar total de usuários por role
SELECT role, count(*) 
FROM public.users 
GROUP BY role;

-- 4. Verificar se existem profissionais com 'admin' como role na tabela users (caso de erro grave)
SELECT 
    u.id, u.email, u.full_name
FROM public.users u
JOIN public.profissionais p ON p.email = u.email
WHERE u.role = 'admin';
