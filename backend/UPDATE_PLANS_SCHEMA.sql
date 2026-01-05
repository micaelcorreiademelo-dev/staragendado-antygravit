-- Add missing columns to plans table
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS highlight BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb;

-- Update existing rows with default values if needed
UPDATE public.planos SET price = 49.90, description = 'Plano Básico', active = true, highlight = false WHERE nome = 'Plano Básico';
UPDATE public.planos SET price = 99.90, description = 'Plano Profissional', active = true, highlight = true WHERE nome = 'Plano Profissional';
UPDATE public.planos SET price = 0.00, description = 'Plano Enterprise', active = false, highlight = false WHERE nome = 'Plano Enterprise';
