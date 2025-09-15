import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getUserData, saveUserData, generateId, OnboardingProgress, BillingInfo, Invoice, Subscription, formatBRL, WhatsAppIntegration } from '@/utils/userStorage';

interface Profile {
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
  name?: string | null; // Alias for nome
}

interface ActivityEvent { id: string; ts: string; text: string }
interface ChatbotMessageSet {
  boasVindas: string;
  faqs: { pergunta: string; resposta: string }[];
  encerramento: string;
}
interface ChatbotItem {
  id: string;
  nome: string;
  academiaId: string;
  template: string;
  status: 'Em configuração' | 'Ativo';
  interacoes: number;
  mensagens: ChatbotMessageSet;
  createdAt: string;
}
interface AcademiaItem {
  id: string;
  nome: string;
  unidade: string;
  segmento: 'Academia' | 'Estúdio' | 'Box' | 'Clínica' | 'Barbearia' | 'Restaurante' | 'Escola' | 'Oficina' | 'Loja' | 'Consultoria' | 'Outros';
  statusChatbot: 'Nenhum' | 'Em configuração' | 'Ativo';
  createdAt: string;
  endereco?: string;
  telefone?: string;
  whatsapp?: string;
  horarios?: string;
  modalidades?: string;
  valores?: string;
  promocoes?: string;
  diferenciais?: string;
}

interface NegocioItem {
  id: string;
  nome: string;
  unidade: string;
  segmento: 'Academia' | 'Estúdio' | 'Box' | 'Clínica' | 'Barbearia' | 'Restaurante' | 'Escola' | 'Oficina' | 'Loja' | 'Consultoria' | 'Outros';
  statusChatbot: 'Nenhum' | 'Em configuração' | 'Ativo';
  createdAt: string;
  endereco?: string;
  telefone?: string;
  whatsapp?: string;
  horarios?: string;
  modalidades?: string;
  valores?: string;
  promocoes?: string;
  diferenciais?: string;
}

interface AgendamentoDemo {
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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isHydrating: boolean;
  intendedRoute: string | null;
  // Auth
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  activateTrial: () => Promise<void>;
  selectPlan: (planName: string) => Promise<void>;
  hasAccess: () => boolean;
  trialDaysRemaining: () => number;
  setIntendedRoute: (route: string | null) => void;
  // Global app state
  academias: AcademiaItem[];
  negocios: NegocioItem[];
  chatbots: ChatbotItem[];
  agendamentosDemo: AgendamentoDemo[];
  activity: ActivityEvent[];
  addActivity: (text: string) => void;
  // Onboarding progress
  onboardingProgress: OnboardingProgress;
  updateOnboardingProgress: (updates: Partial<OnboardingProgress>) => void;
  trialActive: boolean;
  planoAtivo: boolean;
  // Billing and subscription
  billingInfo: BillingInfo;
  invoices: Invoice[];
  subscription: Subscription;
  updateBillingInfo: (info: Partial<BillingInfo>) => void;
  simulateActivatePlan: (plano: 'Basico' | 'Pro' | 'Premium') => { invoiceId: string };
  simulateCancelSubscription: () => void;
  simulateStartTrial: () => { success: boolean };
  addInvoice: (invoice: Invoice) => void;
  formatBRL: (value: number) => string;
  // Integrations
  simulateConnectWhatsApp: (data: Partial<WhatsAppIntegration>) => void;
  simulateDisconnectWhatsApp: () => void;
  // Negócios
  addNegocio: (data: Omit<NegocioItem, 'id' | 'createdAt' | 'statusChatbot'>) => NegocioItem;
  updateNegocio: (id: string, updates: Partial<Omit<NegocioItem, 'id' | 'createdAt'>>) => void;
  removeNegocio: (id: string) => void;
  setNegocioStatus: (id: string, status: NegocioItem['statusChatbot']) => void;
  // Agendamentos Demo
  addAgendamentoDemo: (agendamento: Omit<AgendamentoDemo, 'id' | 'created_at'>) => AgendamentoDemo;
  removeAgendamentoDemo: (id: string) => void;
  // Chatbots
  createChatbot: (data: { academiaId: string; template: string; mensagens: ChatbotMessageSet }) => ChatbotItem | null;
  updateChatbotMessages: (id: string, mensagens: ChatbotMessageSet) => ChatbotItem | null;
  
  toggleChatbotStatus: (id: string) => ChatbotItem | null;
  deleteChatbot: (id: string) => ChatbotItem | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrating, setIsHydrating] = useState(true);
  const [intendedRoute, setIntendedRoute] = useState<string | null>(null);
  const [academias, setAcademias] = useState<AcademiaItem[]>([]);
  const [negocios, setNegocios] = useState<NegocioItem[]>([]);
  const [chatbots, setChatbots] = useState<ChatbotItem[]>([]);
  const [agendamentosDemo, setAgendamentosDemo] = useState<AgendamentoDemo[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress>({ simulatorOpened: false, demoShared: false });
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({ nomeOuRazao: '', documento: '', emailCobranca: '', endereco: '' });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const defaultSub: Subscription = { 
    planoAtivo: false, 
    nomePlano: '', 
    trialAtivo: false, 
    integrations: { whatsapp: { connected: false } } 
  };
  const [subscription, setSubscription] = useState<Subscription>(defaultSub);
  const hydratedRef = useRef(false);

  const normalizeSubscription = (sub?: any): Subscription => {
    const base = sub || {};
    const integrations = base.integrations || {};
    const whatsapp = integrations.whatsapp || { connected: false };
    return {
      planoAtivo: !!base.planoAtivo,
      nomePlano: base.nomePlano || '',
      trialAtivo: !!base.trialAtivo,
      trialFimEm: base.trialFimEm,
      proximaRenovacaoEm: base.proximaRenovacaoEm,
      integrations: { whatsapp }
    };
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data && !error) {
      // Map database fields to expected interface
      const mappedProfile: Profile = {
        ...data,
        // Computed properties for backward compatibility
        plano_ativo: data.plano !== 'trial' && data.plano !== null,
        nome_plano: data.plano !== 'trial' ? data.plano : null,
        trial_ativo: data.plano === 'trial' && data.trial_end_date ? new Date(data.trial_end_date) > new Date() : false,
        trial_fim_em: data.trial_end_date,
        name: data.nome // Alias for nome
      };
      setProfile(mappedProfile);
    }
  };

  // Function to ensure fresh session before making requests
  const ensureFreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('Failed to refresh session:', error);
        return false;
      }
      setSession(session);
      setUser(session?.user ?? null);
      return true;
    } catch (error) {
      console.warn('Error refreshing session:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            // Hydrate user data from localStorage
            const data = getUserData(session.user.id);
            setAcademias(data.academias || []);
            setNegocios((data as any).negocios || []);
            setChatbots(data.chatbots || []);
            setAgendamentosDemo(data.agendamentosDemo || []);
            setActivity(data.activity || []);
            setOnboardingProgress(data.onboardingProgress || { simulatorOpened: false, demoShared: false });
            setBillingInfo(data.billingInfo || { nomeOuRazao: '', documento: '', emailCobranca: '', endereco: '' });
            setInvoices(data.invoices || []);
            setSubscription(normalizeSubscription(data.subscription));
            hydratedRef.current = true;
            setIsHydrating(false);
            
            // Handle intended route navigation after successful login
            if (intendedRoute && event === 'SIGNED_IN') {
              setTimeout(() => {
                window.location.href = intendedRoute;
                setIntendedRoute(null);
              }, 100);
            }
          }, 0);
        } else {
          setProfile(null);
          setAcademias([]);
          setNegocios([]);
          setChatbots([]);
          setActivity([]);
          setOnboardingProgress({ simulatorOpened: false, demoShared: false });
          setBillingInfo({ nomeOuRazao: '', documento: '', emailCobranca: '', endereco: '' });
          setInvoices([]);
          setSubscription({ 
            planoAtivo: false, 
            nomePlano: '', 
            trialAtivo: false, 
            integrations: { whatsapp: { connected: false } } 
          });
          hydratedRef.current = false;
          setIsHydrating(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session and refresh if needed
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      
      // If session exists but token might be expired, try to refresh
      if (session) {
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        const finalSession = refreshedSession || session;
        
        setSession(finalSession);
        setUser(finalSession?.user ?? null);
        
        if (finalSession?.user) {
          fetchProfile(finalSession.user.id);
          const data = getUserData(finalSession.user.id);
          setAcademias(data.academias || []);
          setNegocios((data as any).negocios || []);
          setChatbots(data.chatbots || []);
          setAgendamentosDemo(data.agendamentosDemo || []);
          setActivity(data.activity || []);
          setOnboardingProgress(data.onboardingProgress || { simulatorOpened: false, demoShared: false });
          setBillingInfo(data.billingInfo || { nomeOuRazao: '', documento: '', emailCobranca: '', endereco: '' });
          setInvoices(data.invoices || []);
          setSubscription(normalizeSubscription(data.subscription));
          hydratedRef.current = true;
          setIsHydrating(false);
        }
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ensure profile is fetched if it didn't exist at first load (e.g., trigger added later)
  useEffect(() => {
    if (user?.id && !profile) {
      const t = setTimeout(() => fetchProfile(user.id), 500);
      return () => clearTimeout(t);
    }
  }, [user?.id, profile]);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAcademias([]);
    setChatbots([]);
    setAgendamentosDemo([]);
    setActivity([]);
    setOnboardingProgress({ simulatorOpened: false, demoShared: false });
    setBillingInfo({ nomeOuRazao: '', documento: '', emailCobranca: '', endereco: '' });
    setInvoices([]);
    setSubscription({ 
      planoAtivo: false, 
      nomePlano: '', 
      trialAtivo: false, 
      integrations: { whatsapp: { connected: false } } 
    });
    hydratedRef.current = false;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    // Map legacy fields to actual DB columns
    type DbUpdates = { nome?: string | null; telefone?: string | null; plano?: string | null; trial_end_date?: string | null };
    const dbUpdates: DbUpdates = {};

    // Direct mappable fields
    if (typeof (updates as any).nome !== 'undefined') dbUpdates.nome = (updates as any).nome as string | null;
    if (typeof (updates as any).telefone !== 'undefined') dbUpdates.telefone = (updates as any).telefone as string | null;
    if (typeof (updates as any).plano !== 'undefined') dbUpdates.plano = (updates as any).plano as string | null;
    if (typeof (updates as any).trial_end_date !== 'undefined') dbUpdates.trial_end_date = (updates as any).trial_end_date as string | null;

    // Legacy compatibility mapping
    const hasNomePlano = Object.prototype.hasOwnProperty.call(updates, 'nome_plano');
    const hasPlanoAtivo = Object.prototype.hasOwnProperty.call(updates, 'plano_ativo');
    const hasTrialAtivo = Object.prototype.hasOwnProperty.call(updates, 'trial_ativo');
    const hasTrialFimEm = Object.prototype.hasOwnProperty.call(updates, 'trial_fim_em');

    if (hasNomePlano) {
      // Set plan to provided name or null
      const nome_plano = (updates as any).nome_plano as string | null;
      dbUpdates.plano = nome_plano || null;
      // When moving to a paid plan, clear trial end
      if (nome_plano) dbUpdates.trial_end_date = null;
    }

    if (hasPlanoAtivo) {
      const plano_ativo = (updates as any).plano_ativo as boolean;
      // If explicitly deactivating plan and no nome_plano provided, set plano to null
      if (!plano_ativo && !hasNomePlano) dbUpdates.plano = null;
    }

    if (hasTrialAtivo) {
      const trial_ativo = (updates as any).trial_ativo as boolean;
      if (trial_ativo) {
        dbUpdates.plano = 'trial';
        // Use provided end or default to 7 days from now
        if (hasTrialFimEm) dbUpdates.trial_end_date = (updates as any).trial_fim_em as string | null;
        if (!dbUpdates.trial_end_date) {
          const end = new Date();
          end.setDate(end.getDate() + 7);
          dbUpdates.trial_end_date = end.toISOString();
        }
      } else {
        // Turning trial off
        dbUpdates.trial_end_date = null;
        // Do not force plan change here unless also deactivating plan
      }
    } else if (hasTrialFimEm) {
      // If only trial end provided
      dbUpdates.trial_end_date = (updates as any).trial_fim_em as string | null;
    }

    // If nothing to update, skip request
    if (Object.keys(dbUpdates).length === 0) return;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('user_id', user.id);

    if (!error) {
      // Re-fetch to ensure computed fields are accurate
      await fetchProfile(user.id);
    }
  };

  const activateTrial = async () => {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    
    await updateProfile({
      trial_ativo: true,
      trial_fim_em: trialEnd.toISOString()
    });
  };

  const selectPlan = async (planName: string) => {
    await updateProfile({
      plano_ativo: true,
      nome_plano: planName,
      trial_ativo: false,
      trial_fim_em: null
    });
  };

  const hasAccess = () => {
    // Check simulated subscription first (takes precedence over profile)
    if (subscription.planoAtivo) return true;
    if (subscription.trialAtivo && subscription.trialFimEm) {
      return new Date() < new Date(subscription.trialFimEm);
    }
    
    // Fallback to profile data (for real Supabase data)
    if (!profile) return false;
    if (profile.plano_ativo) return true;
    if (profile.trial_ativo && profile.trial_fim_em) {
      return new Date() < new Date(profile.trial_fim_em);
    }
    return false;
  };

  const trialDaysRemaining = () => {
    // Check simulated subscription first
    if (subscription.trialAtivo && subscription.trialFimEm) {
      const now = new Date();
      const trialEnd = new Date(subscription.trialFimEm);
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    
    // Fallback to profile data
    if (!profile?.trial_ativo || !profile.trial_fim_em) return 0;
    const now = new Date();
    const trialEnd = new Date(profile.trial_fim_em);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Persist snapshot whenever data changes
  useEffect(() => {
    if (!user?.id || !hydratedRef.current) return;
    saveUserData(user.id, { academias, chatbots, agendamentosDemo, activity, onboardingProgress, billingInfo, invoices, subscription });
  }, [user?.id, academias, chatbots, activity, onboardingProgress, billingInfo, invoices, subscription]);

  // Activity helper
  const addActivity = (text: string) => {
    setActivity(prev => [{ id: generateId('act'), ts: new Date().toISOString(), text }, ...prev].slice(0, 20));
  };

  // Onboarding progress
  const updateOnboardingProgress = (updates: Partial<OnboardingProgress>) => {
    setOnboardingProgress(prev => ({ ...prev, ...updates }));
  };

  // Billing and subscription
  const updateBillingInfo = (info: Partial<BillingInfo>) => {
    setBillingInfo(prev => ({ ...prev, ...info }));
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const PLAN_PRICES = {
    'Basico': 9700,   // R$ 97,00 em centavos
    'Pro': 19700,     // R$ 197,00 em centavos
    'Premium': 39700  // R$ 397,00 em centavos
  } as const;

  const simulateActivatePlan = (plano: 'Basico' | 'Pro' | 'Premium'): { invoiceId: string } => {
    if (!PLAN_PRICES[plano]) {
      throw new Error(`Plano inválido: ${plano}`);
    }

    const now = new Date();
    const proximaRenovacao = new Date(now);
    proximaRenovacao.setMonth(proximaRenovacao.getMonth() + 1);

    // Generate sequential invoice ID per user
    const currentYear = now.getFullYear();
    const userData = user?.id ? getUserData(user.id) : null;
    const currentYearInvoices = userData?.invoices.filter(inv => 
      new Date(inv.criadoEm).getFullYear() === currentYear
    ) || [];
    const nextNumber = currentYearInvoices.length + 1;
    const invoiceId = `INV-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
    
    const invoice: Invoice = {
      id: invoiceId,
      plano,
      valor: PLAN_PRICES[plano],
      status: 'paga',
      criadoEm: now.toISOString(),
      pagoEm: now.toISOString(),
      vencimentoEm: now.toISOString()
    };

    // Update subscription
    setSubscription(prev => ({
      ...prev,
      planoAtivo: true,
      nomePlano: plano,
      trialAtivo: false,
      trialFimEm: undefined,
      proximaRenovacaoEm: proximaRenovacao.toISOString()
    }));

    // Add invoice
    addInvoice(invoice);

    // Update profile to sync with legacy system
    if (profile) {
      updateProfile({
        plano_ativo: true,
        nome_plano: plano,
        trial_ativo: false,
        trial_fim_em: null
      });
    }

    // Add activity
    addActivity(`Plano ${plano} ativado (simulado) — Invoice ${invoiceId}`);

    return { invoiceId };
  };

  const simulateCancelSubscription = () => {
    // Update subscription to cancel plan and trial
    setSubscription(prev => ({
      ...prev,
      planoAtivo: false,
      nomePlano: '',
      proximaRenovacaoEm: undefined,
      trialAtivo: false,
      trialFimEm: undefined
    }));

    // Add activity
    addActivity('Assinatura cancelada (simulado)');

    // Update profile to sync with legacy system
    if (profile) {
      updateProfile({
        plano_ativo: false,
        nome_plano: null,
        trial_ativo: false,
        trial_fim_em: null
      });
    }
  };

  const simulateStartTrial = (): { success: boolean } => {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update subscription
    setSubscription(prev => ({
      ...prev,
      trialAtivo: true,
      trialFimEm: trialEnd.toISOString()
    }));

    // Add activity
    addActivity("Trial de 7 dias ativado (simulado)");

    // Update profile to sync with legacy system
    if (profile) {
      updateProfile({
        trial_ativo: true,
        trial_fim_em: trialEnd.toISOString()
      });
    }
    
    return { success: true };
  };

  // WhatsApp Integration functions
  const simulateConnectWhatsApp = (data: Partial<WhatsAppIntegration>) => {
    const now = new Date();
    const webhookUrl = `https://automiza.net/webhooks/whatsapp/${profile?.user_id || 'user-id'}`;
    
    setSubscription(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        whatsapp: {
          connected: true,
          provider: data.provider || '',
          wabaId: data.wabaId || '',
          phoneId: data.phoneId || '',
          apiKey: data.apiKey || '',
          verifyToken: data.verifyToken || '',
          webhookUrl,
          connectedAt: now.toISOString()
        }
      }
    }));
    
    addActivity(`WhatsApp Business conectado (simulado) — Provedor: ${data.provider || 'N/A'}`);
  };

  const simulateDisconnectWhatsApp = () => {
    setSubscription(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        whatsapp: {
          connected: false
        }
      }
    }));
    
    addActivity('WhatsApp Business desconectado (simulado)');
  };

  // Negócio actions
  const addNegocio = (data: Omit<NegocioItem, 'id' | 'createdAt' | 'statusChatbot'>): NegocioItem => {
    const novo: NegocioItem = {
      id: generateId('neg'),
      ...data,
      statusChatbot: 'Nenhum',
      createdAt: new Date().toISOString(),
    };
    setNegocios(prev => [...prev, novo]);
    addActivity(`Negócio cadastrado – ${data.nome}`);
    return novo;
  };

  const updateNegocio = (id: string, updates: Partial<Omit<NegocioItem, 'id' | 'createdAt'>>) => {
    setNegocios(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
    if (updates.nome) addActivity(`Negócio atualizado – ${updates.nome}`);
  };

  const removeNegocio = (id: string) => {
    const negocio = negocios.find(n => n.id === id);
    setNegocios(prev => prev.filter(n => n.id !== id));
    if (negocio) addActivity(`Negócio removido – ${negocio.nome}`);
  };

  const setNegocioStatus = (id: string, status: NegocioItem['statusChatbot']) => {
    setNegocios(prev => prev.map(n => (n.id === id ? { ...n, statusChatbot: status } : n)));
  };

  // Academia actions
  const addAcademia = (data: Omit<AcademiaItem, 'id' | 'createdAt' | 'statusChatbot'>): AcademiaItem => {
    const nova: AcademiaItem = {
      id: generateId('aca'),
      ...data,
      statusChatbot: 'Nenhum',
      createdAt: new Date().toISOString(),
    };
    setAcademias(prev => [...prev, nova]);
    addActivity(`Academia cadastrada – ${data.nome}`);
    return nova;
  };

  const updateAcademia = (id: string, updates: Partial<Omit<AcademiaItem, 'id' | 'createdAt'>>) => {
    setAcademias(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
    if (updates.nome) addActivity(`Academia atualizada – ${updates.nome}`);
  };

  const removeAcademia = (id: string) => {
    const academia = academias.find(a => a.id === id);
    setAcademias(prev => prev.filter(a => a.id !== id));
    if (academia) addActivity(`Academia removida – ${academia.nome}`);
  };

  const setAcademiaStatus = (id: string, status: AcademiaItem['statusChatbot']) => {
    setAcademias(prev => prev.map(a => (a.id === id ? { ...a, statusChatbot: status } : a)));
  };

  // Agendamento demo actions
  const addAgendamentoDemo = (data: Omit<AgendamentoDemo, 'id' | 'created_at'>): AgendamentoDemo => {
    const novoAgendamento: AgendamentoDemo = {
      id: generateId('agd'),
      ...data,
      created_at: new Date().toISOString(),
    };
    setAgendamentosDemo(prev => [...prev, novoAgendamento]);
    addActivity(`Agendamento criado – ${data.cliente_nome} – ${new Date(data.data_hora).toLocaleDateString('pt-BR')}`);
    return novoAgendamento;
  };

  const removeAgendamentoDemo = (id: string) => {
    const agendamento = agendamentosDemo.find(a => a.id === id);
    setAgendamentosDemo(prev => prev.filter(a => a.id !== id));
    if (agendamento) addActivity(`Agendamento removido – ${agendamento.cliente_nome}`);
  };

  // Chatbot actions
  const createChatbot = (data: { academiaId: string; template: string; mensagens: ChatbotMessageSet }): ChatbotItem | null => {
    const academia = academias.find(a => a.id === data.academiaId);
    if (!academia) return null;
    const bot: ChatbotItem = {
      id: generateId('bot'),
      nome: `Bot – ${academia.nome}`,
      academiaId: data.academiaId,
      template: data.template,
      status: 'Em configuração',
      interacoes: 0,
      mensagens: data.mensagens,
      createdAt: new Date().toISOString(),
    };
    setChatbots(prev => [...prev, bot]);
    if (academia.statusChatbot === 'Nenhum') setAcademiaStatus(data.academiaId, 'Em configuração');
    addActivity(`Chatbot criado – ${bot.nome} – ${academia.nome}`);
    return bot;
  };

  const updateChatbotMessages = (id: string, mensagens: ChatbotMessageSet): ChatbotItem | null => {
    let updated: ChatbotItem | null = null;
    setChatbots(prev => prev.map(b => {
      if (b.id === id) {
        updated = { ...b, mensagens };
        return updated;
      }
      return b;
    }));
    if (updated) {
      const academia = academias.find(a => a.id === updated!.academiaId);
      addActivity(`Chatbot editado – ${updated.nome} – ${academia?.nome}`);
    }
    return updated;
  };

  const toggleChatbotStatus = (id: string): ChatbotItem | null => {
    let updated: ChatbotItem | null = null;
    setChatbots(prev => prev.map(b => {
      if (b.id === id) {
        const newStatus = b.status === 'Ativo' ? 'Em configuração' : 'Ativo';
        updated = { ...b, status: newStatus };
        return updated;
      }
      return b;
    }));
    if (updated) {
      const academiaId = updated.academiaId;
      const academia = academias.find(a => a.id === academiaId);
      if (updated.status === 'Ativo') {
        setAcademiaStatus(academiaId, 'Ativo');
        addActivity(`Chatbot ativado – ${updated.nome} – ${academia?.nome}`);
      } else {
        // If no other active bot for this academia, set status to 'Em configuração'
        const otherActive = chatbots.some(b => b.academiaId === academiaId && b.id !== updated!.id && b.status === 'Ativo');
        if (!otherActive) setAcademiaStatus(academiaId, 'Em configuração');
        addActivity(`Chatbot desativado – ${updated.nome} – ${academia?.nome}`);
      }
    }
    return updated;
  };

  const deleteChatbot = (id: string): ChatbotItem | null => {
    const bot = chatbots.find(b => b.id === id) || null;
    if (!bot) return null;
    setChatbots(prev => prev.filter(b => b.id !== id));
    // After removal, if no active bot remains for that academia, set status to 'Nenhum'
    const stillActive = chatbots.some(b => b.id !== id && b.academiaId === bot.academiaId && b.status === 'Ativo');
    if (!stillActive) setAcademiaStatus(bot.academiaId, 'Nenhum');
    const academia = academias.find(a => a.id === bot.academiaId);
    addActivity(`Chatbot removido – ${bot.nome} – ${academia?.nome}`);
    return bot;
  };


  const value = {
    user,
    session,
    profile,
    loading,
    isHydrating,
    intendedRoute,
    signUp,
    signIn,
    signOut,
    updateProfile,
    activateTrial,
    selectPlan,
    hasAccess,
    trialDaysRemaining,
    setIntendedRoute,
    academias,
    negocios,
    chatbots,
    agendamentosDemo,
    activity,
    addActivity,
    onboardingProgress,
    updateOnboardingProgress,
    trialActive: profile?.trial_ativo || subscription.trialAtivo || false,
    planoAtivo: profile?.plano_ativo || subscription.planoAtivo || false,
    billingInfo,
    invoices,
    subscription,
    updateBillingInfo,
    simulateActivatePlan,
    simulateCancelSubscription,
    simulateStartTrial,
    addInvoice,
    formatBRL,
    addNegocio,
    updateNegocio,
    removeNegocio,
    setNegocioStatus,
    addAcademia,
    updateAcademia,
    removeAcademia,
    setAcademiaStatus,
    addAgendamentoDemo,
    removeAgendamentoDemo,
    createChatbot,
    updateChatbotMessages,
    toggleChatbotStatus,
    deleteChatbot,
    // Integrations
    simulateConnectWhatsApp,
    simulateDisconnectWhatsApp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
