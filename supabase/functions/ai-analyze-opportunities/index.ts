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
      totalChatbots: chatbots?.length || 0,
      chatbotsAtivos: chatbots?.filter((c: any) => c.ativo).length || 0,
      totalAutomacoes: automacoes?.length || 0,
      automacoesAtivas: automacoes?.filter((a: any) => a.ativo).length || 0,
      tiposNegocio: negocios?.map((n: any) => n.tipo_negocio).filter(Boolean) || [],
    };

    const prompt = `Você é um consultor de negócios especializado em automação e vendas.

Analise os dados do negócio:
- Total de leads: ${context.totalLeads}
- Leads novos sem resposta: ${context.leadsNovos}
- Leads há mais de 2 dias sem resposta: ${context.leadsSemResposta}
- Chatbots ativos: ${context.chatbotsAtivos} de ${context.totalChatbots}
- Automações ativas: ${context.automacoesAtivas} de ${context.totalAutomacoes}
- Tipos de negócio: ${context.tiposNegocio.join(', ')}

Identifique 3-5 oportunidades CONCRETAS de melhorias, seguindo EXATAMENTE este formato JSON:

{
  "opportunities": [
    {
      "type": "automatic" ou "suggested",
      "priority": "high" ou "medium" ou "low",
      "title": "título curto e direto",
      "description": "descrição específica do que foi detectado e o que fazer",
      "impact": "impacto esperado (ex: +40% conversão)",
      "action": "qual ação concreta tomar"
    }
  ]
}

Seja específico e acionável. Foque em oportunidades reais baseadas nos números.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um consultor especialista. Retorne APENAS JSON válido, sem texto adicional.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('AI Gateway error:', response.status, await response.text());
      throw new Error('Failed to analyze opportunities');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
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
        throw new Error('Failed to parse AI response');
      }
    }

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
