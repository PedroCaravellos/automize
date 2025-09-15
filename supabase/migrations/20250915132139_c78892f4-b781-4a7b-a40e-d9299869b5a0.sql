-- Atualizar leads existentes para alinhar com o pipeline de vendas
-- Baseado nas observações existentes, vamos categorizar melhor os leads

-- Leads com agendamentos devem ir para "visita_agendada"
UPDATE leads 
SET 
  pipeline_stage = 'visita_agendada',
  status = 'contatado',
  observacoes = CASE 
    WHEN observacoes ILIKE '%agendamento%' THEN 
      'Interessado em: ' || 
      CASE 
        WHEN observacoes ILIKE '%musculação%' THEN 'Musculação'
        WHEN observacoes ILIKE '%natação%' THEN 'Natação' 
        WHEN observacoes ILIKE '%pilates%' THEN 'Pilates'
        WHEN observacoes ILIKE '%yoga%' THEN 'Yoga'
        WHEN observacoes ILIKE '%crossfit%' THEN 'CrossFit'
        ELSE 'Modalidades gerais'
      END || '. ' || observacoes
    ELSE observacoes
  END
WHERE observacoes ILIKE '%agendamento%';

-- Leads interessados em planos/valores devem ir para "interesse" 
UPDATE leads 
SET 
  pipeline_stage = 'interesse',
  status = 'contatado',
  observacoes = CASE 
    WHEN observacoes ILIKE '%planos%' OR observacoes ILIKE '%valores%' OR observacoes ILIKE '%preço%' THEN 
      'Interessado em: Planos e valores. ' || observacoes
    ELSE observacoes
  END
WHERE (observacoes ILIKE '%planos%' OR observacoes ILIKE '%valores%' OR observacoes ILIKE '%preço%')
AND pipeline_stage = 'inicial';

-- Leads que mencionam modalidades específicas devem ir para "interesse"
UPDATE leads 
SET 
  pipeline_stage = 'interesse',
  status = 'contatado',
  observacoes = CASE 
    WHEN observacoes ILIKE '%musculação%' THEN 'Interessado em: Musculação. ' || observacoes
    WHEN observacoes ILIKE '%natação%' THEN 'Interessado em: Natação. ' || observacoes
    WHEN observacoes ILIKE '%pilates%' THEN 'Interessado em: Pilates. ' || observacoes
    WHEN observacoes ILIKE '%yoga%' THEN 'Interessado em: Yoga. ' || observacoes
    WHEN observacoes ILIKE '%crossfit%' THEN 'Interessado em: CrossFit. ' || observacoes
    WHEN observacoes ILIKE '%spinning%' THEN 'Interessado em: Spinning. ' || observacoes
    WHEN observacoes ILIKE '%zumba%' THEN 'Interessado em: Zumba. ' || observacoes
    ELSE 'Interessado em modalidades específicas. ' || observacoes
  END
WHERE (observacoes ILIKE '%musculação%' OR observacoes ILIKE '%natação%' OR observacoes ILIKE '%pilates%' 
       OR observacoes ILIKE '%yoga%' OR observacoes ILIKE '%crossfit%' OR observacoes ILIKE '%spinning%' 
       OR observacoes ILIKE '%zumba%')
AND pipeline_stage = 'inicial'
AND NOT observacoes ILIKE '%agendamento%';

-- Adicionar valores estimados baseados no tipo de interesse
UPDATE leads 
SET valor_estimado = CASE 
  WHEN observacoes ILIKE '%musculação%' THEN 89.90
  WHEN observacoes ILIKE '%natação%' THEN 120.00
  WHEN observacoes ILIKE '%pilates%' THEN 95.00
  WHEN observacoes ILIKE '%yoga%' THEN 75.00
  WHEN observacoes ILIKE '%crossfit%' THEN 110.00
  WHEN observacoes ILIKE '%planos%' OR observacoes ILIKE '%valores%' THEN 89.90
  ELSE 80.00
END
WHERE valor_estimado IS NULL AND origem = 'chatbot';