-- Adiciona suporte a permissões na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Opcional: Criar um tipo de enum para role se não for apenas string
-- Mas vamos manter role como string ('admin', 'lojista', 'funcionario')

-- Comentario: Permissões sugeridas:
-- {
--   "dashboard": true,
--   "stores": true,
--   "plans": true,
--   "employees": true,
--   "financial": true,
--   "settings": true
-- }
