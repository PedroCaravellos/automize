-- Atualizar a tabela automacoes para ter a estrutura correta
ALTER TABLE public.automacoes 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS ativa BOOLEAN DEFAULT true;

-- Preencher user_id baseado no negocio_id
UPDATE public.automacoes 
SET user_id = (
  SELECT user_id FROM public.negocios 
  WHERE negocios.id = automacoes.negocio_id
) 
WHERE user_id IS NULL;

-- Criar tabela para etapas das automações
CREATE TABLE IF NOT EXISTS public.automacao_etapas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automacao_id UUID NOT NULL REFERENCES public.automacoes(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- 'enviar_mensagem', 'aguardar', 'condicao', 'webhook', 'atualizar_lead'
  configuracao JSONB NOT NULL DEFAULT '{}',
  posicao_x INTEGER DEFAULT 0,
  posicao_y INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para execuções das automações
CREATE TABLE IF NOT EXISTS public.automacao_execucoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automacao_id UUID NOT NULL REFERENCES public.automacoes(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'executando', -- 'executando', 'pausada', 'concluida', 'falhou'
  etapa_atual_id UUID REFERENCES public.automacao_etapas(id),
  dados_contexto JSONB DEFAULT '{}',
  iniciada_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  concluida_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs de execução
CREATE TABLE IF NOT EXISTS public.automacao_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execucao_id UUID NOT NULL REFERENCES public.automacao_execucoes(id) ON DELETE CASCADE,
  etapa_id UUID REFERENCES public.automacao_etapas(id),
  acao TEXT NOT NULL,
  resultado TEXT,
  detalhes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS nas novas tabelas
ALTER TABLE public.automacao_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automacao_execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automacao_logs ENABLE ROW LEVEL SECURITY;

-- Atualizar políticas da tabela automacoes
DROP POLICY IF EXISTS "Users can manage their automations" ON public.automacoes;
CREATE POLICY "Users can manage their automations" 
ON public.automacoes 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies para as outras tabelas
CREATE POLICY "Users can manage their automation steps" 
ON public.automacao_etapas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.automacoes a 
  WHERE a.id = automacao_etapas.automacao_id 
  AND a.user_id = auth.uid()
));

CREATE POLICY "Users can view their automation executions" 
ON public.automacao_execucoes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.automacoes a 
  WHERE a.id = automacao_execucoes.automacao_id 
  AND a.user_id = auth.uid()
));

CREATE POLICY "Users can view their automation logs" 
ON public.automacao_logs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.automacao_execucoes e 
  JOIN public.automacoes a ON a.id = e.automacao_id
  WHERE e.id = automacao_logs.execucao_id 
  AND a.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_automacao_etapas_automacao_id ON public.automacao_etapas(automacao_id);
CREATE INDEX IF NOT EXISTS idx_automacao_execucoes_automacao_id ON public.automacao_execucoes(automacao_id);
CREATE INDEX IF NOT EXISTS idx_automacao_execucoes_status ON public.automacao_execucoes(status);
CREATE INDEX IF NOT EXISTS idx_automacao_logs_execucao_id ON public.automacao_logs(execucao_id);