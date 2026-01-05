-- ============================================
-- SCRIPT DE RESET DE AUTENTICAÇÃO
-- ============================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Limpar tudo relacionado ao admin para começar do zero
BEGIN;
  DELETE FROM public.users WHERE email = 'admin@staragendado.com';
  DELETE FROM auth.users WHERE email = 'admin@staragendado.com';
COMMIT;

-- 2. Verificar se limpou
SELECT count(*) as total_users FROM auth.users WHERE email = 'admin@staragendado.com';

-- ============================================
-- AGORA SIGA ESTES PASSOS NO DASHBOARD:
-- ============================================
-- 1. Vá em Authentication > Users
-- 2. Clique em "Add User" > "Create new user"
-- 3. Email: admin@staragendado.com
-- 4. Senha: Admin@123
-- 5. MARQUE "Auto Confirm User"
-- 6. Clique em "Create user"
-- 7. Copie o UUID do usuário criado
--
-- DEPOIS DE CRIAR, EXECUTE O COMANDO ABAIXO (SUBSTITUA O ID):
--
-- INSERT INTO public.users (id, full_name, email, role, loja_id)
-- VALUES ('COLE_O_UUID_AQUI', 'Administrador', 'admin@staragendado.com', 'admin', NULL);
