import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leads, chatbots, automacoes, negocios } = await req.json();
    
    console.log('📊 Dados recebidos:', {
      totalLeads: leads?.length || 0,
      totalChatbots: chatbots?.length || 0,
      totalAutomacoes: automacoes?.length || 0,
      totalNegocios: negocios?.length || 0
    });
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Preparar contexto para análise
    const context = {
      totalLeads: leads?.length || 0,
      leadsNovos: leads?.filter((l: any) => l.status === 'novo').length || 0,
      leadsSemResposta: leads?.filter((l: any) => {
        const diff = Date.now() - new Date(l.created_at).getTime();
        return diff > 2 * 24 * 60 * 60 * 1000 && l.status === 'novo';
      }).length || 0,
      leadsEmNegociacao: leads?.filter((l: any) => l.pipeline_stage === 'proposta' || l.pipeline_stage === 'negociacao').length || 0,
      totalChatbots: chatbots?.length || 0,
      chatbotsAtivos: chatbots?.filter((c: any) => c.status === 'Ativo').length || 0,
      chatbotsInativos: chatbots?.filter((c: any) => c.status !== 'Ativo').length || 0,
      totalAutomacoes: automacoes?.length || 0,
      automacoesAtivas: automacoes?.filter((a: any) => a.ativa).length || 0,
      automacoesInativas: automacoes?.filter((a: any) => !a.ativa).length || 0,
      tiposNegocio: negocios?.map((n: any) => n.tipo_negocio).filter(Boolean) || [],
    };

    const prompt = `Você é um consultor de negócios especializado em automação e vendas.

Analise CRITICAMENTE os dados do negócio e identifique oportunidades DIVERSIFICADAS:

DADOS ATUAIS:
- Total de leads: ${context.totalLeads}
- Leads novos: ${context.leadsNovos}
- Leads sem resposta há +2 dias: ${context.leadsSemResposta}
- Leads em negociação: ${context.leadsEmNegociacao}
- Chatbots: ${context.chatbotsAtivos} ativos / ${context.chatbotsInativos} inativos (total: ${context.totalChatbots})
- Automações: ${context.automacoesAtivas} ativas / ${context.automacoesInativas} inativas (total: ${context.totalAutomacoes})
- Tipos de negócio: ${context.tiposNegocio.join(', ') || 'não especificado'}

REGRAS CRÍTICAS (OBRIGATÓRIAS):
1. NUNCA sugira ações sobre dados zerados ou inexistentes (ex: se leads = 0, NÃO sugira nada sobre leads)
2. SEMPRE verifique os números reais antes de sugerir qualquer ação
3. Identifique EXATAMENTE 3 oportunidades COMPLETAMENTE DIFERENTES entre si
4. Varie OBRIGATORIAMENTE as categorias: leads, chatbots, automações, estratégia
5. Seja ESPECÍFICO com os números reais fornecidos
6. Se algo já está perfeito, NÃO crie sugestão genérica - marque como "automatic" com status "completed"
7. Priorize ações de MAIOR impacto primeiro
8. VALIDE: Os dados mostram que existem ${context.totalChatbots} chatbots, ${context.totalLeads} leads, ${context.totalAutomacoes} automações

Retorne APENAS JSON válido neste formato:
{
  "opportunities": [
    {
      "type": "suggested",
      "priority": "high",
      "title": "título curto (max 50 caracteres)",
      "description": "descrição específica do problema E solução (max 150 caracteres)",
      "impact": "métrica clara (ex: +30% conversão)",
      "action": "ação concreta"
    }
  ]
}

EXEMPLOS BONS:
- Se há 5 leads sem resposta há 3+ dias: "Reativar 5 leads antigos" → "Enviar follow-up automático para os 5 leads que não responderam há mais de 3 dias"
- Se há 1 automação inativa: "Ativar automação pausada" → "Você tem 1 automação inativa que poderia estar gerando leads automaticamente"
- Se chatbot está ativo mas sem leads: "Divulgar link do chatbot" → "Compartilhe o link do chatbot nas redes sociais para começar a captar leads"

EXEMPLOS RUINS (não faça isso):
- "Ativar Chatbots para Geração de Leads" quando total de leads é 0
- Três sugestões diferentes todas sobre leads
- Sugestões genéricas sem números específicos`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um consultor especialista. Analise os dados criticamente e retorne APENAS JSON válido sem markdown ou texto adicional.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI Gateway error:', response.status, await response.text());
      throw new Error('Failed to analyze opportunities');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('🤖 Resposta da IA:', content.substring(0, 200) + '...');
    
    // Extrair JSON do conteúdo
    let opportunities;
    try {
      // Tentar parsear direto
      opportunities = JSON.parse(content);
    } catch {
      // Se falhar, tentar extrair JSON de markdown
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        opportunities = JSON.parse(jsonMatch[1]);
      } else {
        console.error('❌ Falha ao parsear resposta da IA');
        throw new Error('Failed to parse AI response');
      }
    }

    console.log('✅ Oportunidades identificadas:', opportunities.opportunities?.length || 0);

    return new Response(
      JSON.stringify(opportunities),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-analyze-opportunities:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        opportunities: [] 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
