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
  onAgendamentoCriado?: (agendamento: any) => void;
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
        
        // Check if academia.id is a demo ID (starts with 'aca_') or missing - treat as demo mode
        const isDemoMode = !academia.id || academia.id.startsWith('aca_');
        
        if (isDemoMode) {
          console.log('Demo mode detected - academia ID:', academia.id);
          const dataFormatada = new Date(params.data_hora).toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          });
          const horaFormatada = new Date(params.data_hora).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          return { 
            success: true, 
            message: `✅ Agendamento de demonstração confirmado!\n\n📅 Data: ${dataFormatada}\n⏰ Horário: ${horaFormatada}\n👤 Cliente: ${params.cliente_nome}\n🏃‍♂️ Serviço: ${params.servico}\n\n🎯 Este é um agendamento de demonstração. Para agendar de verdade, entre em contato conosco pelos canais disponíveis!`,
            demo: true,
            agendamento_demo: {
              academia_id: academia.id,
              cliente_nome: params.cliente_nome,
              data_hora: params.data_hora,
              servico: params.servico,
              cliente_telefone: params.cliente_telefone || null,
              cliente_email: params.cliente_email || null,
              observacoes: params.observacoes || null,
              status: 'agendado'
            }
          };
        }

        // Validate required fields
        if (!params.cliente_nome || !params.data_hora || !params.servico) {
          console.log('Missing required fields for appointment:', { 
            hasNome: !!params.cliente_nome, 
            hasDataHora: !!params.data_hora, 
            hasServico: !!params.servico 
          });
          return { error: 'Nome do cliente, data/hora e serviço são obrigatórios' };
        }

        // Parse and validate date with intelligent correction
        let dataHora = new Date(params.data_hora);
        console.log('Parsing date:', { 
          original: params.data_hora, 
          parsed: dataHora, 
          isValid: !isNaN(dataHora.getTime()),
          currentYear: new Date().getFullYear()
        });
        
        if (isNaN(dataHora.getTime())) {
          return { error: 'Data/hora inválida. Use o formato YYYY-MM-DDTHH:mm:ss' };
        }
        
        // Fix year if it's in the past - common issue with date parsing
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // If the parsed year is old (like 2023, 2024 when we're in 2025), update it
        if (dataHora.getFullYear() < currentYear) {
          console.log('Updating old year to current year:', {
            oldYear: dataHora.getFullYear(),
            newYear: currentYear
          });
          dataHora.setFullYear(currentYear);
        }
        
        // If date is still in the past, move to next year
        if (dataHora < now) {
          console.log('Date is in the past, moving to next occurrence:', { 
            original: dataHora.toISOString(), 
            now: now.toISOString() 
          });
          
          // Find next available time: if today and hour hasn't passed, use today; otherwise next day
          const nextSlot = new Date(now);
          if (dataHora.getHours() > now.getHours() && 
              dataHora.getDate() === now.getDate() && 
              dataHora.getMonth() === now.getMonth() && 
              dataHora.getFullYear() === now.getFullYear()) {
            // Same day, future hour - keep the time
            nextSlot.setHours(dataHora.getHours(), dataHora.getMinutes(), 0, 0);
          } else {
            // Move to next day with same time
            nextSlot.setDate(now.getDate() + 1);
            nextSlot.setHours(dataHora.getHours(), dataHora.getMinutes(), 0, 0);
          }
          
          dataHora = nextSlot;
          console.log('Corrected to next available slot:', dataHora.toISOString());
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

        console.log('Attempting to create appointment in database:', {
          academia_id: academia.id,
          cliente_nome: params.cliente_nome,
          data_hora: dataHora.toISOString(),
          servico: params.servico,
          status: 'agendado'
        });

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
          console.error('Database error creating appointment:', {
            error: error,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return { error: 'Erro ao salvar agendamento. Tente novamente ou entre em contato conosco.' };
        }

        console.log('✅ Appointment created successfully:', {
          id: data.id,
          cliente_nome: data.cliente_nome,
          data_hora: data.data_hora,
          servico: data.servico,
          status: data.status
        });

        const formatoData = dataHora.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        });
        const formatoHora = dataHora.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        console.log('Appointment created successfully:', data);
        return { 
          success: true, 
          agendamento: data,
          message: `✅ Agendamento confirmado com sucesso!\n\n📅 Data: ${formatoData}\n⏰ Horário: ${formatoHora}\n👤 Cliente: ${params.cliente_nome}\n🏃‍♂️ Serviço: ${params.servico}\n\nSeu agendamento foi registrado em nosso sistema! Nossa equipe aguarda você no horário marcado. Em caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.`
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

        // Try to get the authenticated user (from the Authorization header)
        const authHeader = req.headers.get('Authorization') || '';
        let userId: string | null = null;
        if (authHeader) {
          try {
            const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
              global: { headers: { Authorization: authHeader } },
            });
            const { data: authData } = await supabaseAuth.auth.getUser();
            userId = authData?.user?.id || null;
            console.log('Resolved user from JWT:', userId ? 'OK' : 'NOT FOUND');
          } catch (e) {
            console.warn('Could not resolve user from Authorization header:', e);
          }
        }

        // Check if academia.id is a demo ID (starts with 'aca_') or missing - treat as demo mode
        const isDemoMode = !academia.id || academia.id.startsWith('aca_');
        
        if (isDemoMode) {
          console.log('Demo mode detected for lead - academia ID:', academia.id);
          
          // Even in demo mode, create a visual lead representation
          const leadDemo = {
            id: `lead_demo_${Date.now()}`,
            academia_id: academia.id || 'demo_academia',
            nome: params.nome || 'Cliente Demo',
            telefone: params.telefone || null,
            email: params.email || null,
            origem: 'chatbot',
            status: 'novo',
            pipeline_stage: 'inicial',
            observacoes: `Lead de demonstração. Interesse via chatbot sobre ${academia.nome}. ${params.observacoes || ''}`,
            created_at: new Date().toISOString(),
          };
          
          return {
            success: true,
            lead: leadDemo,
            demo: true,
            message: `✅ Interesse registrado com sucesso!\n\nObrigado ${params.nome}! Registrei seu interesse em conhecer mais sobre a ${academia.nome}.\n\n🎯 Este é um lead de demonstração. Em um sistema real, nossa equipe entraria em contato em breve!\n\n📞 ${params.telefone ? `Telefone: ${params.telefone}` : 'Lembre-se de deixar seu contato para que possamos te ajudar melhor!'}`
          };
        }

        // Resolve a valid academia_id. If we are in demo (missing or non-uuid id),
        // create or reuse a DB academia for this user so that leads become visible via RLS.
        const isUuid = (val: string | undefined) => !!val && /[0-9a-fA-F-]{36}/.test(val);
        let targetAcademiaId: string | null = isUuid(academia.id) ? (academia.id as string) : null;

        if (!targetAcademiaId) {
          if (!userId) {
            console.log('No valid academia id and no user context -> demo lead only');
            return {
              success: true,
              message: `Interesse registrado na demonstração para ${params.nome}! Em um sistema real, nosso time entraria em contato. Obrigado pelo interesse!`,
              demo: true,
            };
          }

          // Try to find an existing academia for this user with the same name/unidade
          const { data: existingAcademias, error: findErr } = await supabase
            .from('academias')
            .select('id')
            .eq('user_id', userId)
            .eq('nome', academia.nome)
            .maybeSingle();

          if (findErr && findErr.code !== 'PGRST116') {
            console.warn('Error looking up existing academia:', findErr);
          }

          if (existingAcademias?.id) {
            targetAcademiaId = existingAcademias.id;
            console.log('Reusing existing academia id:', targetAcademiaId);
          } else {
            // Create a minimal academia row for this user
            const modalidadesArray = academia.modalidades
              ? academia.modalidades.split(',').map((s: string) => s.trim()).filter(Boolean)
              : null;
            const { data: createdAcademia, error: createErr } = await supabase
              .from('academias')
              .insert({
                user_id: userId,
                nome: academia.nome,
                unidade: academia.unidade || null,
                endereco: academia.endereco || null,
                telefone: academia.telefone || null,
                whatsapp: academia.whatsapp || null,
                horario_funcionamento: academia.horarios || null,
                modalidades: modalidadesArray,
                valores: null,
                promocoes: academia.promocoes || null,
                diferenciais: academia.diferenciais || null,
              })
              .select('id')
              .single();

            if (createErr) {
              console.error('Failed to create academia for user lead capture:', createErr);
              return { error: 'Não foi possível registrar o interesse agora. Tente novamente mais tarde.' };
            }

            targetAcademiaId = createdAcademia.id;
            console.log('Created new academia for user. id:', targetAcademiaId);
          }
        }

        if (!params.nome) {
          return { error: 'Nome é obrigatório' };
        }

        // Create or update lead in Supabase (service role bypasses RLS for write)
        const { data, error } = await supabase
          .from('leads')
          .upsert(
            {
              academia_id: targetAcademiaId,
              nome: params.nome,
              telefone: params.telefone || null,
              email: params.email || null,
              origem: 'chatbot',
              status: 'novo',
              pipeline_stage: 'inicial',
              valor_estimado: params.valor_estimado || null,
              observacoes:
                params.observacoes || `Interesse via chatbot sobre planos/serviços na academia ${academia.nome}`,
            },
            {
              onConflict: 'telefone,academia_id',
              ignoreDuplicates: false,
            }
          )
          .select()
          .single();

        if (error) {
          console.error('Error creating lead:', error);
          return { error: 'Erro ao registrar interesse' };
        }

        console.log('Lead created successfully:', data);
        return {
          success: true,
          lead: data,
          message: `✅ Interesse registrado com sucesso!\n\nObrigado ${params.nome}! Registrei seu interesse em conhecer mais sobre a ${academia.nome}. Nossa equipe entrará em contato em breve!\n\n📞 ${params.telefone ? `Telefone para contato: ${params.telefone}` : 'Lembre-se de deixar seu WhatsApp para que possamos te ajudar melhor!'}`,
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

REGRAS OBRIGATÓRIAS PARA COLETA DE LEADS:
- SEMPRE que alguém perguntar sobre planos, valores, modalidades, ou demonstrar qualquer interesse em conhecer a academia, você DEVE registrar um lead
- SEJA PROATIVO: Após fornecer as informações solicitadas, SEMPRE pergunte: "Para que nossa equipe possa entrar em contato com mais detalhes, pode me informar seu nome e WhatsApp?"
- NÃO aceite "não precisa" ou "só queria saber" - INSISTA educadamente: "É rapidinho! Assim posso te ajudar melhor com informações personalizadas."
- Use a função upsert_lead IMEDIATAMENTE quando tiver pelo menos o nome do cliente
- EXEMPLOS de quando usar upsert_lead:
  * Cliente pergunta sobre valores/planos → Responde + pede nome/contato + executa upsert_lead
  * Cliente quer saber modalidades → Responde + pede nome/contato + executa upsert_lead  
  * Cliente demonstra interesse → Responde + pede nome/contato + executa upsert_lead
  * Cliente diz "me interessei" → IMEDIATAMENTE pede nome/contato + executa upsert_lead

FUNCIONALIDADES ESPECIAIS:
- Você pode criar agendamentos usando a função create_agendamento quando o cliente solicitar
- Você DEVE registrar leads usando a função upsert_lead SEMPRE que o cliente demonstrar interesse (mesmo que seja só uma pergunta sobre planos)
- Para agendamentos, SEMPRE confirme dados essenciais: nome completo, serviço/modalidade desejada, data específica e horário
- Para leads, SEMPRE colete pelo menos o nome - WhatsApp é altamente recomendado mas não obrigatório

REGRAS CRÍTICAS PARA DATAS E AGENDAMENTOS:
- CONTEXTO TEMPORAL: Estamos em ${new Date().getFullYear()}, não em anos passados como 2023
- INTERPRETAÇÃO DE DATAS: Quando o cliente disser "11/09", "11 de setembro" ou similar, SEMPRE considere o ano atual (${new Date().getFullYear()}) ou próximo se já passou
- FORMATO OBRIGATÓRIO: Use SEMPRE o formato ISO: "${new Date().getFullYear()}-MM-DDTHH:mm:ss"
- EXEMPLOS CORRETOS:
  * "11/09 às 10h" = "${new Date().getFullYear()}-09-11T10:00:00"
  * "quinta-feira às 15h" = calcule a próxima quinta-feira em ${new Date().getFullYear()}
  * "amanhã às 9h" = calcule amanhã em ${new Date().getFullYear()}
- NUNCA USE ANOS ANTIGOS como 2023 ou 2024 se não estivermos neles
- Quando todos os dados estiverem completos (nome, data, hora, serviço), execute IMEDIATAMENTE a função create_agendamento

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
          description: "OBRIGATÓRIO usar sempre que alguém demonstrar interesse em planos, valores, modalidades ou qualquer aspecto da academia. Use IMEDIATAMENTE quando tiver pelo menos o nome do cliente.",
          parameters: {
            type: "object",
            properties: {
              nome: {
                type: "string",
                description: "Nome completo do cliente interessado - OBRIGATÓRIO"
              },
              telefone: {
                type: "string",
                description: "WhatsApp ou telefone para contato - ALTAMENTE RECOMENDADO"
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
                description: "Observações detalhadas sobre o interesse específico do cliente"
              }
            },
            required: ["nome"]
          }
        }
      }
    ];

    // Prepare messages for OpenAI
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDay = currentDate.getDate();
    
    const messages = [
      { 
        role: 'system', 
        content: `${systemPrompt}

IMPORTANTE SOBRE DATAS E AGENDAMENTOS:
- DATA ATUAL: ${currentDay}/${currentMonth.toString().padStart(2, '0')}/${currentYear} (${currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })})
- ANO ATUAL: ${currentYear}
- Quando o cliente disser apenas "11/09" ou similar, SEMPRE considere o ano atual (${currentYear}) ou próximo ano se a data já passou
- NUNCA use anos antigos como 2023 ou 2024 se estivermos em ${currentYear}
- Para criar agendamento use SEMPRE o formato: "${currentYear}-MM-DDTHH:mm:ss"
- Exemplo: para 11/09 às 10h use "${currentYear}-09-11T10:00:00"
- Formato de data obrigatório: YYYY-MM-DDTHH:mm:ss (exemplo: 2024-12-05T15:00:00)
- Se a data calculada estiver no passado, automaticamente mova para a próxima ocorrência disponível
- CONFIRME sempre a data calculada com o cliente antes de executar o agendamento` 
      },
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

        return await response.json();
      } catch (error) {
        console.error(`OpenAI call failed (attempt ${attempt}):`, error);
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return callOpenAI(requestBody, attempt + 1);
        }
        
        // Final fallback
        console.log('All OpenAI attempts failed, using FAQ fallback');
        const fallbackResponse = getFaqFallback(message);
        
        return {
          fallback: true,
          choices: [{
            message: {
              content: fallbackResponse,
              role: 'assistant'
            }
          }],
          error_reason: `Network error: ${error.message}`
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
    let agendamentoDemo = null;
    
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
        console.log('Available function parameters:', Object.keys(functionArgs || {}));
        
        let functionResult;
        
        if (functionName === 'create_agendamento') {
          functionResult = await createAgendamento(functionArgs);
          // Capture agendamento demo data if successful
          if (functionResult.success && functionResult.agendamento_demo) {
            agendamentoDemo = functionResult.agendamento_demo;
          }
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
    const errorReason = data.error_reason || null;
    
    console.log(`AI Response generated successfully${isFallback ? ' (using fallback)' : ''}`, {
      fallback: isFallback,
      error_reason: errorReason,
      response_length: aiResponse?.length || 0
    });

    const responseData: any = { 
      response: aiResponse,
      fallback: isFallback,
      error_reason: errorReason,
      usage: data.usage 
    };
    
    // Include agendamento demo data if available
    if (agendamentoDemo) {
      responseData.agendamento_demo = agendamentoDemo;
    }

    return new Response(JSON.stringify(responseData), {
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