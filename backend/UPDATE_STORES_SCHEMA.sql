-- Add status column if it doesn't exist
ALTER TABLE public.lojas 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativa';

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lojas';

-- Update existing rows to have a status
UPDATE public.lojas SET status = 'ativa' WHERE status IS NULL;
