// Compatibility types for legacy components that import Academia
export interface Academia {
  id: string;
  nome: string;
  unidade: string;
  segmento: string;
  statusChatbot: 'Nenhum' | 'Em configuração' | 'Ativo';
  endereco?: string;
  telefone?: string;
  whatsapp?: string;
  horarios?: string;
  modalidades?: string;
  valores?: string;
  promocoes?: string;
  diferenciais?: string;
}

// Stub default export to satisfy potential imports; not used as a component here.
export default function AcademiasSection() {
  return null;
}
