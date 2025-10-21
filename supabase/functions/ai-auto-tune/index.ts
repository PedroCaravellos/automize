import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, negocioId } = await req.json();

    console.log("🧠 Iniciando análise AI Auto-Tune para:", { userId, negocioId });

    // 1. Coletar dados para análise
    const { data: negocio } = await supabase
      .from('negocios')
      .select('*')
      .eq('id', negocioId)
      .single();

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: chatbot } = await supabase
      .from('chatbots')
      .select('*')
      .eq('negocio_id', negocioId)
      .single();

    // 2. Analisar conversas (simulado - você pode coletar de chatbot_messages)
    const { data: conversas } = await supabase
      .from('chatbot_conversations')
      .select(`
        id,
        lead_captured,
        total_messages,
        sentiment_score
      `)
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false })
      .limit(100);

    // 3. Preparar contexto para IA
    const contexto = {
      negocio: {
        nome: negocio?.nome,
        segmento: negocio?.segmento,
        servicos: negocio?.servicos_oferecidos,
      },
      estatisticas: {
        total_leads: leads?.length || 0,
        leads_novos: leads?.filter(l => l.status === 'novo').length || 0,
        leads_qualificados: leads?.filter(l => l.status === 'qualificado').length || 0,
        taxa_conversao: leads?.length ? ((leads.filter(l => l.status === 'fechado').length / leads.length) * 100).toFixed(1) : '0',
        total_agendamentos: agendamentos?.length || 0,
        agendamentos_confirmados: agendamentos?.filter(a => a.status === 'confirmado').length || 0,
        total_conversas: conversas?.length || 0,
        taxa_captura_lead: conversas?.length ? ((conversas.filter(c => c.lead_captured).length / conversas.length) * 100).toFixed(1) : '0',
      },
      chatbot_atual: {
        nome: chatbot?.nome,
        personalidade: chatbot?.personalidade,
        status: chatbot?.status,
      }
    };

    console.log("📊 Contexto coletado:", contexto);

    // 4. Chamar Lovable AI para análise
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um consultor de CRM e automação de vendas. Analise os dados de um negócio e sugira 3-5 melhorias ESPECÍFICAS e ACIONÁVEIS.

FORMATO DE RESPOSTA (JSON):
{
  "sugestoes": [
    {
      "titulo": "Título curto da sugestão",
      "tipo": "chatbot" | "funil" | "automacao" | "horario" | "preco",
      "prioridade": "alta" | "media" | "baixa",
      "impacto": "Descrição do impacto esperado",
      "acao": "O que fazer exatamente",
      "motivo": "Por que essa sugestão faz sentido baseado nos dados"
    }
  ]
}

Baseie-se SEMPRE nos dados fornecidos. Seja específico e prático.`
          },
          {
            role: "user",
            content: `Analise este negócio e sugira melhorias:

NEGÓCIO: ${contexto.negocio.nome}
SEGMENTO: ${contexto.negocio.segmento}

ESTATÍSTICAS:
- ${contexto.estatisticas.total_leads} leads totais
- ${contexto.estatisticas.leads_novos} leads novos (ainda não contatados)
- ${contexto.estatisticas.leads_qualificados} leads qualificados
- Taxa de conversão: ${contexto.estatisticas.taxa_conversao}%
- ${contexto.estatisticas.total_agendamentos} agendamentos
- ${contexto.estatisticas.agendamentos_confirmados} agendamentos confirmados
- ${contexto.estatisticas.total_conversas} conversas no chatbot
- Taxa de captura de lead: ${contexto.estatisticas.taxa_captura_lead}%

CHATBOT ATUAL:
- Nome: ${contexto.chatbot_atual.nome}
- Personalidade: ${contexto.chatbot_atual.personalidade}
- Status: ${contexto.chatbot_atual.status}

Me dê 3-5 sugestões práticas e específicas para melhorar os resultados.`
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Erro na API do Lovable AI:", aiResponse.status, errorText);
      throw new Error(`Erro na análise de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const sugestoesTexto = aiData.choices[0].message.content;
    
    console.log("🤖 Resposta da IA:", sugestoesTexto);

    // Parse das sugestões
    let sugestoes;
    try {
      sugestoes = JSON.parse(sugestoesTexto).sugestoes;
    } catch (e) {
      console.error("Erro ao parsear sugestões:", e);
      // Fallback com sugestões genéricas baseadas nos dados
      sugestoes = generateFallbackSugestoes(contexto);
    }

    // 5. Retornar sugestões
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          contexto,
          sugestoes,
          timestamp: new Date().toISOString(),
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Erro no AI Auto-Tune:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateFallbackSugestoes(contexto: any) {
  const sugestoes = [];

  // Sugestão 1: Taxa de captura baixa
  const taxaCaptura = parseFloat(contexto.estatisticas.taxa_captura_lead);
  if (taxaCaptura < 50) {
    sugestoes.push({
      titulo: "Melhorar Captura de Leads no Chatbot",
      tipo: "chatbot",
      prioridade: "alta",
      impacto: `Aumentar taxa de captura de ${taxaCaptura}% para >60%`,
      acao: "Adicione perguntas mais diretas no início da conversa e ofereça incentivos (desconto, brinde) para quem fornece contato",
      motivo: `Apenas ${taxaCaptura}% das conversas resultam em lead capturado. Isso está abaixo do ideal de 60-70%.`
    });
  }

  // Sugestão 2: Muitos leads novos não contatados
  const percentualNovos = (parseInt(contexto.estatisticas.leads_novos) / parseInt(contexto.estatisticas.total_leads)) * 100;
  if (percentualNovos > 30) {
    sugestoes.push({
      titulo: "Follow-up Rápido de Leads Novos",
      tipo: "automacao",
      prioridade: "alta",
      impacto: "Aumentar conversão em 25-40%",
      acao: "Crie automação para contatar leads novos em até 5 minutos. Leads contatados em 5min têm 9x mais chance de conversão.",
      motivo: `${contexto.estatisticas.leads_novos} leads (${percentualNovos.toFixed(0)}%) ainda não foram contatados. Velocidade é crítica.`
    });
  }

  // Sugestão 3: Taxa de conversão baixa
  const taxaConversao = parseFloat(contexto.estatisticas.taxa_conversao);
  if (taxaConversao < 15) {
    sugestoes.push({
      titulo: "Otimizar Funil de Vendas",
      tipo: "funil",
      prioridade: "alta",
      impacto: `Aumentar conversão de ${taxaConversao}% para 20%+`,
      acao: "Revise o funil: identifique onde os leads param e crie ações específicas para cada estágio (ex: enviar proposta, oferecer demonstração, follow-up)",
      motivo: `Taxa de conversão de ${taxaConversao}% está abaixo da média do segmento (15-25%). Há oportunidades sendo perdidas.`
    });
  }

  // Sugestão 4: Segmento específico
  if (contexto.negocio.segmento === 'academia') {
    sugestoes.push({
      titulo: "Oferecer Aula Experimental Gratuita",
      tipo: "chatbot",
      prioridade: "media",
      impacto: "Aumentar agendamentos em 40%",
      acao: "Configure o chatbot para oferecer aula experimental grátis como primeiro contato. Academias que fazem isso convertem 2x mais.",
      motivo: "No segmento de fitness, a barreira de entrada é grande. Aula grátis reduz resistência."
    });
  }

  // Sugestão 5: Sempre relevante
  sugestoes.push({
    titulo: "Horários de Pico de Atendimento",
    tipo: "horario",
    prioridade: "baixa",
    impacto: "Melhor alocação de equipe",
    acao: "Analise os horários com mais conversas/leads e garanta disponibilidade de atendimento humano nesses períodos",
    motivo: "Dados históricos podem revelar padrões de horários que você deve priorizar"
  });

  return sugestoes.slice(0, 5);
}
