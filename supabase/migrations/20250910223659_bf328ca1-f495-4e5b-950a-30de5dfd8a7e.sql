-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  plano TEXT DEFAULT 'trial',
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create academias table 
CREATE TABLE public.academias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  unidade TEXT,
  endereco TEXT,
  telefone TEXT,
  whatsapp TEXT,
  horario_funcionamento TEXT,
  modalidades TEXT[],
  valores JSONB,
  promocoes TEXT,
  diferenciais TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbots table
CREATE TABLE public.chatbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academia_id UUID NOT NULL REFERENCES public.academias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  personalidade TEXT,
  instrucoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academia_id UUID NOT NULL REFERENCES public.academias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  origem TEXT,
  status TEXT DEFAULT 'novo',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendas table
CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academia_id UUID NOT NULL REFERENCES public.academias(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id),
  cliente_nome TEXT NOT NULL,
  valor DECIMAL(10,2),
  plano TEXT,
  status TEXT DEFAULT 'ativa',
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agendamentos table
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academia_id UUID NOT NULL REFERENCES public.academias(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  cliente_email TEXT,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  servico TEXT NOT NULL,
  observacoes TEXT,
  status TEXT DEFAULT 'agendado',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automacoes table
CREATE TABLE public.automacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academia_id UUID NOT NULL REFERENCES public.academias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB,
  actions JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automacoes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for academias
CREATE POLICY "Users can view their own academias" ON public.academias
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own academias" ON public.academias
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own academias" ON public.academias
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own academias" ON public.academias
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for chatbots
CREATE POLICY "Users can view chatbots of their academias" ON public.chatbots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = chatbots.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chatbots for their academias" ON public.chatbots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = chatbots.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chatbots of their academias" ON public.chatbots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = chatbots.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chatbots of their academias" ON public.chatbots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = chatbots.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

-- Create policies for leads
CREATE POLICY "Users can view leads of their academias" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = leads.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create leads for their academias" ON public.leads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = leads.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads of their academias" ON public.leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = leads.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

-- Create policies for vendas
CREATE POLICY "Users can view vendas of their academias" ON public.vendas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = vendas.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create vendas for their academias" ON public.vendas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = vendas.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update vendas of their academias" ON public.vendas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = vendas.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

-- Create policies for agendamentos
CREATE POLICY "Users can view agendamentos of their academias" ON public.agendamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = agendamentos.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create agendamentos for their academias" ON public.agendamentos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = agendamentos.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update agendamentos of their academias" ON public.agendamentos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = agendamentos.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

-- Create policies for automacoes
CREATE POLICY "Users can view automacoes of their academias" ON public.automacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = automacoes.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create automacoes for their academias" ON public.automacoes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = automacoes.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update automacoes of their academias" ON public.automacoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.academias 
      WHERE academias.id = automacoes.academia_id 
      AND academias.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academias_updated_at
  BEFORE UPDATE ON public.academias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON public.chatbots
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

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automacoes_updated_at
  BEFORE UPDATE ON public.automacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();