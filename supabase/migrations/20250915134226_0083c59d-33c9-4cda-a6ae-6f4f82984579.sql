-- Rename academias table to negocios
ALTER TABLE public.academias RENAME TO negocios;

-- Update column name to be more generic
ALTER TABLE public.negocios RENAME COLUMN modalidades TO servicos_oferecidos;

-- Add new column for business type/segment
ALTER TABLE public.negocios ADD COLUMN tipo_negocio TEXT DEFAULT 'outros';

-- Update existing records to have a business type (keeping 'academia' for existing data)
UPDATE public.negocios SET tipo_negocio = 'academia' WHERE tipo_negocio = 'outros';

-- Update foreign key references in other tables
ALTER TABLE public.agendamentos RENAME COLUMN academia_id TO negocio_id;
ALTER TABLE public.automacoes RENAME COLUMN academia_id TO negocio_id;
ALTER TABLE public.chatbots RENAME COLUMN academia_id TO negocio_id;
ALTER TABLE public.leads RENAME COLUMN academia_id TO negocio_id;
ALTER TABLE public.vendas RENAME COLUMN academia_id TO negocio_id;

-- Update RLS policies for agendamentos
DROP POLICY IF EXISTS "Users can create agendamentos for their academias" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can view agendamentos of their academias" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can update agendamentos of their academias" ON public.agendamentos;

CREATE POLICY "Users can create agendamentos for their negocios" 
ON public.agendamentos FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = agendamentos.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can view agendamentos of their negocios" 
ON public.agendamentos FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = agendamentos.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can update agendamentos of their negocios" 
ON public.agendamentos FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = agendamentos.negocio_id 
  AND negocios.user_id = auth.uid()
));

-- Update RLS policies for automacoes
DROP POLICY IF EXISTS "Users can create automacoes for their academias" ON public.automacoes;
DROP POLICY IF EXISTS "Users can view automacoes of their academias" ON public.automacoes;
DROP POLICY IF EXISTS "Users can update automacoes of their academias" ON public.automacoes;

CREATE POLICY "Users can create automacoes for their negocios" 
ON public.automacoes FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = automacoes.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can view automacoes of their negocios" 
ON public.automacoes FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = automacoes.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can update automacoes of their negocios" 
ON public.automacoes FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = automacoes.negocio_id 
  AND negocios.user_id = auth.uid()
));

-- Update RLS policies for chatbots
DROP POLICY IF EXISTS "Users can create chatbots for their academias" ON public.chatbots;
DROP POLICY IF EXISTS "Users can view chatbots of their academias" ON public.chatbots;
DROP POLICY IF EXISTS "Users can update chatbots of their academias" ON public.chatbots;
DROP POLICY IF EXISTS "Users can delete chatbots of their academias" ON public.chatbots;

CREATE POLICY "Users can create chatbots for their negocios" 
ON public.chatbots FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = chatbots.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can view chatbots of their negocios" 
ON public.chatbots FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = chatbots.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can update chatbots of their negocios" 
ON public.chatbots FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = chatbots.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can delete chatbots of their negocios" 
ON public.chatbots FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = chatbots.negocio_id 
  AND negocios.user_id = auth.uid()
));

-- Update RLS policies for leads
DROP POLICY IF EXISTS "Users can create leads for their academias" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads of their academias" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads of their academias" ON public.leads;

CREATE POLICY "Users can create leads for their negocios" 
ON public.leads FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = leads.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can view leads of their negocios" 
ON public.leads FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = leads.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can update leads of their negocios" 
ON public.leads FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = leads.negocio_id 
  AND negocios.user_id = auth.uid()
));

-- Update RLS policies for vendas
DROP POLICY IF EXISTS "Users can create vendas for their academias" ON public.vendas;
DROP POLICY IF EXISTS "Users can view vendas of their academias" ON public.vendas;
DROP POLICY IF EXISTS "Users can update vendas of their academias" ON public.vendas;

CREATE POLICY "Users can create vendas for their negocios" 
ON public.vendas FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = vendas.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can view vendas of their negocios" 
ON public.vendas FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = vendas.negocio_id 
  AND negocios.user_id = auth.uid()
));

CREATE POLICY "Users can update vendas of their negocios" 
ON public.vendas FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM negocios 
  WHERE negocios.id = vendas.negocio_id 
  AND negocios.user_id = auth.uid()
));