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
    const { nome, tipoNegocio, segmento } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    console.log('Gerando dados do negócio com IA:', { nome, tipoNegocio, segmento });

    const systemPrompt = `Você é um assistente especializado em criar perfis completos de negócios brasileiros.
Com base no nome, tipo e segmento do negócio, gere dados realistas e úteis.

IMPORTANTE: Retorne APENAS um JSON válido, sem markdown, sem explicações.

O JSON deve ter esta estrutura EXATA:
{
  "servicos_oferecidos": ["serviço 1", "serviço 2", "serviço 3"],
  "horario_funcionamento": "Seg-Sex: 6h-22h, Sáb: 8h-18h, Dom: 8h-12h",
  "valores": {
    "planos": [
      {"nome": "Básico", "preco": 99, "periodo": "mensal", "descricao": "Ideal para iniciantes"},
      {"nome": "Premium", "preco": 149, "periodo": "mensal", "descricao": "Acesso completo"}
    ],
    "servicosAvulsos": [
      {"nome": "Avaliação", "preco": 50, "descricao": "Avaliação física completa"}
    ],
    "observacoes": "Primeira semana grátis"
  },
  "promocoes": "Matricule-se agora e ganhe 1 mês grátis!",
  "diferenciais": "Equipamentos de última geração, Personal trainer incluso, App exclusivo"
}`;

    const userPrompt = `Nome: ${nome}
Tipo: ${tipoNegocio}
Segmento: ${segmento}

Gere dados brasileiros realistas para este negócio. Use valores em Reais (R$) apropriados para o mercado brasileiro.`;

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
        temperature: 0.7,
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

    const negocioData = JSON.parse(jsonString);

    return new Response(
      JSON.stringify({ success: true, data: negocioData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em ai-create-negocio:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
