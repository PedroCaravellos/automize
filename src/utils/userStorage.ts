export interface StoredAcademia {
  id: string;
  nome: string;
  unidade: string;
  segmento: "Academia" | "Estúdio" | "Box";
  statusChatbot: "Nenhum" | "Em configuração" | "Ativo";
  createdAt: string;
}

export interface StoredChatbot {
  id: string;
  nome: string;
  academiaId: string;
  template: string;
  status: "Em configuração" | "Ativo";
  interacoes: number;
  mensagens: {
    boasVindas: string;
    faqs: { pergunta: string; resposta: string }[];
    encerramento: string;
  };
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  ts: string; // ISO timestamp
  text: string; // e.g., "Chatbot criado – Bot – Academia X"
}

export interface OnboardingProgress {
  simulatorOpened: boolean;
  demoShared: boolean;
}

export interface BillingInfo {
  nomeOuRazao: string;
  documento: string; // CPF ou CNPJ (somente números)
  emailCobranca: string;
  endereco: string;
}

export interface Invoice {
  id: string;           // ex.: "INV-2025-0001"
  plano: 'Basico' | 'Pro' | 'Premium';
  valor: number;        // em centavos
  status: 'paga' | 'pendente' | 'cancelada';
  criadoEm: string;     // ISO
  pagoEm?: string;      // ISO
  vencimentoEm: string; // ISO
}

export interface WhatsAppIntegration {
  connected: boolean;
  provider?: string;
  wabaId?: string;
  phoneId?: string;
  apiKey?: string;
  verifyToken?: string;
  webhookUrl?: string;
  connectedAt?: string;
}

export interface Integrations {
  whatsapp: WhatsAppIntegration;
}

export interface Subscription {
  planoAtivo: boolean;
  nomePlano: '' | 'Basico' | 'Pro' | 'Premium';
  trialAtivo: boolean;
  trialFimEm?: string;           // ISO
  proximaRenovacaoEm?: string;   // ISO (30 dias após ativação)
  integrations: Integrations;
}

export interface UserStoredData {
  academias: StoredAcademia[];
  chatbots: StoredChatbot[];
  activity: ActivityEvent[];
  onboardingProgress: OnboardingProgress;
  billingInfo: BillingInfo;
  invoices: Invoice[];
  subscription: Subscription;
}

const keyFor = (userId: string) => `automiza:user:${userId}`;

export function getUserData(userId: string): UserStoredData {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return { 
      academias: [], 
      chatbots: [], 
      activity: [],
      onboardingProgress: { simulatorOpened: false, demoShared: false },
      billingInfo: { nomeOuRazao: '', documento: '', emailCobranca: '', endereco: '' },
      invoices: [],
      subscription: { planoAtivo: false, nomePlano: '', trialAtivo: false, integrations: { whatsapp: { connected: false } } }
    };
    const parsed = JSON.parse(raw);
    return {
      academias: Array.isArray(parsed.academias) ? parsed.academias : [],
      chatbots: Array.isArray(parsed.chatbots) ? parsed.chatbots : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
      onboardingProgress: parsed.onboardingProgress || { simulatorOpened: false, demoShared: false },
      billingInfo: parsed.billingInfo || { nomeOuRazao: '', documento: '', emailCobranca: '', endereco: '' },
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : [],
      subscription: parsed.subscription || { planoAtivo: false, nomePlano: '', trialAtivo: false, integrations: { whatsapp: { connected: false } } }
    };
  } catch (e) {
    console.warn("Failed to parse user data from storage", e);
    return { 
      academias: [], 
      chatbots: [], 
      activity: [], 
      onboardingProgress: { simulatorOpened: false, demoShared: false },
      billingInfo: { nomeOuRazao: '', documento: '', emailCobranca: '', endereco: '' },
      invoices: [],
      subscription: { planoAtivo: false, nomePlano: '', trialAtivo: false, integrations: { whatsapp: { connected: false } } }
    };
  }
}

export function formatBRL(valueInCents: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(valueInCents / 100);
}

export function saveUserData(userId: string, data: UserStoredData) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save user data to storage", e);
  }
}

export function updateUserData(
  userId: string,
  updater: (data: UserStoredData) => UserStoredData
): UserStoredData {
  const current = getUserData(userId);
  const updated = updater(current);
  saveUserData(userId, updated);
  return updated;
}

export function generateId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

