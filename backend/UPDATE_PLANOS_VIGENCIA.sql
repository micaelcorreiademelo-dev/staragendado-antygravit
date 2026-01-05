-- Adicionar coluna vigencia_dias na tabela planos
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS vigencia_dias INTEGER DEFAULT 30;

-- Atualizar cache do schema
NOTIFY pgrst, 'reload schema';
