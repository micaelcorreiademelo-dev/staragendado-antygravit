
-- Criar tabela de segmentos
CREATE TABLE IF NOT EXISTS public.segmentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir segmentos iniciais
INSERT INTO public.segmentos (nome) 
VALUES 
    ('Beleza e Estética'),
    ('Eventos, Espaços e Recursos'),
    ('Educação e Aulas Particulares'),
    ('Serviços de Saúde');

-- Permitir acesso público para leitura (para o shop) e restrito para escrita (admin)
-- Ajuste as policies conforme sua configuração de RLS.
-- Exemplo RLS:
-- ALTER TABLE public.segmentos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public segments are viewable by everyone" ON public.segmentos FOR SELECT USING (true);
-- CREATE POLICY "Only admins can insert/update/delete segments" ON public.segmentos FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Adicionar coluna na tabela lojas
ALTER TABLE public.lojas ADD COLUMN IF NOT EXISTS segmento_id UUID REFERENCES public.segmentos(id);

-- Opcional: Adicionar índice
CREATE INDEX IF NOT EXISTS idx_lojas_segmento ON public.lojas(segmento_id);
