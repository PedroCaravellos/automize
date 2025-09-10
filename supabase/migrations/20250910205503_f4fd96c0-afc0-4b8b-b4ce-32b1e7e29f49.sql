-- Criar tabelas para Fase 3: Agendamentos, Leads, Vendas e Automações

-- Tabela de Agendamentos
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academia_id UUID NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  cliente_email TEXT,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  servico TEXT NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'realizado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academia_id UUID NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  origem TEXT NOT NULL DEFAULT 'chatbot' CHECK (origem IN ('chatbot', 'whatsapp', 'site', 'indicacao', 'outro')),
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'qualificado', 'perdido', 'convertido')),
  pipeline_stage TEXT NOT NULL DEFAULT 'inicial' CHECK (pipeline_stage IN ('inicial', 'interesse', 'visita_agendada', 'proposta', 'fechamento')),
  interesse TEXT,
  observacoes TEXT,
  valor_estimado DECIMAL(10,2),
  data_ultimo_contato TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Vendas
CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  academia_id UUID NOT NULL,
  produto_servico TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  tipo_plano TEXT CHECK (tipo_plano IN ('mensal', 'trimestral', 'semestral', 'anual')),
  status TEXT NOT NULL DEFAULT 'proposta' CHECK (status IN ('proposta', 'fechada', 'cancelada')),
  data_fechamento TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Automações
CREATE TABLE public.automacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academia_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('novo_lead', 'agendamento', 'follow_up', 'tempo_decorrido')),
  trigger_config JSONB,
  actions JSONB NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para agendamentos
CREATE POLICY "Users can view agendamentos of their academias" 
ON public.agendamentos FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

CREATE POLICY "Users can insert agendamentos for their academias" 
ON public.agendamentos FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

CREATE POLICY "Users can update agendamentos of their academias" 
ON public.agendamentos FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

-- Políticas RLS para leads
CREATE POLICY "Users can view leads of their academias" 
ON public.leads FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

CREATE POLICY "Users can insert leads for their academias" 
ON public.leads FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

CREATE POLICY "Users can update leads of their academias" 
ON public.leads FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

-- Políticas RLS para vendas
CREATE POLICY "Users can view vendas of their academias" 
ON public.vendas FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

CREATE POLICY "Users can insert vendas for their academias" 
ON public.vendas FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

CREATE POLICY "Users can update vendas of their academias" 
ON public.vendas FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

-- Políticas RLS para automações
CREATE POLICY "Users can view automacoes of their academias" 
ON public.automacoes FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

CREATE POLICY "Users can insert automacoes for their academias" 
ON public.automacoes FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

CREATE POLICY "Users can update automacoes of their academias" 
ON public.automacoes FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.id::text = academia_id::text
));

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendas_updated_at
  BEFORE UPDATE ON public.vendas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automacoes_updated_at
  BEFORE UPDATE ON public.automacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_agendamentos_academia_id ON public.agendamentos(academia_id);
CREATE INDEX idx_agendamentos_data_hora ON public.agendamentos(data_hora);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);

CREATE INDEX idx_leads_academia_id ON public.leads(academia_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_pipeline_stage ON public.leads(pipeline_stage);
CREATE INDEX idx_leads_origem ON public.leads(origem);

CREATE INDEX idx_vendas_academia_id ON public.vendas(academia_id);
CREATE INDEX idx_vendas_lead_id ON public.vendas(lead_id);
CREATE INDEX idx_vendas_status ON public.vendas(status);

CREATE INDEX idx_automacoes_academia_id ON public.automacoes(academia_id);
CREATE INDEX idx_automacoes_trigger_type ON public.automacoes(trigger_type);
CREATE INDEX idx_automacoes_ativo ON public.automacoes(ativo);