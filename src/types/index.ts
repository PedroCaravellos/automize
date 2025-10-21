import { User, Session } from '@supabase/supabase-js';

// ============= Core Types =============
export interface Profile {
  id: string;
  user_id: string;
  email: string;
  nome: string | null;
  telefone: string | null;
  plano: string;
  trial_end_date: string | null;
  created_at: string;
  updated_at: string;
  // Computed properties for backward compatibility
  plano_ativo: boolean;
  nome_plano: string | null;
  trial_ativo: boolean;
  trial_fim_em: string | null;
  name?: string | null;
}

export interface NegocioItem {
  id: string;
  user_id?: string;
  nome: string;
  unidade: string;
  segmento: string;
  tipoNegocio?: string;
  statusChatbot?: 'Nenhum' | 'Em configuração' | 'Ativo';
  createdAt?: string;
  created_at?: string;
  endereco?: string;
  telefone?: string;
  whatsapp?: string;
  horarioFuncionamento?: string;
  horario_funcionamento?: string;
  servicosOferecidos?: string[];
  servicos_oferecidos?: string[];
  valores?: any;
  promocoes?: string;
  diferenciais?: string;
}

export interface ChatbotMessageSet {
  boasVindas: string;
  faqs: { pergunta: string; resposta: string }[];
  encerramento: string;
}

export interface ChatbotItem {
  id: string;
  nome: string;
  negocioId: string;
  negocio_id?: string;
  template: string;
  status: 'Em configuração' | 'Ativo';
  interacoes: number;
  mensagens: ChatbotMessageSet;
  personalidade?: string;
  instrucoes?: string;
  createdAt: string;
  created_at?: string;
}

export interface LeadItem {
  id: string;
  negocio_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  origem?: string;
  status: string;
  pipeline_stage: string;
  observacoes?: string;
  valor_estimado?: number;
  created_at: string;
  updated_at: string;
}

export interface AgendamentoDemo {
  id: string;
  negocio_id: string;
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  data_hora: string;
  servico: string;
  observacoes?: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
  created_at: string;
}

export interface AutomacaoItem {
  id: string;
  user_id: string;
  negocio_id: string;
  nome: string;
  descricao?: string;
  trigger_type: string;
  trigger_config?: any;
  actions?: any;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

// ============= State Types =============
export interface ActivityEvent {
  id: string;
  ts: string;
  text: string;
}

export interface OnboardingProgress {
  simulatorOpened: boolean;
  demoShared: boolean;
}

export interface BillingInfo {
  nomeOuRazao: string;
  documento: string;
  emailCobranca: string;
  endereco: string;
}

export interface Invoice {
  id: string;
  data: string;
  valor: number;
  status: string;
}

export interface WhatsAppIntegration {
  connected: boolean;
  provider?: string;
  phoneNumber?: string;
  lastSync?: string;
}

export interface Subscription {
  planoAtivo: boolean;
  nomePlano: string;
  trialAtivo: boolean;
  trialFimEm?: string;
  proximaRenovacaoEm?: string;
  integrations: {
    whatsapp: WhatsAppIntegration;
  };
}

// ============= Context Types =============
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isHydrating: boolean;
  intendedRoute: string | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  activateTrial: () => Promise<void>;
  selectPlan: (planName: string) => Promise<void>;
  hasAccess: () => boolean;
  trialDaysRemaining: () => number;
  setIntendedRoute: (route: string | null) => void;
}

export interface ProfileContextType {
  onboardingProgress: OnboardingProgress;
  updateOnboardingProgress: (updates: Partial<OnboardingProgress>) => void;
  trialActive: boolean;
  planoAtivo: boolean;
  billingInfo: BillingInfo;
  invoices: Invoice[];
  subscription: Subscription;
  updateBillingInfo: (info: Partial<BillingInfo>) => void;
  simulateActivatePlan: (plano: 'Basico' | 'Pro' | 'Premium') => { invoiceId: string };
  simulateCancelSubscription: () => void;
  simulateStartTrial: () => { success: boolean };
  addInvoice: (invoice: Invoice) => void;
  formatBRL: (value: number) => string;
  simulateConnectWhatsApp: (data: Partial<WhatsAppIntegration>) => void;
  simulateDisconnectWhatsApp: () => void;
}

export interface BusinessContextType {
  negocios: NegocioItem[];
  chatbots: ChatbotItem[];
  leads: LeadItem[];
  agendamentosDemo: AgendamentoDemo[];
  automacoes: AutomacaoItem[];
  activity: ActivityEvent[];
  addActivity: (text: string) => void;
  // Negócios
  addNegocio: (data: Omit<NegocioItem, 'id' | 'createdAt' | 'statusChatbot'>) => NegocioItem;
  updateNegocio: (id: string, updates: Partial<Omit<NegocioItem, 'id' | 'createdAt'>>) => void;
  removeNegocio: (id: string) => void;
  setNegocioStatus: (id: string, status: NegocioItem['statusChatbot']) => void;
  syncNegociosFromDB: () => Promise<void>;
  // Agendamentos
  addAgendamentoDemo: (agendamento: Omit<AgendamentoDemo, 'id' | 'created_at'>) => AgendamentoDemo;
  removeAgendamentoDemo: (id: string) => void;
  // Chatbots
  createChatbot: (data: { negocioId: string; template: string; mensagens: ChatbotMessageSet }) => ChatbotItem | null;
  updateChatbotMessages: (id: string, mensagens: ChatbotMessageSet) => ChatbotItem | null;
  toggleChatbotStatus: (id: string) => ChatbotItem | null;
  deleteChatbot: (id: string) => ChatbotItem | null;
}

// ============= Form Types =============
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface NegocioFormData {
  nome: string;
  unidade?: string;
  tipoNegocio: string;
  segmento: string;
  endereco?: string;
  telefone?: string;
  whatsapp?: string;
  horario_funcionamento?: string;
  servicos_oferecidos?: string[];
  valores?: any;
  promocoes?: string;
  diferenciais?: string;
}

export interface LeadFormData {
  nome: string;
  telefone?: string;
  email?: string;
  negocio_id: string;
  origem: string;
  status: string;
  pipeline_stage: string;
  observacoes?: string;
  valor_estimado?: string;
}
