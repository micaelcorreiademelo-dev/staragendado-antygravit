-- First, let's check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'planos'
ORDER BY ordinal_position;

-- Check current data
SELECT * FROM public.planos;

-- If the table is empty or missing data, insert sample plans
INSERT INTO public.planos (
    nome, 
    limite_profissionais, 
    limite_agendamentos, 
    permite_pagamentos_online, 
    permite_integracao_calendar,
    price,
    description,
    active,
    highlight
) VALUES 
(
    'Plano Básico',
    2,
    100,
    true,
    false,
    49.90,
    'Ideal para profissionais autônomos.',
    true,
    false
),
(
    'Plano Profissional',
    10,
    500,
    true,
    true,
    99.90,
    'Para equipes em crescimento.',
    true,
    true
),
(
    'Plano Enterprise',
    -1,
    -1,
    true,
    true,
    0.00,
    'Soluções personalizadas.',
    false,
    false
)
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT * FROM public.planos;
