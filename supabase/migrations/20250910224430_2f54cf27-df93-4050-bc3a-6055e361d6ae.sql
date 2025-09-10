-- Add missing columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'novo',
ADD COLUMN IF NOT EXISTS valor_estimado numeric;

-- Add missing columns to vendas table  
ALTER TABLE public.vendas
ADD COLUMN IF NOT EXISTS data_fechamento timestamp with time zone,
ADD COLUMN IF NOT EXISTS produto_servico text;