import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nomeNegocio, tipoNegocio, segmento, servicos, valores } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    console.log('Gerando chatbot com IA:', { nomeNegocio, tipoNegocio, segmento });

    const systemPrompt = `Você é um especialista em criar chatbots conversacionais para negócios brasileiros.
Crie uma personalidade e instruções adequadas para o chatbot deste negócio.

IMPORTANTE: Retorne APENAS um JSON válido, sem markdown, sem explicações.

O JSON deve ter esta estrutura EXATA:
{
  "nome": "Nome do chatbot (ex: 'Assistente FitMax')",
  "personalidade": "Descrição da personalidade (amigável, profissional, enérgico, etc)",
  "instrucoes": "Instruções detalhadas de como o chatbot deve se comportar e responder. Inclua tom de voz, tipos de perguntas a responder, limites, etc. Mínimo 3 parágrafos."
}`;

    const servicosText = servicos?.join(', ') || 'serviços diversos';
    const planosText = valores?.planos?.map((p: any) => `${p.nome} (R$ ${p.preco})`).join(', ') || 'planos disponíveis';

    const userPrompt = `Nome do Negócio: ${nomeNegocio}
Tipo: ${tipoNegocio}
Segmento: ${segmento}
Serviços: ${servicosText}
Planos: ${planosText}

Crie um chatbot perfeito para este negócio. Use linguagem brasileira natural e informal mas profissional.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos em Settings -> Workspace -> Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('Erro da API Lovable AI:', response.status, errorText);
      throw new Error(`Erro ao chamar IA: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('Resposta da IA:', aiResponse);

    // Limpar markdown se houver
    let jsonString = aiResponse.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/```\n?/g, '');
    }

    const chatbotData = JSON.parse(jsonString);

    return new Response(
      JSON.stringify({ success: true, data: chatbotData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em ai-create-chatbot:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
