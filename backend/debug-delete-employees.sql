-- Script para diagnosticar problemas de exclusão de funcionários

-- PASSO 1: Verificar se RLS está habilitado na tabela users
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'users' AND schemaname = 'public';

-- PASSO 2: Ver todas as políticas RLS na tabela users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as comando,
    qual as usando_expressao,
    with_check as com_verificacao
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public';

-- PASSO 3: Verificar permissões da tabela users
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'users' AND table_schema = 'public';

-- PASSO 4: Tentar deletar um usuário específico (TESTE)
-- IMPORTANTE: Substitua 'ID_DO_FUNCIONARIO' pelo ID real de um funcionário de teste
-- DELETE FROM public.users WHERE id = 'ID_DO_FUNCIONARIO';

-- PASSO 5: Se RLS estiver bloqueando, você pode desabilitar temporariamente para teste
-- ATENÇÃO: Isso remove a segurança! Use apenas para diagnóstico!
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- PASSO 6: Ou criar uma política que permita DELETE
-- CREATE POLICY "Permitir DELETE para service_role" 
-- ON public.users
-- FOR DELETE
-- TO service_role
-- USING (true);

-- PASSO 7: Ver todas as constraints que podem estar impedindo a exclusão
SELECT
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'users' AND tc.table_schema = 'public';
