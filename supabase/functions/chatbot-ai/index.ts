import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  academia: {
    id?: string;
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Checking OpenAI API Key:', openAIApiKey ? 'Key found' : 'Key NOT found');
    console.log('Checking Supabase URL:', supabaseUrl ? 'URL found' : 'URL NOT found');
    console.log('Checking Supabase Service Key:', supabaseServiceKey ? 'Service key found' : 'Service key NOT found');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY environment variable is not set');
      throw new Error('OPENAI_API_KEY is not set');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      throw new Error('Supabase credentials not configured');
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { message, academia, chatbot, conversationHistory = [] }: ChatRequest = await req.json();
    
    console.log('Received chatbot request:', {
      message,
      academiaName: academia?.nome,
      chatbotFaqs: chatbot?.perguntasFrequentes?.length,
      hasConversationHistory: conversationHistory.length > 0
    });
    
    // Quick validation
    if (!message || !academia || !chatbot) {
      console.error('Missing required fields:', { hasMessage: !!message, hasAcademia: !!academia, hasChatbot: !!chatbot });
      return new Response(JSON.stringify({ 
        response: "Dados insuficientes para processar a solicitação.",
        fallback: true,
        error_reason: "missing_required_fields"
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Helper function to create appointment
    const createAgendamento = async (params: any) => {
      try {
        console.log('Creating appointment with params:', params);
        
        if (!academia.id) {
          return { error: 'Esta é uma demonstração. Para agendamentos reais, use o sistema completo da academia.' };
        }

        // Validate required fields
        if (!params.cliente_nome || !params.data_hora || !params.servico) {
          return { error: 'Nome do cliente, data/hora e serviço são obrigatórios' };
        }

        // Parse and validate date
        const dataHora = new Date(params.data_hora);
        if (isNaN(dataHora.getTime()) || dataHora < new Date()) {
          return { error: 'Data/hora inválida ou no passado' };
        }

        // Check for conflicts (±1 hour)
        const startTime = new Date(dataHora.getTime() - 60 * 60 * 1000);
        const endTime = new Date(dataHora.getTime() + 60 * 60 * 1000);
        
        const { data: conflicts } = await supabase
          .from('agendamentos')
          .select('id')
          .eq('academia_id', academia.id)
          .gte('data_hora', startTime.toISOString())
          .lte('data_hora', endTime.toISOString());

        if (conflicts && conflicts.length > 0) {
          return { error: 'Horário não disponível. Tente outro horário.' };
        }

        // Create appointment
        const { data, error } = await supabase
          .from('agendamentos')
          .insert({
            academia_id: academia.id,
            cliente_nome: params.cliente_nome,
            data_hora: dataHora.toISOString(),
            servico: params.servico,
            cliente_telefone: params.cliente_telefone || null,
            cliente_email: params.cliente_email || null,
            observacoes: params.observacoes || null,
            status: 'agendado'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating appointment:', error);
          return { error: 'Erro ao criar agendamento' };
        }

        return { 
          success: true, 
          agendamento: data,
          message: `Agendamento confirmado para ${dataHora.toLocaleDateString('pt-BR')} às ${dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        };
      } catch (error) {
        console.error('Error in createAgendamento:', error);
        return { error: 'Erro interno ao criar agendamento' };
      }
    };

    // Helper function to create/update lead
    const upsertLead = async (params: any) => {
      try {
        console.log('Creating/updating lead with params:', params);
        
        if (!academia.id) {
          return { success: true, message: 'Interesse registrado na demonstração' };
        }

        if (!params.nome) {
          return { error: 'Nome é obrigatório' };
        }

        const { data, error } = await supabase
          .from('leads')
          .insert({
            academia_id: academia.id,
            nome: params.nome,
            telefone: params.telefone || null,
            email: params.email || null,
            origem: params.origem || 'chatbot',
            observacoes: params.observacoes || null,
            status: 'novo',
            pipeline_stage: 'novo'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating lead:', error);
          return { error: 'Erro ao registrar interesse' };
        }

        return { 
          success: true, 
          lead: data,
          message: 'Interesse registrado com sucesso! Nossa equipe entrará em contato.'
        };
      } catch (error) {
        console.error('Error in upsertLead:', error);
        return { error: 'Erro interno ao registrar interesse' };
      }
    };
    console.log('Processing message for academia:', academia?.nome, 'Message:', message);

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

FUNCIONALIDADES ESPECIAIS:
- Você pode criar agendamentos reais usando a função create_agendamento quando o cliente solicitar
- Você pode registrar leads usando a função upsert_lead quando o cliente demonstrar interesse mas não agendar
- Para agendamentos, sempre confirme dados essenciais: nome, serviço desejado, data e horário preferido
- Para registrar interesse, capture ao menos o nome e uma forma de contato (telefone ou email)

Você tem acesso completo às informações desta academia específica. Use esse conhecimento para dar respostas personalizadas e úteis.`;

    // Define function tools for OpenAI
    const tools = [
      {
        type: "function",
        function: {
          name: "create_agendamento",
          description: "Cria um agendamento real para o cliente na academia",
          parameters: {
            type: "object",
            properties: {
              cliente_nome: {
                type: "string",
                description: "Nome completo do cliente"
              },
              data_hora: {
                type: "string",
                description: "Data e hora do agendamento no formato ISO (YYYY-MM-DDTHH:mm:ss)"
              },
              servico: {
                type: "string",
                description: "Serviço ou modalidade desejada"
              },
              cliente_telefone: {
                type: "string",
                description: "Telefone do cliente (opcional)"
              },
              cliente_email: {
                type: "string",
                description: "Email do cliente (opcional)"
              },
              observacoes: {
                type: "string",
                description: "Observações adicionais (opcional)"
              }
            },
            required: ["cliente_nome", "data_hora", "servico"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "upsert_lead",
          description: "Registra interesse do cliente como lead quando não há agendamento imediato",
          parameters: {
            type: "object",
            properties: {
              nome: {
                type: "string",
                description: "Nome do cliente interessado"
              },
              telefone: {
                type: "string",
                description: "Telefone para contato (opcional)"
              },
              email: {
                type: "string",
                description: "Email para contato (opcional)"
              },
              origem: {
                type: "string",
                description: "Origem do lead (sempre 'chatbot')"
              },
              observacoes: {
                type: "string",
                description: "Observações sobre o interesse do cliente"
              }
            },
            required: ["nome"]
          }
        }
      }
    ];

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Helper function for FAQ fallback
    const getFaqFallback = (userMessage: string) => {
      console.log('Using FAQ fallback for message:', userMessage);
      console.log('Available FAQs:', chatbot.perguntasFrequentes?.length || 0);
      
      if (!chatbot.perguntasFrequentes || chatbot.perguntasFrequentes.length === 0) {
        console.log('No FAQs available for fallback');
        return "Desculpe, estou com muitas solicitações no momento. Por favor, tente novamente em alguns segundos ou entre em contato conosco diretamente.";
      }
      
      const userWords = userMessage.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      let bestMatch = null;
      let maxMatches = 0;
      
      for (const faq of chatbot.perguntasFrequentes) {
        const faqWords = faq.pergunta.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        const matches = userWords.filter(word => 
          faqWords.some(faqWord => faqWord.includes(word) || word.includes(faqWord))
        ).length;

        if (matches > maxMatches && matches > 0) {
          maxMatches = matches;
          bestMatch = faq;
        }
      }
      
      console.log('FAQ matching result:', { bestMatch: bestMatch?.pergunta, maxMatches });
      
      return bestMatch 
        ? bestMatch.resposta 
        : "Desculpe, estou com muitas solicitações no momento. Por favor, tente novamente em alguns segundos ou entre em contato conosco diretamente.";
    };

    // Helper function for regex contact extraction
    const extractContacts = (text: string) => {
      const phoneRegex = /(?:\+55\s?)?(?:\(?[1-9]{2}\)?\s?)?(?:9\s?)?[6-9]\d{3}[-\s]?\d{4}/g;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      
      const phones = text.match(phoneRegex) || [];
      const emails = text.match(emailRegex) || [];
      
      return { phones, emails };
    };

    // Helper function for OpenAI API call with retries
    const callOpenAI = async (requestBody: any, attempt = 1): Promise<any> => {
      const maxRetries = 3;
      const baseDelay = 1000; // 1 second
      
      // Add random delay (500-1500ms) before calling OpenAI
      const randomDelay = 500 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, randomDelay));
      
      console.log(`OpenAI call attempt ${attempt} for academia: ${academia.nome}`);
      console.log('Request body model:', requestBody.model);
      console.log('Request body messages count:', requestBody.messages?.length || 0);
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error (attempt ${attempt}):`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          
          // Handle rate limit or server errors with retries
          if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000; // Exponential backoff with jitter
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callOpenAI(requestBody, attempt + 1);
          }
          
          // If all retries failed or other error, return FAQ fallback
          console.log(`OpenAI failed after ${attempt} attempts, using FAQ fallback`);
          const fallbackResponse = getFaqFallback(message);
          
          return {
            fallback: true,
            choices: [{
              message: {
                content: fallbackResponse,
                role: 'assistant'
              }
            }],
            error_reason: `HTTP ${response.status}: ${errorText}`
          };
      }
    };

    console.log('Calling OpenAI with context for academia:', academia.nome);

    let data = await callOpenAI({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      tools: tools,
      tool_choice: "auto"
    });

    let aiMessage = data.choices[0].message;

    // Handle function calling
    if (aiMessage.tool_calls && !data.fallback) {
      console.log('Processing tool calls:', aiMessage.tool_calls.length);
      
      // Add assistant message with tool calls to conversation
      messages.push(aiMessage);
      
      // Process each tool call
      for (const toolCall of aiMessage.tool_calls) {
        const functionName = toolCall.function.name;
        let functionArgs;
        
        try {
          functionArgs = JSON.parse(toolCall.function.arguments);
        } catch (parseError) {
          console.error('Failed to parse function arguments:', parseError);
          // Try regex fallback for lead creation
          if (functionName === 'upsert_lead') {
            const contacts = extractContacts(message);
            const nameMatch = message.match(/(?:me chamo|eu sou|meu nome é|sou)\s+([A-Za-zÀ-ÿ\s]+)/i);
            functionArgs = {
              nome: nameMatch ? nameMatch[1].trim() : 'Cliente Interessado',
              telefone: contacts.phones[0] || null,
              email: contacts.emails[0] || null,
              observacoes: 'Contato extraído via regex fallback'
            };
          } else {
            functionArgs = {};
          }
        }
        
        console.log(`Executing function: ${functionName}`, functionArgs);
        
        let functionResult;
        
        if (functionName === 'create_agendamento') {
          functionResult = await createAgendamento(functionArgs);
        } else if (functionName === 'upsert_lead') {
          functionResult = await upsertLead(functionArgs);
        } else {
          functionResult = { error: 'Função não reconhecida' };
        }
        
        // Add function result to messages
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(functionResult)
        });
      }
      
      // Make another OpenAI call to get the final response with retries
      const secondCallData = await callOpenAI({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });
      
      if (secondCallData.fallback) {
        console.log('Second OpenAI call failed, but functions were executed successfully');
        // Use a generic success message since functions were already executed
        const lastFunctionResult = JSON.parse(messages[messages.length - 1].content);
        if (lastFunctionResult.success) {
          aiMessage = {
            content: lastFunctionResult.message || "Operação realizada com sucesso! Nossa equipe entrará em contato.",
            role: 'assistant'
          };
        } else {
          aiMessage = secondCallData.choices[0].message;
        }
      } else {
        aiMessage = secondCallData.choices[0].message;
      }
    }

    const aiResponse = aiMessage.content;
    const isFallback = data.fallback || false;
    
    console.log(`AI Response generated successfully${isFallback ? ' (using fallback)' : ''}`);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      fallback: isFallback,
      error_reason: errorReason,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chatbot-ai function:', error);
    
    // Return 200 with fallback to prevent frontend from disabling AI
    const fallbackResponse = chatbot?.perguntasFrequentes?.length > 0 
      ? chatbot.perguntasFrequentes[0].resposta
      : "Desculpe, estou enfrentando dificuldades técnicas. Por favor, tente novamente em alguns minutos.";
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      fallback: true,
      error_reason: error.message
    }), {
      status: 200, // Changed from 500 to 200
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});