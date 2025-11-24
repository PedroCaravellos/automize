import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para gerar sugestões baseadas em regras (fallback)
function generateRuleBasedSuggestions(context: any) {
  const suggestions: any[] = [];
  
  console.log('🔧 Gerando sugestões baseadas em regras...');
  
  // Regra 1: Chatbot ativo mas sem leads
  if (context.chatbotsAtivos > 0 && context.totalLeads === 0) {
    suggestions.push({
      type: "suggested",
      priority: "high",
      title: "Divulgar Chatbot Ativo",
      description: `Você tem ${context.chatbotsAtivos} chatbot(s) ativo(s). Compartilhe o link nas redes sociais para começar a receber leads!`,
      impact: "Primeiros leads em 24h",
      action: "Compartilhar link do chatbot"
    });
  }
  
  // Regra 2: Leads sem resposta
  if (context.leadsSemResposta > 0) {
    suggestions.push({
      type: "suggested",
      priority: "high",
      title: "Reativar Leads Antigos",
      description: `${context.leadsSemResposta} lead(s) sem resposta há mais de 2 dias. Configure follow-up automático para recuperá-los.`,
      impact: "+15% recuperação",
      action: "Criar automação de follow-up"
    });
  }
  
  // Regra 3: Automações inativas
  if (context.automacoesInativas > 0) {
    suggestions.push({
      type: "suggested",
      priority: "medium",
      title: "Ativar Automações Pausadas",
      description: `${context.automacoesInativas} automação(ões) inativa(s). Ative-as para aumentar eficiência operacional.`,
      impact: "+20% eficiência",
      action: "Revisar e ativar automações"
    });
  }
  
  // Regra 4: Chatbots inativos
  if (context.chatbotsInativos > 0) {
    suggestions.push({
      type: "suggested",
      priority: "medium",
      title: "Reativar Chatbots",
      description: `${context.chatbotsInativos} chatbot(s) inativo(s). Reative para aumentar captação de leads.`,
      impact: "+25% captação",
      action: "Ativar chatbots pausados"
    });
  }
  
  // Regra 5: Leads em negociação (oportunidade de fechar vendas)
  if (context.leadsEmNegociacao > 0) {
    suggestions.push({
      type: "suggested",
      priority: "high",
      title: "Fechar Negociações Ativas",
      description: `${context.leadsEmNegociacao} lead(s) em negociação. Foque neles para aumentar taxa de conversão.`,
      impact: "+30% conversão",
      action: "Priorizar contato com leads em negociação"
    });
  }
  
  // Regra 6: Nenhum chatbot ativo
  if (context.totalChatbots === 0) {
    suggestions.push({
      type: "suggested",
      priority: "high",
      title: "Criar Primeiro Chatbot",
      description: "Configure seu primeiro chatbot para começar a captar leads automaticamente 24/7.",
      impact: "Captação automática",
      action: "Criar novo chatbot"
    });
  }
  
  // Regra 7: Nenhuma automação ativa
  if (context.totalAutomacoes === 0 || context.automacoesAtivas === 0) {
    suggestions.push({
      type: "suggested",
      priority: "high",
      title: "Automatizar Processos",
      description: "Crie automações para follow-ups e lembretes automáticos. Economize tempo e aumente conversão.",
      impact: "+40% produtividade",
      action: "Criar primeira automação"
    });
  }
  
  return suggestions.slice(0, 3); // Máximo 3 sugestões
}

// Função para validar se uma sugestão é coerente com os dados
function validateOpportunity(opp: any, context: any): boolean {
  const desc = opp.description?.toLowerCase() || '';
  const title = opp.title?.toLowerCase() || '';
  const combined = desc + ' ' + title;
  
  // Verificar inconsistências óbvias
  if (combined.includes('0 chatbot') && context.totalChatbots > 0) {
    console.warn('❌ Oportunidade inválida: menciona 0 chatbots mas existem', context.totalChatbots);
    return false;
  }
  
  if (combined.includes('0 lead') && context.totalLeads > 0) {
    console.warn('❌ Oportunidade inválida: menciona 0 leads mas existem', context.totalLeads);
    return false;
  }
  
  if (combined.includes('nenhum chatbot') && context.totalChatbots > 0) {
    console.warn('❌ Oportunidade inválida: diz "nenhum chatbot" mas existem', context.totalChatbots);
    return false;
  }
  
  if (combined.includes('nenhum lead') && context.totalLeads > 0) {
    console.warn('❌ Oportunidade inválida: diz "nenhum lead" mas existem', context.totalLeads);
    return false;
  }
  
  // Verificar se sugere ativar chatbots quando já estão todos ativos
  if (combined.includes('ativar chatbot') && context.chatbotsInativos === 0) {
    console.warn('❌ Oportunidade inválida: sugere ativar chatbots mas todos já estão ativos');
    return false;
  }
  
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header and create authenticated Supabase client (backend as source of truth)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('👤 Usuario autenticado:', user.id);

    // Fetch real data from database (backend as source of truth)
    console.log('🔍 Buscando dados reais do banco...');
    
    const { data: negocios, error: negociosError } = await supabaseClient
      .from('negocios')
      .select('id, tipo_negocio')
      .eq('user_id', user.id);

    if (negociosError) {
      console.error('Erro ao buscar negócios:', negociosError);
      throw negociosError;
    }

    const negocioIds = negocios?.map(n => n.id) || [];
    console.log('📋 Negocios encontrados:', negocioIds.length);

    // Fetch chatbots, leads, and automacoes in parallel
    const [chatbotsResult, leadsResult, automacoesResult] = await Promise.all([
      supabaseClient.from('chatbots').select('*').in('negocio_id', negocioIds),
      supabaseClient.from('leads').select('*').in('negocio_id', negocioIds),
      supabaseClient.from('automacoes').select('*').eq('user_id', user.id)
    ]);

    const chatbots = chatbotsResult.data || [];
    const leads = leadsResult.data || [];
    const automacoes = automacoesResult.data || [];

    console.log('📊 DADOS REAIS DO BANCO:', { 
      negocios: negocios?.length || 0,
      chatbots: chatbots.length,
      leads: leads.length, 
      automacoes: automacoes.length
    });
    
    // Preparar contexto para análise com dados reais do banco
    const now = Date.now();
    const context = {
      totalNegocios: negocios?.length || 0,
      totalLeads: leads.length,
      leadsNovos: leads.filter((l: any) => (l.status || '').toLowerCase() === 'novo').length,
      leadsSemResposta: leads.filter((l: any) => {
        const diff = now - new Date(l.created_at).getTime();
        return diff > 2 * 24 * 60 * 60 * 1000 && (l.status || '').toLowerCase() === 'novo';
      }).length,
      leadsEmNegociacao: leads.filter((l: any) => {
        const stage = (l.pipeline_stage || '').toLowerCase();
        return stage === 'proposta' || stage === 'negociacao';
      }).length,
      totalChatbots: chatbots.length,
      // Check both boolean field and string status
      chatbotsAtivos: chatbots.filter((c: any) => 
        c.ativo === true || (c.status || '').toLowerCase() === 'ativo'
      ).length,
      chatbotsInativos: chatbots.filter((c: any) => 
        c.ativo !== true && (c.status || '').toLowerCase() !== 'ativo'
      ).length,
      totalAutomacoes: automacoes.length,
      // Check both ativa and ativo fields
      automacoesAtivas: automacoes.filter((a: any) => 
        a.ativa === true || a.ativo === true
      ).length,
      automacoesInativas: automacoes.filter((a: any) => 
        a.ativa !== true && a.ativo !== true
      ).length,
      tiposNegocio: negocios?.map((n: any) => n.tipo_negocio).filter(Boolean) || [],
    };
    
    console.log('📊 CONTEXTO COMPLETO (FONTE DA VERDADE):', JSON.stringify(context, null, 2));
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prompt otimizado com repetição de dados críticos
    const prompt = `DADOS REAIS QUE VOCÊ DEVE USAR (NÃO INVENTE NÚMEROS):

📊 CHATBOTS: ${context.totalChatbots} total (${context.chatbotsAtivos} ativos, ${context.chatbotsInativos} inativos)
👥 LEADS: ${context.totalLeads} total (${context.leadsNovos} novos, ${context.leadsSemResposta} sem resposta há +2 dias)
⚙️ AUTOMAÇÕES: ${context.totalAutomacoes} total (${context.automacoesAtivas} ativas, ${context.automacoesInativas} inativas)
💼 NEGÓCIOS: ${context.leadsEmNegociacao} em negociação ativa

IMPORTANTE: USE OS NÚMEROS ACIMA. NÃO INVENTE NÚMEROS DIFERENTES.

Você é um consultor de negócios. Analise os DADOS REAIS acima e identifique EXATAMENTE 3 oportunidades COMPLETAMENTE DIFERENTES.

REGRAS OBRIGATÓRIAS:
1. Use APENAS os números fornecidos acima
2. Se um dado é 0, NÃO sugira ações sobre ele
3. Seja ESPECÍFICO e mencione os números reais
4. Varie as categorias: leads, chatbots, automações, estratégia
5. Priorize o que tem MAIOR impacto

EXEMPLOS BASEADOS NOS DADOS REAIS:
- Se CHATBOTS = ${context.totalChatbots} e CHATBOTS ATIVOS = ${context.chatbotsAtivos}: ${context.chatbotsAtivos > 0 && context.totalLeads === 0 ? 'Divulgar chatbot ativo para gerar leads' : context.chatbotsInativos > 0 ? `Reativar ${context.chatbotsInativos} chatbot(s) inativo(s)` : 'Chatbots OK'}
- Se LEADS SEM RESPOSTA = ${context.leadsSemResposta}: ${context.leadsSemResposta > 0 ? `Reativar ${context.leadsSemResposta} lead(s) antigo(s)` : 'Follow-up OK'}
- Se AUTOMAÇÕES INATIVAS = ${context.automacoesInativas}: ${context.automacoesInativas > 0 ? `Ativar ${context.automacoesInativas} automação(ões)` : 'Automações OK'}

LEMBRE-SE: Use EXATAMENTE os números: ${context.totalChatbots} chatbots, ${context.totalLeads} leads, ${context.totalAutomacoes} automações!`;

    // Tool calling para structured output
    const tools = [
      {
        type: "function",
        function: {
          name: "generate_opportunities",
          description: "Gerar oportunidades de negócio baseadas nos dados reais fornecidos",
          parameters: {
            type: "object",
            properties: {
              opportunities: {
                type: "array",
                description: "Lista de 3 oportunidades completamente diferentes entre si",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["suggested", "automatic"],
                      description: "Tipo da oportunidade"
                    },
                    priority: {
                      type: "string",
                      enum: ["low", "medium", "high"],
                      description: "Prioridade baseada no impacto"
                    },
                    title: {
                      type: "string",
                      maxLength: 50,
                      description: "Título curto e direto"
                    },
                    description: {
                      type: "string",
                      maxLength: 150,
                      description: "Descrição específica com números reais dos dados fornecidos"
                    },
                    impact: {
                      type: "string",
                      maxLength: 50,
                      description: "Impacto esperado (ex: +30% conversão)"
                    },
                    action: {
                      type: "string",
                      maxLength: 100,
                      description: "Ação concreta a ser tomada"
                    }
                  },
                  required: ["type", "priority", "title", "description", "impact", "action"]
                }
              }
            },
            required: ["opportunities"]
          }
        }
      }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um consultor especialista. Analise os dados criticamente e use a ferramenta generate_opportunities para retornar as oportunidades.' },
          { role: 'user', content: prompt }
        ],
        tools: tools,
        tool_choice: { type: "function", function: { name: "generate_opportunities" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI Gateway error:', response.status, errorText);
      
      // Se falhar, usar fallback
      console.warn('⚠️ IA falhou, usando sistema de fallback');
      const fallbackOpportunities = generateRuleBasedSuggestions(context);
      return new Response(
        JSON.stringify({ opportunities: fallbackOpportunities }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('🤖 RESPOSTA COMPLETA DA IA:', JSON.stringify(data, null, 2));
    
    let opportunities;
    
    // Verificar se a IA usou tool calling
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      console.log('🔧 Tool call detectado:', toolCall.function.name);
      const args = JSON.parse(toolCall.function.arguments);
      opportunities = args;
      console.log('✅ Oportunidades extraídas via tool calling:', JSON.stringify(opportunities, null, 2));
    } else {
      // Fallback para parsing de JSON livre (caso o modelo não use tool calling)
      const content = data.choices[0].message.content;
      console.log('📝 Resposta em texto livre:', content?.substring(0, 200) + '...');
      
      try {
        opportunities = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          opportunities = JSON.parse(jsonMatch[1]);
        } else {
          console.error('❌ Falha ao parsear resposta da IA');
          throw new Error('Failed to parse AI response');
        }
      }
    }
    
    // Validar as oportunidades geradas
    if (!opportunities.opportunities || opportunities.opportunities.length === 0) {
      console.warn('⚠️ IA retornou 0 oportunidades, usando fallback');
      const fallbackOpportunities = generateRuleBasedSuggestions(context);
      return new Response(
        JSON.stringify({ opportunities: fallbackOpportunities }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validar cada oportunidade
    const validOpportunities = opportunities.opportunities.filter((opp: any) => 
      validateOpportunity(opp, context)
    );
    
    console.log(`✅ Oportunidades válidas: ${validOpportunities.length}/${opportunities.opportunities.length}`);
    
    // Se muitas oportunidades foram invalidadas, usar fallback
    if (validOpportunities.length < 2) {
      console.warn('⚠️ Poucas oportunidades válidas, usando fallback');
      const fallbackOpportunities = generateRuleBasedSuggestions(context);
      return new Response(
        JSON.stringify({ opportunities: fallbackOpportunities }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 RESULTADO FINAL:', JSON.stringify({ opportunities: validOpportunities }, null, 2));
    
    return new Response(
      JSON.stringify({ opportunities: validOpportunities }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ ERRO em ai-analyze-opportunities:', error);
    
    // Usar fallback com contexto vazio em caso de erro
    console.log('🔧 Usando fallback devido a erro');
    const fallbackContext = {
      totalLeads: 0,
      leadsNovos: 0,
      leadsSemResposta: 0,
      leadsEmNegociacao: 0,
      totalChatbots: 0,
      chatbotsAtivos: 0,
      chatbotsInativos: 0,
      totalAutomacoes: 0,
      automacoesAtivas: 0,
      automacoesInativas: 0,
      tiposNegocio: [],
    };
    const fallbackOpportunities = generateRuleBasedSuggestions(fallbackContext);
    
    return new Response(
      JSON.stringify({ 
        opportunities: fallbackOpportunities,
        error: 'Failed to analyze, using fallback suggestions'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
