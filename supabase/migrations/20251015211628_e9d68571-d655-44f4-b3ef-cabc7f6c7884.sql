-- Corrigir pipeline_stage com valores inválidos (UUIDs ou outros valores)
-- Resetar para 'inicial' quando o valor não for um dos estágios válidos
UPDATE leads 
SET pipeline_stage = 'inicial' 
WHERE pipeline_stage NOT IN ('inicial', 'interesse', 'visita_agendada', 'proposta', 'fechamento');