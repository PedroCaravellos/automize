-- Adicionar ON DELETE CASCADE para permitir exclusão de chatbots
-- Primeiro, precisamos verificar se há foreign keys que impedem a exclusão

-- Se houver conversations relacionadas, elas também devem ser deletadas
-- Vamos adicionar uma trigger ou ajustar a RLS para permitir a exclusão

-- Permitir que usuários deletem conversas de seus chatbots
DROP POLICY IF EXISTS "Users can delete conversations of their chatbots" ON chatbot_conversations;

CREATE POLICY "Users can delete conversations of their chatbots"
ON chatbot_conversations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chatbots
    WHERE chatbots.id = chatbot_conversations.chatbot_id
    AND EXISTS (
      SELECT 1 FROM negocios
      WHERE negocios.id = chatbots.negocio_id
      AND negocios.user_id = auth.uid()
    )
  )
);

-- Permitir que usuários deletem mensagens de conversas de seus chatbots
DROP POLICY IF EXISTS "Users can delete messages of their chatbot conversations" ON chatbot_messages;

CREATE POLICY "Users can delete messages of their chatbot conversations"
ON chatbot_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chatbot_conversations
    WHERE chatbot_conversations.id = chatbot_messages.conversation_id
    AND EXISTS (
      SELECT 1 FROM chatbots
      WHERE chatbots.id = chatbot_conversations.chatbot_id
      AND EXISTS (
        SELECT 1 FROM negocios
        WHERE negocios.id = chatbots.negocio_id
        AND negocios.user_id = auth.uid()
      )
    )
  )
);