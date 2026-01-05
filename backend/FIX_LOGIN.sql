-- ============================================
-- SCRIPT DE CORREÇÃO DE LOGIN (NUCLEAR OPTION)
-- ============================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/tuxypcfryphcqtuqewbo/editor

-- 1. Habilitar extensão necessária para criptografia de senha
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Limpeza Forçada (Remove qualquer vestígio do usuário)
BEGIN;
  -- Remove da tabela pública primeiro (por causa da FK)
  DELETE FROM public.users WHERE email = 'admin@staragendado.com';
  
  -- Remove da tabela de autenticação
  DELETE FROM auth.users WHERE email = 'admin@staragendado.com';
COMMIT;

-- 3. Recriar Usuário no Auth (Simulando o que o Dashboard faz)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@staragendado.com',
    crypt('Admin@123', gen_salt('bf')), -- Senha: Admin@123
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 4. Vincular à tabela pública users
INSERT INTO public.users (id, full_name, email, role, loja_id)
SELECT 
  id, 
  'Administrador', 
  email, 
  'admin', 
  NULL
FROM auth.users
WHERE email = 'admin@staragendado.com';

-- 5. Verificar se deu certo
SELECT id, email, role FROM public.users WHERE email = 'admin@staragendado.com';
