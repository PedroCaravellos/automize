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

    // 4. Criar automações inteligentes por segmento
    const automacoes = getAutomacoesPorSegmento(segmento, negocio.id, userId, template);
    
    const { data: automacoesCreated, error: automacaoError } = await supabase
      .from('automacoes')
      .insert(automacoes)
      .select();

    if (automacaoError) {
      console.error("Erro ao criar automações:", automacaoError);
      // Não é crítico, continua
    } else {
      console.log(`✅ ${automacoesCreated.length} automações criadas`);
    }

    // 5. Criar agendamentos de exemplo (se aplicável)
    let agendamentosCount = 0;
    if (['academia', 'salao', 'clinica', 'restaurante'].includes(segmento)) {
      const agendamentosData = getAgendamentosExemplo(segmento, negocio.id);
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from('agendamentos')
        .insert(agendamentosData)
        .select();

      if (!agendamentosError && agendamentos) {
        agendamentosCount = agendamentos.length;
        console.log(`✅ ${agendamentosCount} agendamentos de exemplo criados`);
      }
    }

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          negocio,
          chatbot,
          leadsCount: leads?.length || 0,
          automacoesCount: automacoesCreated?.length || 0,
          agendamentosCount,
          segmento,
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

// ============= FUNÇÕES AUXILIARES =============

function getAutomacoesPorSegmento(segmento: string, negocioId: string, userId: string, template: any) {
  const baseAutomacoes = [
    {
      user_id: userId,
      negocio_id: negocioId,
      nome: "Boas-vindas Automáticas",
      descricao: "Envia mensagem de boas-vindas para novos leads",
      trigger_type: "novo_lead",
      trigger_config: { evento: "lead_criado" },
      actions: [{
        tipo: "enviar_whatsapp",
        mensagem: template.mensagens.boas_vindas,
        delay: 0
      }],
      ativa: true,
      created_at: new Date().toISOString(),
    }
  ];

  // Automações específicas por segmento
  const segmentAutomacoes: Record<string, any[]> = {
    academia: [
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Lembrete de Treino",
        descricao: "Envia lembrete motivacional de treino",
        trigger_type: "agendamento",
        trigger_config: { tipo: "aula_experimental", horas_antes: 2 },
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "💪 Olá! Seu treino está chegando! Lembre-se de trazer roupa confortável e uma garrafinha de água. Vamos juntos! 🏋️",
          delay: 0
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Follow-up Pós-Aula",
        descricao: "Pergunta como foi a experiência após a aula",
        trigger_type: "agendamento_concluido",
        trigger_config: { tipo: "aula_experimental" },
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "👋 E aí, como foi seu treino hoje? Gostou? Quer conhecer nossos planos? Estou aqui para te ajudar! 💪",
          delay: 3600
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      }
    ],
    salao: [
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Lembrete 24h Antes",
        descricao: "Lembra o cliente do agendamento",
        trigger_type: "agendamento",
        trigger_config: { horas_antes: 24 },
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "✨ Olá! Lembrete: você tem agendamento amanhã conosco! Estamos ansiosos para te deixar ainda mais linda(o)! 💅",
          delay: 0
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Oferta de Retorno",
        descricao: "Oferece desconto para retorno após 30 dias",
        trigger_type: "tempo_decorrido",
        trigger_config: { dias: 30, ultima_visita: true },
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "✨ Sentimos sua falta! Que tal voltar com 15% de desconto no seu próximo serviço? Estamos te esperando! 💇",
          delay: 0
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      }
    ],
    clinica: [
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Confirmação de Consulta",
        descricao: "Confirma consulta 24h antes",
        trigger_type: "agendamento",
        trigger_config: { horas_antes: 24 },
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "🏥 Olá! Confirme sua consulta de amanhã respondendo SIM. Se precisar reagendar, avise-nos com antecedência. Aguardamos você!",
          delay: 0
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Follow-up Pós-Consulta",
        descricao: "Verifica como o paciente está após consulta",
        trigger_type: "agendamento_concluido",
        trigger_config: {},
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "🩺 Olá! Como você está se sentindo após a consulta? Se tiver alguma dúvida ou precisar de algo, estamos à disposição!",
          delay: 86400 // 24h depois
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      }
    ],
    restaurante: [
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Confirmação de Reserva",
        descricao: "Confirma reserva 2h antes",
        trigger_type: "agendamento",
        trigger_config: { horas_antes: 2 },
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "🍽️ Olá! Confirme sua reserva para hoje respondendo SIM. Estamos preparando tudo para te receber!",
          delay: 0
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Feedback Pós-Refeição",
        descricao: "Pede feedback após a visita",
        trigger_type: "agendamento_concluido",
        trigger_config: {},
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "🍴 Esperamos que tenha aproveitado! Como foi sua experiência? Adoraríamos receber seu feedback!",
          delay: 7200 // 2h depois
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      }
    ],
    consultoria: [
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Preparação para Reunião",
        descricao: "Envia materiais antes da reunião",
        trigger_type: "agendamento",
        trigger_config: { horas_antes: 48 },
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "💼 Olá! Nossa reunião se aproxima. Para aproveitarmos melhor o tempo, que tal me contar um pouco sobre os principais desafios da sua empresa?",
          delay: 0
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      }
    ],
    ecommerce: [
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Carrinho Abandonado",
        descricao: "Recupera vendas de carrinho abandonado",
        trigger_type: "carrinho_abandonado",
        trigger_config: { horas: 2 },
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "🛍️ Notamos que você deixou itens no carrinho! Ainda está interessado? Posso te ajudar a finalizar a compra!",
          delay: 0
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        negocio_id: negocioId,
        nome: "Pós-Compra",
        descricao: "Agradece e pede avaliação",
        trigger_type: "venda_concluida",
        trigger_config: {},
        actions: [{
          tipo: "enviar_whatsapp",
          mensagem: "📦 Obrigado pela compra! Seu pedido está a caminho. Quando receber, adoraríamos saber sua opinião! ⭐",
          delay: 3600
        }],
        ativa: true,
        created_at: new Date().toISOString(),
      }
    ]
  };

  return [...baseAutomacoes, ...(segmentAutomacoes[segmento] || [])];
}

function getAgendamentosExemplo(segmento: string, negocioId: string) {
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(14, 0, 0, 0);

  const depoisAmanha = new Date(hoje);
  depoisAmanha.setDate(depoisAmanha.getDate() + 2);
  depoisAmanha.setHours(10, 0, 0, 0);

  const agendamentosBase: Record<string, any[]> = {
    academia: [
      {
        negocio_id: negocioId,
        cliente_nome: "João Silva (Exemplo)",
        cliente_telefone: "(11) 99999-0001",
        cliente_email: "joao.exemplo@email.com",
        servico: "Aula Experimental de Musculação",
        data_hora: amanha.toISOString(),
        status: "agendado",
        observacoes: "Primeira vez em academia, nunca treinou",
        created_at: new Date().toISOString(),
      },
      {
        negocio_id: negocioId,
        cliente_nome: "Maria Santos (Exemplo)",
        cliente_telefone: "(11) 99999-0002",
        cliente_email: "maria.exemplo@email.com",
        servico: "Avaliação Física Completa",
        data_hora: depoisAmanha.toISOString(),
        status: "agendado",
        observacoes: "Quer treino + personal trainer",
        created_at: new Date().toISOString(),
      }
    ],
    salao: [
      {
        negocio_id: negocioId,
        cliente_nome: "Ana Costa (Exemplo)",
        cliente_telefone: "(11) 99999-0001",
        cliente_email: "ana.exemplo@email.com",
        servico: "Coloração + Corte",
        data_hora: amanha.toISOString(),
        status: "confirmado",
        observacoes: "Quer loiro platinado",
        created_at: new Date().toISOString(),
      },
      {
        negocio_id: negocioId,
        cliente_nome: "Carla Souza (Exemplo)",
        cliente_telefone: "(11) 99999-0002",
        cliente_email: "carla.exemplo@email.com",
        servico: "Manicure + Pedicure",
        data_hora: depoisAmanha.toISOString(),
        status: "agendado",
        observacoes: "Preferência: cores neutras",
        created_at: new Date().toISOString(),
      }
    ],
    clinica: [
      {
        negocio_id: negocioId,
        cliente_nome: "Roberto Lima (Exemplo)",
        cliente_telefone: "(11) 99999-0001",
        cliente_email: "roberto.exemplo@email.com",
        servico: "Consulta Ortopedia",
        data_hora: amanha.toISOString(),
        status: "confirmado",
        observacoes: "Dor no joelho há 2 semanas",
        created_at: new Date().toISOString(),
      },
      {
        negocio_id: negocioId,
        cliente_nome: "Juliana Melo (Exemplo)",
        cliente_telefone: "(11) 99999-0002",
        cliente_email: "juliana.exemplo@email.com",
        servico: "Check-up Completo",
        data_hora: depoisAmanha.toISOString(),
        status: "agendado",
        observacoes: "Exames de rotina anuais",
        created_at: new Date().toISOString(),
      }
    ],
    restaurante: [
      {
        negocio_id: negocioId,
        cliente_nome: "Pedro Oliveira (Exemplo)",
        cliente_telefone: "(11) 99999-0001",
        cliente_email: "pedro.exemplo@email.com",
        servico: "Jantar Romântico - Mesa para 2",
        data_hora: amanha.toISOString(),
        status: "confirmado",
        observacoes: "Aniversário de namoro, decoração especial",
        created_at: new Date().toISOString(),
      },
      {
        negocio_id: negocioId,
        cliente_nome: "Fernanda Dias (Exemplo)",
        cliente_telefone: "(11) 99999-0002",
        cliente_email: "fernanda.exemplo@email.com",
        servico: "Almoço Corporativo - 20 pessoas",
        data_hora: depoisAmanha.toISOString(),
        status: "agendado",
        observacoes: "Menu vegetariano para 5 pessoas",
        created_at: new Date().toISOString(),
      }
    ]
  };

  return agendamentosBase[segmento] || [];
}
