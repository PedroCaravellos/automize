-- Adicionar política DELETE para agendamentos (crítico de segurança)
CREATE POLICY "Users can delete agendamentos of their negocios" 
ON public.agendamentos 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM negocios
    WHERE negocios.id = agendamentos.negocio_id 
    AND negocios.user_id = auth.uid()
  )
);