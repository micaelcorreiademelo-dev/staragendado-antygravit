-- ============================================
-- Script de Inicialização - StarAgendado (CORRIGIDO)
-- ============================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- ============================================
-- 1. TORNAR lojista_id OPCIONAL (TEMPORARIAMENTE)
-- ============================================
-- Isso permite criar lojas de exemplo sem vincular a um usuário específico

DO $$ 
BEGIN
    -- Verificar se a coluna lojista_id existe e torná-la nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lojas' AND column_name = 'lojista_id'
    ) THEN
        ALTER TABLE public.lojas ALTER COLUMN lojista_id DROP NOT NULL;
    END IF;
    
    -- Verificar se a coluna user_id existe e torná-la nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lojas' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.lojas ALTER COLUMN user_id DROP NOT NULL;
    END IF;
END $$;

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

  -- Inserir lojas de exemplo (sem lojista_id por enquanto)
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
SELECT id, nome, email, status, plano_id FROM lojas;

-- ============================================
-- PRÓXIMO PASSO: Testar a aplicação
-- ============================================
-- Acesse http://localhost:5173
-- Faça login como admin (admin@staragendado.com / admin@123)
-- Navegue até "Lojas" e verifique se as lojas aparecem!
-- ============================================
