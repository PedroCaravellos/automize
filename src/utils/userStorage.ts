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

export interface UserStoredData {
  academias: StoredAcademia[];
  chatbots: StoredChatbot[];
  activity: ActivityEvent[];
}

const keyFor = (userId: string) => `automiza:user:${userId}`;

export function getUserData(userId: string): UserStoredData {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return { academias: [], chatbots: [], activity: [] };
    const parsed = JSON.parse(raw);
    return {
      academias: Array.isArray(parsed.academias) ? parsed.academias : [],
      chatbots: Array.isArray(parsed.chatbots) ? parsed.chatbots : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
    };
  } catch (e) {
    console.warn("Failed to parse user data from storage", e);
    return { academias: [], chatbots: [], activity: [] };
  }
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

