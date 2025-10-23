import { NegocioItem, ChatbotItem, LeadItem, AutomacaoItem } from "@/types";

export type BusinessContext = 
  | 'novo_usuario' 
  | 'chatbot_testado' 
  | 'tem_leads' 
  | 'vendendo';

export interface ContextAnalysis {
  context: BusinessContext;
  priority: string;
  nextStep: string;
  timeInCurrentState: number; // em horas
  completionPercentage: number;
}

export class ContextService {
  static analyzeBusinessContext(
    negocios: NegocioItem[],
    chatbots: ChatbotItem[],
    leads: LeadItem[],
    automacoes: AutomacaoItem[]
  ): ContextAnalysis {
    const now = new Date();
    const hasNegocios = negocios.length > 0;
    const hasChatbots = chatbots.length > 0;
    const activeChatbots = chatbots.filter(c => c.status === 'Ativo');
    const hasLeads = leads.length > 0;
    const recentLeads = leads.filter(l => {
      const leadDate = new Date(l.created_at);
      const hoursSince = (now.getTime() - leadDate.getTime()) / (1000 * 60 * 60);
      return hoursSince < 72; // últimas 72h
    });
    const activeAutomations = automacoes.filter(a => a.ativa);

    // Detectar contexto
    if (!hasNegocios || negocios.length === 0) {
      return {
        context: 'novo_usuario',
        priority: '🎉 Bem-vindo! Configure seu negócio',
        nextStep: 'Criar primeiro negócio',
        timeInCurrentState: 0,
        completionPercentage: 10
      };
    }

    const oldestNegocio = negocios[0];
    const createdAt = new Date(oldestNegocio.created_at || oldestNegocio.createdAt || now);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Novo usuário (0-24h)
    if (hoursSinceCreation < 24 && !hasLeads) {
      return {
        context: 'novo_usuario',
        priority: '👉 Teste seu chatbot agora',
        nextStep: 'Abrir simulador do chatbot',
        timeInCurrentState: hoursSinceCreation,
        completionPercentage: hasChatbots ? 40 : 30
      };
    }

    // Chatbot testado (24-48h)
    if (hoursSinceCreation < 48 && !hasLeads && activeChatbots.length > 0) {
      return {
        context: 'chatbot_testado',
        priority: '📤 Compartilhe seu chatbot',
        nextStep: 'Copiar link e compartilhar',
        timeInCurrentState: hoursSinceCreation,
        completionPercentage: 50
      };
    }

    // Tem leads (48h+)
    if (hasLeads && recentLeads.length > 0) {
      const newLeads = leads.filter(l => l.status === 'novo');
      return {
        context: 'tem_leads',
        priority: `🎯 ${newLeads.length} leads novos esperando`,
        nextStep: 'Responder leads',
        timeInCurrentState: hoursSinceCreation,
        completionPercentage: 70
      };
    }

    // Vendendo (1 semana+)
    if (hoursSinceCreation > 168 || (hasLeads && activeAutomations.length > 0)) {
      return {
        context: 'vendendo',
        priority: '💰 Otimize sua conversão',
        nextStep: 'Analisar funil de vendas',
        timeInCurrentState: hoursSinceCreation,
        completionPercentage: 90
      };
    }

    // Default
    return {
      context: 'novo_usuario',
      priority: '👉 Configure seu dashboard',
      nextStep: 'Completar setup',
      timeInCurrentState: hoursSinceCreation,
      completionPercentage: 20
    };
  }

  static getActionSuggestions(context: BusinessContext, data: {
    leads: LeadItem[];
    chatbots: ChatbotItem[];
    automacoes: AutomacaoItem[];
  }) {
    const now = new Date();
    
    switch (context) {
      case 'novo_usuario':
        return [
          {
            id: 'test-chatbot',
            title: '💡 Teste seu chatbot',
            description: 'Veja como ele responde aos clientes',
            action: 'open-simulator',
            priority: 'high'
          }
        ];

      case 'chatbot_testado':
        return [
          {
            id: 'share-chatbot',
            title: '📤 Compartilhe seu chatbot',
            description: 'Copie o link e cole no Instagram, WhatsApp ou site',
            action: 'copy-link',
            priority: 'high'
          }
        ];

      case 'tem_leads':
        const unrespondedLeads = data.leads.filter(l => {
          const leadDate = new Date(l.created_at);
          const hoursSince = (now.getTime() - leadDate.getTime()) / (1000 * 60 * 60);
          return hoursSince > 72 && l.status === 'novo';
        });

        return [
          {
            id: 'respond-leads',
            title: `📱 ${unrespondedLeads.length} leads sem resposta há 3+ dias`,
            description: 'Envie follow-up automático agora',
            action: 'send-followup',
            priority: 'high',
            data: { leadIds: unrespondedLeads.map(l => l.id) }
          }
        ];

      case 'vendendo':
        const totalLeads = data.leads.length;
        const convertedLeads = data.leads.filter(l => l.status === 'ganho').length;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        return [
          {
            id: 'optimize-conversion',
            title: `💰 Conversão: ${conversionRate.toFixed(0)}%`,
            description: 'IA detectou oportunidades de melhoria',
            action: 'view-insights',
            priority: 'medium'
          }
        ];

      default:
        return [];
    }
  }
}
