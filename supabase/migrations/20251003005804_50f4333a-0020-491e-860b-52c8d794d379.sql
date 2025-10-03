-- Adicionar campos necessários para armazenar informações completas do chatbot
ALTER TABLE public.chatbots
ADD COLUMN IF NOT EXISTS template text,
ADD COLUMN IF NOT EXISTS mensagens jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Em configuração',
ADD COLUMN IF NOT EXISTS interacoes integer DEFAULT 0;

-- Atualizar o campo ativo para usar o novo status
UPDATE public.chatbots
SET status = CASE 
  WHEN ativo = true THEN 'Ativo'
  ELSE 'Em configuração'
END
WHERE status IS NULL;