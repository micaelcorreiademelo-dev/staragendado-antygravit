-- Adicionar coluna 'is_default' para identificar o plano padrão
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Garantir que apenas um seja default (Unique constraint parcial)
-- Se já existir esse idx, não faz nada.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'unique_default_plan'
    ) THEN
        CREATE UNIQUE INDEX unique_default_plan ON public.planos (is_default) WHERE is_default = true;
    END IF;
END $$;

-- Atualizar cache do schema
NOTIFY pgrst, 'reload schema';
