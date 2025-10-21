import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Templates de chatbot por segmento
const chatbotTemplates: Record<string, any> = {
  academia: {
    nome: "Assistente de Academia",
    personalidade: "Motivador, energético e focado em resultados de fitness",
    instrucoes: "Você é um assistente virtual de uma academia. Ajude os clientes com: horários de aulas, planos disponíveis, treinos personalizados, e agende avaliações físicas. Seja motivador e incentive hábitos saudáveis.",
    mensagens: {
      boas_vindas: "🏋️ Olá! Bem-vindo à nossa academia! Como posso te ajudar hoje? Posso informar sobre planos, horários de aulas ou agendar sua avaliação física!",
      captura_lead: "Para te ajudar melhor, qual seu nome e melhor telefone para contato?",
      agradecimento: "Obrigado! Em breve nossa equipe entrará em contato. Vamos juntos alcançar seus objetivos! 💪"
    }
  },
  salao: {
    nome: "Assistente de Salão",
    personalidade: "Elegante, atencioso e especialista em beleza",
    instrucoes: "Você é um assistente virtual de um salão de beleza. Ajude os clientes com: agendamentos, serviços disponíveis (corte, coloração, manicure, etc), preços e promoções. Seja elegante e faça os clientes se sentirem especiais.",
    mensagens: {
      boas_vindas: "✨ Olá! Bem-vindo ao nosso salão! Como posso te ajudar hoje? Posso mostrar nossos serviços, valores ou agendar seu horário!",
      captura_lead: "Para agendar seu horário, preciso do seu nome e telefone. Qual serviço te interessa?",
      agradecimento: "Perfeito! Logo entraremos em contato para confirmar. Mal podemos esperar para te deixar ainda mais linda(o)! 💅"
    }
  },
  clinica: {
    nome: "Assistente de Clínica",
    personalidade: "Profissional, empático e cuidadoso",
    instrucoes: "Você é um assistente virtual de uma clínica médica/odontológica. Ajude os pacientes com: agendamento de consultas, especialidades disponíveis, convênios aceitos e preparos para exames. Seja profissional, empático e transmita confiança.",
    mensagens: {
      boas_vindas: "🏥 Olá! Bem-vindo à nossa clínica! Como posso ajudá-lo hoje? Posso agendar consultas, informar sobre especialidades e convênios.",
      captura_lead: "Para agendar sua consulta, preciso do seu nome completo, telefone e convênio (se houver). Qual especialidade você procura?",
      agradecimento: "Anotado! Nossa equipe entrará em contato em breve para confirmar. Cuidamos de você! 🩺"
    }
  },
  restaurante: {
    nome: "Assistente de Restaurante",
    personalidade: "Simpático, prestativo e conhecedor da gastronomia",
    instrucoes: "Você é um assistente virtual de um restaurante. Ajude os clientes com: cardápio, reservas, delivery, promoções e eventos especiais. Seja simpático e faça os clientes terem água na boca!",
    mensagens: {
      boas_vindas: "🍽️ Olá! Bem-vindo ao nosso restaurante! Como posso te ajudar? Posso mostrar o cardápio, fazer reservas ou anotar seu pedido de delivery!",
      captura_lead: "Para fazer sua reserva ou pedido, preciso do seu nome e telefone. Para quantas pessoas?",
      agradecimento: "Anotado! Logo entraremos em contato. Prepare-se para uma experiência gastronômica incrível! 🍴"
    }
  },
  consultoria: {
    nome: "Assistente de Consultoria",
    personalidade: "Profissional, estratégico e focado em resultados",
    instrucoes: "Você é um assistente virtual de uma consultoria empresarial. Ajude os clientes com: serviços oferecidos, agendamento de reuniões, cases de sucesso e diagnósticos iniciais. Seja profissional e transmita expertise.",
    mensagens: {
      boas_vindas: "💼 Olá! Bem-vindo à nossa consultoria! Como podemos ajudar sua empresa a crescer? Posso agendar uma reunião diagnóstico ou apresentar nossos serviços.",
      captura_lead: "Para agendar uma conversa estratégica, preciso do seu nome, telefone e nome da empresa. Qual o principal desafio que você enfrenta?",
      agradecimento: "Perfeito! Nossa equipe entrará em contato em breve. Vamos juntos transformar seu negócio! 📈"
    }
  },
  ecommerce: {
    nome: "Assistente de E-commerce",
    personalidade: "Prestativo, rápido e focado em vendas",
    instrucoes: "Você é um assistente virtual de uma loja online. Ajude os clientes com: produtos disponíveis, status de pedidos, formas de pagamento, prazos de entrega e trocas/devoluções. Seja ágil e facilite a compra.",
    mensagens: {
      boas_vindas: "🛍️ Olá! Bem-vindo à nossa loja! Como posso te ajudar hoje? Posso mostrar produtos, rastrear pedidos ou tirar dúvidas sobre entrega!",
      captura_lead: "Para continuar, preciso do seu nome e melhor telefone. O que você está procurando?",
      agradecimento: "Ótimo! Em breve você receberá todas as informações. Obrigado por comprar conosco! 📦"
    }
  },
  default: {
    nome: "Assistente Virtual",
    personalidade: "Profissional, prestativo e amigável",
    instrucoes: "Você é um assistente virtual. Ajude os clientes com informações sobre produtos/serviços, agendamentos e tire dúvidas. Seja sempre educado e prestativo.",
    mensagens: {
      boas_vindas: "👋 Olá! Bem-vindo! Como posso te ajudar hoje?",
      captura_lead: "Para te ajudar melhor, qual seu nome e telefone para contato?",
      agradecimento: "Obrigado! Em breve entraremos em contato."
    }
  }
};

// Leads de exemplo por segmento
const exampleLeads: Record<string, any[]> = {
  academia: [
    { nome: "João Silva (Exemplo)", telefone: "(11) 99999-0001", email: "joao.exemplo@email.com", origem: "WhatsApp", status: "novo", pipeline_stage: "novo", valor_estimado: 150, observacoes: "Interessado em musculação e avaliação física" },
    { nome: "Maria Santos (Exemplo)", telefone: "(11) 99999-0002", email: "maria.exemplo@email.com", origem: "Instagram", status: "contato", pipeline_stage: "contato", valor_estimado: 200, observacoes: "Quer plano trimestral + personal" },
  ],
  salao: [
    { nome: "Ana Costa (Exemplo)", telefone: "(11) 99999-0001", email: "ana.exemplo@email.com", origem: "WhatsApp", status: "novo", pipeline_stage: "novo", valor_estimado: 120, observacoes: "Interessada em coloração e corte" },
    { nome: "Carla Souza (Exemplo)", telefone: "(11) 99999-0002", email: "carla.exemplo@email.com", origem: "Indicação", status: "qualificado", pipeline_stage: "qualificado", valor_estimado: 300, observacoes: "Quer pacote de noiva completo" },
  ],
  clinica: [
    { nome: "Roberto Lima (Exemplo)", telefone: "(11) 99999-0001", email: "roberto.exemplo@email.com", origem: "Google", status: "novo", pipeline_stage: "novo", valor_estimado: 250, observacoes: "Consulta ortopedia" },
    { nome: "Juliana Melo (Exemplo)", telefone: "(11) 99999-0002", email: "juliana.exemplo@email.com", origem: "WhatsApp", status: "contato", pipeline_stage: "contato", valor_estimado: 180, observacoes: "Check-up completo" },
  ],
  restaurante: [
    { nome: "Pedro Oliveira (Exemplo)", telefone: "(11) 99999-0001", email: "pedro.exemplo@email.com", origem: "Instagram", status: "novo", pipeline_stage: "novo", valor_estimado: 200, observacoes: "Reserva para jantar romântico" },
    { nome: "Fernanda Dias (Exemplo)", telefone: "(11) 99999-0002", email: "fernanda.exemplo@email.com", origem: "WhatsApp", status: "qualificado", pipeline_stage: "qualificado", valor_estimado: 500, observacoes: "Evento corporativo para 20 pessoas" },
  ],
  consultoria: [
    { nome: "Tech Solutions LTDA (Exemplo)", telefone: "(11) 99999-0001", email: "contato@techsolutions.com", origem: "LinkedIn", status: "qualificado", pipeline_stage: "qualificado", valor_estimado: 5000, observacoes: "Consultoria em gestão e processos" },
    { nome: "Carlos Mendes (Exemplo)", telefone: "(11) 99999-0002", email: "carlos.exemplo@email.com", origem: "Indicação", status: "proposta", pipeline_stage: "proposta", valor_estimado: 3000, observacoes: "Planejamento estratégico 2025" },
  ],
  ecommerce: [
    { nome: "Luana Pereira (Exemplo)", telefone: "(11) 99999-0001", email: "luana.exemplo@email.com", origem: "Site", status: "novo", pipeline_stage: "novo", valor_estimado: 150, observacoes: "Abandonou carrinho - tênis esportivo" },
    { nome: "Ricardo Alves (Exemplo)", telefone: "(11) 99999-0002", email: "ricardo.exemplo@email.com", origem: "WhatsApp", status: "negociacao", pipeline_stage: "negociacao", valor_estimado: 450, observacoes: "Compra recorrente - kit fitness" },
  ],
  default: [
    { nome: "Cliente Exemplo 1", telefone: "(11) 99999-0001", email: "exemplo1@email.com", origem: "WhatsApp", status: "novo", pipeline_stage: "novo", valor_estimado: 100, observacoes: "Lead de exemplo para teste" },
    { nome: "Cliente Exemplo 2", telefone: "(11) 99999-0002", email: "exemplo2@email.com", origem: "Site", status: "contato", pipeline_stage: "contato", valor_estimado: 200, observacoes: "Lead de exemplo para teste" },
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, empresaNome, segmento, numeroWhatsApp } = await req.json();

    console.log("🚀 Iniciando auto-setup para:", { userId, empresaNome, segmento });

    // 1. Criar negócio
    const negocioData = {
      user_id: userId,
      nome: empresaNome,
      tipo_negocio: segmento || 'outros',
      segmento: segmento || 'outros',
      whatsapp: numeroWhatsApp,
      telefone: numeroWhatsApp,
      created_at: new Date().toISOString(),
    };

    const { data: negocio, error: negocioError } = await supabase
      .from('negocios')
      .insert([negocioData])
      .select()
      .single();

    if (negocioError) {
      console.error("Erro ao criar negócio:", negocioError);
      throw negocioError;
    }

    console.log("✅ Negócio criado:", negocio.id);

    // 2. Criar chatbot com template do segmento
    const template = chatbotTemplates[segmento] || chatbotTemplates.default;
    
    const chatbotData = {
      negocio_id: negocio.id,
      nome: template.nome,
      personalidade: template.personalidade,
      instrucoes: template.instrucoes,
      mensagens: template.mensagens,
      ativo: true,
      status: 'Ativo',
      template: segmento,
      created_at: new Date().toISOString(),
    };

    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .insert([chatbotData])
      .select()
      .single();

    if (chatbotError) {
      console.error("Erro ao criar chatbot:", chatbotError);
      throw chatbotError;
    }

    console.log("✅ Chatbot criado:", chatbot.id);

    // 3. Criar leads de exemplo
    const leadsTemplate = exampleLeads[segmento] || exampleLeads.default;
    const leadsData = leadsTemplate.map(lead => ({
      ...lead,
      negocio_id: negocio.id,
      created_at: new Date().toISOString(),
    }));

    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .insert(leadsData)
      .select();

    if (leadsError) {
      console.error("Erro ao criar leads:", leadsError);
      // Não é crítico, continua
    } else {
      console.log(`✅ ${leads.length} leads de exemplo criados`);
    }

    // 4. Criar automação de boas-vindas
    const automacaoData = {
      user_id: userId,
      negocio_id: negocio.id,
      nome: "Boas-vindas Automáticas",
      descricao: "Envia mensagem de boas-vindas para novos leads",
      trigger_type: "novo_lead",
      trigger_config: { evento: "lead_criado" },
      actions: [
        {
          tipo: "enviar_whatsapp",
          mensagem: template.mensagens.boas_vindas,
          delay: 0
        }
      ],
      ativa: true,
      created_at: new Date().toISOString(),
    };

    const { error: automacaoError } = await supabase
      .from('automacoes')
      .insert([automacaoData]);

    if (automacaoError) {
      console.error("Erro ao criar automação:", automacaoError);
      // Não é crítico, continua
    } else {
      console.log("✅ Automação de boas-vindas criada");
    }

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          negocio,
          chatbot,
          leadsCount: leads?.length || 0,
          message: "Setup concluído com sucesso! 🎉"
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Erro no auto-setup:", error);
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
