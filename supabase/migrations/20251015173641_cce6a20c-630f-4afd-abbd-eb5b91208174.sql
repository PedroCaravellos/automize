-- Create chatbot_conversations table to store conversation sessions
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_messages INTEGER NOT NULL DEFAULT 0,
  lead_captured BOOLEAN NOT NULL DEFAULT false,
  sentiment_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot_messages table to store individual messages
CREATE TABLE IF NOT EXISTS public.chatbot_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_chatbot_id ON public.chatbot_conversations(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_negocio_id ON public.chatbot_conversations(negocio_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_started_at ON public.chatbot_conversations(started_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation_id ON public.chatbot_messages(conversation_id);

-- Add RLS policies for chatbot_conversations
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations of their chatbots"
  ON public.chatbot_conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_conversations.chatbot_id
      AND EXISTS (
        SELECT 1 FROM public.negocios
        WHERE negocios.id = chatbots.negocio_id
        AND negocios.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create conversations for their chatbots"
  ON public.chatbot_conversations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_conversations.chatbot_id
      AND EXISTS (
        SELECT 1 FROM public.negocios
        WHERE negocios.id = chatbots.negocio_id
        AND negocios.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update conversations of their chatbots"
  ON public.chatbot_conversations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_conversations.chatbot_id
      AND EXISTS (
        SELECT 1 FROM public.negocios
        WHERE negocios.id = chatbots.negocio_id
        AND negocios.user_id = auth.uid()
      )
    )
  );

-- Add RLS policies for chatbot_messages
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their chatbot conversations"
  ON public.chatbot_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND EXISTS (
        SELECT 1 FROM public.chatbots
        WHERE chatbots.id = chatbot_conversations.chatbot_id
        AND EXISTS (
          SELECT 1 FROM public.negocios
          WHERE negocios.id = chatbots.negocio_id
          AND negocios.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create messages for their chatbot conversations"
  ON public.chatbot_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND EXISTS (
        SELECT 1 FROM public.chatbots
        WHERE chatbots.id = chatbot_conversations.chatbot_id
        AND EXISTS (
          SELECT 1 FROM public.negocios
          WHERE negocios.id = chatbots.negocio_id
          AND negocios.user_id = auth.uid()
        )
      )
    )
  );

-- Add trigger for updated_at on chatbot_conversations
CREATE TRIGGER update_chatbot_conversations_updated_at
  BEFORE UPDATE ON public.chatbot_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();