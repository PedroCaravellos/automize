/**
 * Paleta Semântica Unificada
 * Centraliza uso de cores por contexto semântico
 */
export const semanticColors = {
  // Status
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
  
  // Types
  chatbot: "bg-primary/10 text-primary border-primary/20",
  lead: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  agendamento: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  venda: "bg-green-500/10 text-green-500 border-green-500/20",
  
  // Trends
  trendUp: "text-green-600",
  trendDown: "text-red-600",
  trendNeutral: "text-muted-foreground",
} as const;
