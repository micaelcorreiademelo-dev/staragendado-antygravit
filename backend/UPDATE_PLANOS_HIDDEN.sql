-- Adicionar coluna 'hidden' para ocultar planos do painel do lojista
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- Atualizar cache do schema
NOTIFY pgrst, 'reload schema';
