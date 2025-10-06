import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, negocioInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `Você é um assistente especializado em criar automações de marketing e vendas.
Com base na descrição do usuário, você deve gerar uma automação estruturada.

Informações do negócio:
${negocioInfo ? JSON.stringify(negocioInfo, null, 2) : 'Não fornecidas'}

IMPORTANTE:
- Crie um nome descritivo e profissional para a automação
- Escolha o gatilho correto: "novo_lead", "agendamento", "follow_up", ou "tempo_decorrido"
- Crie blocos sequenciais (mensagem, aguardar, condição, webhook) conforme a descrição
- Para blocos de mensagem, use templates personalizados e profissionais
- Para blocos de aguardar, especifique o tempo em minutos, horas ou dias
- Para condições, defina claramente o critério de decisão
- Seja criativo mas mantenha a automação prática e executável`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_automation",
              description: "Cria uma automação estruturada a partir da descrição",
              parameters: {
                type: "object",
                properties: {
                  nome: {
                    type: "string",
                    description: "Nome descritivo da automação"
                  },
                  descricao: {
                    type: "string",
                    description: "Descrição resumida do que a automação faz"
                  },
                  trigger_type: {
                    type: "string",
                    enum: ["novo_lead", "agendamento", "follow_up", "tempo_decorrido"],
                    description: "Tipo de gatilho que inicia a automação"
                  },
                  trigger_config: {
                    type: "object",
                    properties: {
                      delay_hours: { type: "number" },
                      conditions: { type: "array", items: { type: "string" } }
                    },
                    description: "Configuração do gatilho"
                  },
                  blocos: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        tipo: {
                          type: "string",
                          enum: ["trigger", "message", "delay", "condition", "webhook"]
                        },
                        label: { type: "string" },
                        conteudo: { type: "string" },
                        tempo: {
                          type: "object",
                          properties: {
                            valor: { type: "number" },
                            unidade: {
                              type: "string",
                              enum: ["minutos", "horas", "dias"]
                            }
                          }
                        },
                        condicao: { type: "string" },
                        webhook_url: { type: "string" },
                        posicao: {
                          type: "object",
                          properties: {
                            x: { type: "number" },
                            y: { type: "number" }
                          }
                        }
                      },
                      required: ["id", "tipo", "label"]
                    },
                    description: "Lista de blocos da automação em ordem sequencial"
                  }
                },
                required: ["nome", "descricao", "trigger_type", "blocos"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_automation" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Erro da API:", response.status, errorText);
      throw new Error("Erro ao processar com IA");
    }

    const data = await response.json();
    console.log("Resposta da IA:", JSON.stringify(data, null, 2));

    // Extrair o resultado do tool calling
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("IA não retornou uma automação estruturada");
    }

    const automacao = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ automation: automacao }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro ao gerar automação:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido ao gerar automação" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});