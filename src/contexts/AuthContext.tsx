import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getUserData, saveUserData, generateId } from '@/utils/userStorage';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  plano_ativo: boolean;
  nome_plano: string | null;
  trial_ativo: boolean;
  trial_fim_em: string | null;
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
  segmento: 'Academia' | 'Estúdio' | 'Box';
  statusChatbot: 'Nenhum' | 'Em configuração' | 'Ativo';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  // Auth
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  activateTrial: () => Promise<void>;
  selectPlan: (planName: string) => Promise<void>;
  hasAccess: () => boolean;
  trialDaysRemaining: () => number;
  // Global app state
  academias: AcademiaItem[];
  chatbots: ChatbotItem[];
  activity: ActivityEvent[];
  addActivity: (text: string) => void;
  // Academias
  addAcademia: (data: Omit<AcademiaItem, 'id' | 'createdAt' | 'statusChatbot'>) => AcademiaItem;
  updateAcademia: (id: string, updates: Partial<Omit<AcademiaItem, 'id' | 'createdAt'>>) => void;
  removeAcademia: (id: string) => void;
  setAcademiaStatus: (id: string, status: AcademiaItem['statusChatbot']) => void;
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
  const [academias, setAcademias] = useState<AcademiaItem[]>([]);
  const [chatbots, setChatbots] = useState<ChatbotItem[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const hydratedRef = useRef(false);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data && !error) {
      setProfile(data);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            // Hydrate user data from localStorage
            const data = getUserData(session.user.id);
            setAcademias(data.academias || []);
            setChatbots(data.chatbots || []);
            setActivity(data.activity || []);
            hydratedRef.current = true;
          }, 0);
        } else {
          setProfile(null);
          setAcademias([]);
          setChatbots([]);
          setActivity([]);
          hydratedRef.current = false;
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        const data = getUserData(session.user.id);
        setAcademias(data.academias || []);
        setChatbots(data.chatbots || []);
        setActivity(data.activity || []);
        hydratedRef.current = true;
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    setActivity([]);
    hydratedRef.current = false;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);
      
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
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
    if (!profile) return false;
    if (profile.plano_ativo) return true;
    if (profile.trial_ativo && profile.trial_fim_em) {
      return new Date() < new Date(profile.trial_fim_em);
    }
    return false;
  };

  const trialDaysRemaining = () => {
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
    saveUserData(user.id, { academias, chatbots, activity });
  }, [user?.id, academias, chatbots, activity]);

  // Activity helper
  const addActivity = (text: string) => {
    setActivity(prev => [{ id: generateId('act'), ts: new Date().toISOString(), text }, ...prev].slice(0, 20));
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
    signUp,
    signIn,
    signOut,
    updateProfile,
    activateTrial,
    selectPlan,
    hasAccess,
    trialDaysRemaining,
    academias,
    chatbots,
    activity,
    addActivity,
    addAcademia,
    updateAcademia,
    removeAcademia,
    setAcademiaStatus,
    createChatbot,
    updateChatbotMessages,
    toggleChatbotStatus,
    deleteChatbot,
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