import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  academia: {
    nome: string;
    unidade?: string;
    segmento?: string;
    endereco?: string;
    telefone?: string;
    whatsapp?: string;
    horarios?: string;
    modalidades?: string;
    valores?: string;
    promocoes?: string;
    diferenciais?: string;
  };
  chatbot: {
    mensagemBoasVindas: string;
    perguntasFrequentes: Array<{
      pergunta: string;
      resposta: string;
    }>;
    mensagemEncerramento: string;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

serve(async (req) => {
  console.log('Chatbot AI Function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { message, academia, chatbot, conversationHistory = [] }: ChatRequest = await req.json();
    console.log('Processing message:', message);

    // Build comprehensive context about the academy
    let academiaContext = `Você é um assistente inteligente da academia ${academia.nome}`;
    
    if (academia.unidade) {
      academiaContext += ` - unidade ${academia.unidade}`;
    }
    
    academiaContext += `. Este é um estabelecimento de ${academia.segmento || 'Academia'}.`;

    // Add detailed academy information
    if (academia.endereco) {
      academiaContext += `\n\nENDEREÇO: ${academia.endereco}`;
    }

    if (academia.telefone || academia.whatsapp) {
      academiaContext += `\n\nCONTATOS:`;
      if (academia.telefone) academiaContext += `\n- Telefone: ${academia.telefone}`;
      if (academia.whatsapp) academiaContext += `\n- WhatsApp: ${academia.whatsapp}`;
    }

    if (academia.horarios) {
      academiaContext += `\n\nHORÁRIOS DE FUNCIONAMENTO:\n${academia.horarios}`;
    }

    if (academia.modalidades) {
      academiaContext += `\n\nMODALIDADES DISPONÍVEIS:\n${academia.modalidades}`;
    }

    if (academia.valores) {
      academiaContext += `\n\nPLANOS E VALORES:\n${academia.valores}`;
    }

    if (academia.promocoes) {
      academiaContext += `\n\nPROMOÇÕES ATUAIS:\n${academia.promocoes}`;
    }

    if (academia.diferenciais) {
      academiaContext += `\n\nDIFERENCIAIS DA ACADEMIA:\n${academia.diferenciais}`;
    }
    
    academiaContext += `\n\nVocê deve ser um assistente prestativo e conhecedor da academia, ajudando com informações sobre horários, modalidades, planos, matrículas e agendamentos. Use sempre as informações específicas fornecidas acima.`;

    // Add FAQ context
    if (chatbot.perguntasFrequentes?.length > 0) {
      academiaContext += '\n\nInformações específicas da academia:\n';
      chatbot.perguntasFrequentes.forEach(faq => {
        academiaContext += `- ${faq.pergunta}: ${faq.resposta}\n`;
      });
    }

const systemPrompt = `${academiaContext}

INSTRUÇÕES IMPORTANTES:
1. Você deve ser prestativo, amigável e conhecer bem a academia
2. Responda sempre em português brasileiro
3. Use SEMPRE as informações específicas fornecidas acima sobre a academia (horários, modalidades, valores, etc.)
4. Se o cliente perguntar sobre agendamentos, horários, preços ou qualquer informação, priorize os dados fornecidos
5. Se o cliente demonstrar interesse em matricular-se ou conhecer a academia, seja proativo e mencione as promoções atuais
6. Se não souber uma informação específica que não foi fornecida, seja honesto e sugira entrar em contato pelos canais disponíveis
7. Mantenha respostas concisas mas completas, sempre personalizadas para esta academia específica
8. Destaque os diferenciais da academia quando relevante para a conversa
9. Se o cliente quiser encerrar, use a mensagem: "${chatbot.mensagemEncerramento}"
10. NUNCA invente informações que não foram fornecidas - seja sempre preciso

Você tem acesso completo às informações desta academia específica. Use esse conhecimento para dar respostas personalizadas e úteis.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI with context for academia:', academia.nome);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chatbot-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: "Desculpe, estou enfrentando dificuldades técnicas. Por favor, tente novamente em alguns minutos."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});