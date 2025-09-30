import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationStep {
  id: string;
  tipo: string;
  configuracao: any;
  ordem: number;
}

interface AutomationExecution {
  id: string;
  automacao_id: string;
  lead_id: string;
  status: string;
  etapa_atual_id?: string;
  dados_contexto: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, payload } = await req.json();

    console.log('Automation Engine - Action:', action, 'Payload:', payload);

    switch (action) {
      case 'trigger_automation':
        return await triggerAutomation(supabase, payload);
      case 'process_step':
        return await processStep(supabase, payload);
      case 'check_pending_executions':
        return await checkPendingExecutions(supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Automation Engine error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function triggerAutomation(supabase: any, payload: any) {
  const { trigger_type, lead_id, negocio_id, context = {} } = payload;

  console.log('Triggering automation for:', { trigger_type, lead_id, negocio_id });

  // Buscar automações ativas para este trigger
  const { data: automacoes, error: automacaoError } = await supabase
    .from('automacoes')
    .select('*')
    .eq('trigger_type', trigger_type)
    .eq('negocio_id', negocio_id)
    .eq('ativo', true);

  if (automacaoError) {
    throw new Error(`Erro ao buscar automações: ${automacaoError.message}`);
  }

  const executions = [];

  for (const automacao of automacoes) {
    // Criar nova execução
    const { data: execution, error: execError } = await supabase
      .from('automacao_execucoes')
      .insert({
        automacao_id: automacao.id,
        lead_id,
        status: 'executando',
        dados_contexto: context
      })
      .select()
      .single();

    if (execError) {
      console.error('Erro ao criar execução:', execError);
      continue;
    }

    // Log da criação
    await supabase
      .from('automacao_logs')
      .insert({
        execucao_id: execution.id,
        acao: 'automation_triggered',
        resultado: 'success',
        detalhes: { trigger_type, automacao_id: automacao.id }
      });

    executions.push(execution);

    // Processar primeira etapa se houver
    if (automacao.actions?.steps && automacao.actions.steps.length > 0) {
      const firstStep = automacao.actions.steps[0];
      await processStep(supabase, {
        execution_id: execution.id,
        step_id: firstStep.id,
        step_config: firstStep.config
      });
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      executions_created: executions.length,
      executions 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processStep(supabase: any, payload: any) {
  const { execution_id, step_id, step_config } = payload;

  console.log('Processing step:', { execution_id, step_id, step_config });

  // Buscar execução
  const { data: execution, error: execError } = await supabase
    .from('automacao_execucoes')
    .select('*')
    .eq('id', execution_id)
    .single();

  if (execError) {
    throw new Error(`Execução não encontrada: ${execError.message}`);
  }

  let resultado = 'success';
  let detalhes: any = {};

  try {
    switch (step_config.type) {
      case 'send_message':
        await sendMessage(supabase, execution, step_config);
        break;
      case 'delay':
        await scheduleDelay(supabase, execution, step_config);
        break;
      case 'webhook':
        await callWebhook(supabase, execution, step_config);
        break;
      case 'update_lead':
        await updateLead(supabase, execution, step_config);
        break;
      default:
        throw new Error(`Tipo de step desconhecido: ${step_config.type}`);
    }
  } catch (error) {
    resultado = 'error';
    detalhes = { error: error instanceof Error ? error.message : 'Unknown error' };
    console.error('Erro ao processar step:', error);
  }

  // Log da execução
  await supabase
    .from('automacao_logs')
    .insert({
      execucao_id: execution_id,
      etapa_id: step_id,
      acao: step_config.type,
      resultado,
      detalhes
    });

  return new Response(
    JSON.stringify({ success: resultado === 'success', detalhes }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendMessage(supabase: any, execution: any, stepConfig: any) {
  console.log('Sending message:', stepConfig);

  // Buscar dados do lead
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', execution.lead_id)
    .single();

  if (!lead) {
    throw new Error('Lead não encontrado');
  }

  // Substituir variáveis na mensagem
  let mensagem = stepConfig.message || stepConfig.template || '';
  mensagem = mensagem.replace(/{nome}/g, lead.nome || 'Cliente');
  mensagem = mensagem.replace(/{telefone}/g, lead.telefone || '');
  mensagem = mensagem.replace(/{email}/g, lead.email || '');

  // Aqui você integraria com o serviço de envio de mensagens (WhatsApp, SMS, etc.)
  console.log('Mensagem que seria enviada:', mensagem);

  // Simular envio bem-sucedido
  return { success: true, message: mensagem };
}

async function scheduleDelay(supabase: any, execution: any, stepConfig: any) {
  const delayMinutes = stepConfig.duration || stepConfig.delay_minutes || 60;
  const nextExecution = new Date(Date.now() + delayMinutes * 60 * 1000);

  console.log(`Agendando próxima execução para: ${nextExecution}`);

  // Atualizar status para pausado com timestamp
  await supabase
    .from('automacao_execucoes')
    .update({
      status: 'pausada',
      dados_contexto: {
        ...execution.dados_contexto,
        next_execution: nextExecution.toISOString()
      }
    })
    .eq('id', execution.id);

  return { success: true, next_execution: nextExecution };
}

async function callWebhook(supabase: any, execution: any, stepConfig: any) {
  const webhookUrl = stepConfig.url;
  const payload = stepConfig.payload || {};

  if (!webhookUrl) {
    throw new Error('URL do webhook não configurada');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      execution_id: execution.id,
      lead_id: execution.lead_id
    })
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
  }

  return { success: true, response_status: response.status };
}

async function updateLead(supabase: any, execution: any, stepConfig: any) {
  const updates = stepConfig.updates || {};

  if (Object.keys(updates).length === 0) {
    throw new Error('Nenhuma atualização especificada');
  }

  const { error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', execution.lead_id);

  if (error) {
    throw new Error(`Erro ao atualizar lead: ${error.message}`);
  }

  return { success: true, updates };
}

async function checkPendingExecutions(supabase: any) {
  const now = new Date().toISOString();

  // Buscar execuções pausadas que devem ser retomadas
  const { data: executions, error } = await supabase
    .from('automacao_execucoes')
    .select('*')
    .eq('status', 'pausada')
    .lte('dados_contexto->next_execution', now);

  if (error) {
    throw new Error(`Erro ao buscar execuções pendentes: ${error.message}`);
  }

  console.log(`Encontradas ${executions?.length || 0} execuções pendentes`);

  // Processar cada execução pendente
  for (const execution of executions || []) {
    // Retomar execução
    await supabase
      .from('automacao_execucoes')
      .update({ status: 'executando' })
      .eq('id', execution.id);

    // Aqui você processaria a próxima etapa da automação
    console.log('Retomando execução:', execution.id);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      processed: executions?.length || 0 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}