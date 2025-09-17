-- Refatorar tabela whatsapp_integrations para modelo centralizado
-- Primeiro, renomear a tabela atual para backup
ALTER TABLE whatsapp_integrations RENAME TO whatsapp_integrations_backup;

-- Criar nova tabela com modelo centralizado
CREATE TABLE public.whatsapp_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Dados da empresa fornecidos pelo cliente
  nome_empresa TEXT NOT NULL,
  documento TEXT NOT NULL, -- CNPJ/CPF
  numero_whatsapp TEXT NOT NULL, -- Número que será integrado
  business_manager_id TEXT, -- ID do Business Manager do Facebook
  
  -- Status e controle interno
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, aprovado, ativo, rejeitado
  observacoes TEXT, -- Para anotações internas sobre o processo
  
  -- Dados técnicos (gerenciados internamente)
  phone_number_id TEXT, -- Será preenchido após registro no 360Dialog
  is_active BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE, -- Quando foi aprovado
  activated_at TIMESTAMP WITH TIME ZONE -- Quando ficou ativo
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_integrations ENABLE ROW LEVEL SECURITY;

-- Policies para novo modelo
CREATE POLICY "Users can view their own WhatsApp integrations" 
ON public.whatsapp_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own WhatsApp integrations" 
ON public.whatsapp_integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WhatsApp integrations" 
ON public.whatsapp_integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WhatsApp integrations" 
ON public.whatsapp_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_integrations_updated_at
BEFORE UPDATE ON public.whatsapp_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para otimizar consultas
CREATE INDEX idx_whatsapp_integrations_user_id ON public.whatsapp_integrations(user_id);
CREATE INDEX idx_whatsapp_integrations_numero_whatsapp ON public.whatsapp_integrations(numero_whatsapp);
CREATE INDEX idx_whatsapp_integrations_status ON public.whatsapp_integrations(status);

-- Constraint para garantir único número por usuário
ALTER TABLE public.whatsapp_integrations 
ADD CONSTRAINT unique_user_numero_whatsapp 
UNIQUE (user_id, numero_whatsapp);