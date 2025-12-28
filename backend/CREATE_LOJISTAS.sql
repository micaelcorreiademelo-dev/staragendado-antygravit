-- ============================================
-- CRIAR USUÁRIOS LOJISTAS DE EXEMPLO
-- ============================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- IMPORTANTE: Execute ANTES de criar lojas

-- ============================================
-- 1. CRIAR USUÁRIOS LOJISTAS
-- ============================================

DO $$
BEGIN
    -- Lojista 1: João Silva
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'joao.silva@email.com') THEN
        INSERT INTO public.users (id, email, full_name, role, created_at)
        VALUES (
            gen_random_uuid(),
            'joao.silva@email.com',
            'João Silva',
            'lojista',
            NOW()
        );
        RAISE NOTICE 'Lojista João Silva criado';
    END IF;

    -- Lojista 2: Maria Santos
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'maria.santos@email.com') THEN
        INSERT INTO public.users (id, email, full_name, role, created_at)
        VALUES (
            gen_random_uuid(),
            'maria.santos@email.com',
            'Maria Santos',
            'lojista',
            NOW()
        );
        RAISE NOTICE 'Lojista Maria Santos criada';
    END IF;

    -- Lojista 3: Pedro Oliveira
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'pedro.oliveira@email.com') THEN
        INSERT INTO public.users (id, email, full_name, role, created_at)
        VALUES (
            gen_random_uuid(),
            'pedro.oliveira@email.com',
            'Pedro Oliveira',
            'lojista',
            NOW()
        );
        RAISE NOTICE 'Lojista Pedro Oliveira criado';
    END IF;

    -- Lojista 4: Ana Costa
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'ana.costa@email.com') THEN
        INSERT INTO public.users (id, email, full_name, role, created_at)
        VALUES (
            gen_random_uuid(),
            'ana.costa@email.com',
            'Ana Costa',
            'lojista',
            NOW()
        );
        RAISE NOTICE 'Lojista Ana Costa criada';
    END IF;

    -- Lojista 5: Carlos Mendes
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'carlos.mendes@email.com') THEN
        INSERT INTO public.users (id, email, full_name, role, created_at)
        VALUES (
            gen_random_uuid(),
            'carlos.mendes@email.com',
            'Carlos Mendes',
            'lojista',
            NOW()
        );
        RAISE NOTICE 'Lojista Carlos Mendes criado';
    END IF;
END $$;

-- ============================================
-- 2. VERIFICAR LOJISTAS CRIADOS
-- ============================================

SELECT id, email, full_name, role, created_at 
FROM public.users 
WHERE role = 'lojista'
ORDER BY created_at DESC;

-- ============================================
-- PRÓXIMO PASSO
-- ============================================
-- Agora você pode criar lojas vinculando-as a esses lojistas!
-- Use os IDs retornados acima ao criar novas lojas.
-- ============================================
