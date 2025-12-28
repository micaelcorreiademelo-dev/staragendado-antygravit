-- ============================================
-- Script de Inicialização - StarAgendado
-- ============================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/tuxypcfryphcqtuqewbo/editor

-- ============================================
-- 1. CRIAR PLANOS
-- ============================================

INSERT INTO planos (nome, limite_profissionais, limite_agendamentos, permite_pagamentos_online, permite_integracao_calendar)
VALUES 
  ('Básico', 2, 50, FALSE, FALSE),
  ('Profissional', 5, 200, TRUE, FALSE),
  ('Enterprise', 20, 1000, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. CRIAR LOJAS DE EXEMPLO
-- ============================================

DO $$
DECLARE
  plano_basico_id UUID;
  plano_pro_id UUID;
  plano_enterprise_id UUID;
BEGIN
  -- Pegar IDs dos planos
  SELECT id INTO plano_basico_id FROM planos WHERE nome = 'Básico' LIMIT 1;
  SELECT id INTO plano_pro_id FROM planos WHERE nome = 'Profissional' LIMIT 1;
  SELECT id INTO plano_enterprise_id FROM planos WHERE nome = 'Enterprise' LIMIT 1;

  -- Inserir lojas de exemplo
  INSERT INTO lojas (nome, email, plano_id, status)
  VALUES 
    ('Barbearia do Zé', 'ze@barbearia.com', plano_pro_id, 'ativa'),
    ('Salão Beleza Pura', 'contato@belezapura.com', plano_enterprise_id, 'ativa'),
    ('Studio de Tatuagem Art', 'tattoo@artstudio.com', plano_basico_id, 'ativa'),
    ('Clínica Estética Pele & Cia', 'pele@estetica.com', plano_enterprise_id, 'ativa'),
    ('Barber Shop King', 'king@barber.com', plano_basico_id, 'pendente'),
    ('Esmalteria Chic', 'contato@chic.com', plano_basico_id, 'ativa'),
    ('Spa Relax', 'zen@spa.com', plano_pro_id, 'ativa')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 3. VERIFICAR CRIAÇÃO
-- ============================================

-- Verificar planos
SELECT id, nome, limite_profissionais, limite_agendamentos FROM planos;

-- Verificar lojas
SELECT id, nome, email, status FROM lojas;

-- ============================================
-- PRÓXIMO PASSO: CRIAR USUÁRIO ADMIN
-- ============================================
-- O usuário admin deve ser criado via Supabase Dashboard:
-- 
-- 1. Vá para: Authentication > Users
-- 2. Clique em "Add User" > "Create new user"
-- 3. Email: admin@staragendado.com
-- 4. Password: Admin@123
-- 5. Clique em "Create user"
-- 6. Copie o UUID do usuário criado
-- 7. Execute o comando abaixo substituindo USER_UUID_AQUI:
--
-- INSERT INTO users (id, full_name, email, role, loja_id)
-- VALUES ('USER_UUID_AQUI', 'Administrador', 'admin@staragendado.com', 'admin', NULL);
-- ============================================
