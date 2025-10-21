import { z } from 'zod';

// ============= Auth Schemas =============
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email é obrigatório" })
    .email({ message: "Email inválido" })
    .max(255, { message: "Email muito longo" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" })
    .max(100, { message: "Senha muito longa" })
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome é obrigatório" })
    .max(100, { message: "Nome muito longo" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email é obrigatório" })
    .email({ message: "Email inválido" })
    .max(255, { message: "Email muito longo" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" })
    .max(100, { message: "Senha muito longa" }),
  confirmPassword: z
    .string()
    .min(1, { message: "Confirmação de senha é obrigatória" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// ============= Business Schemas =============
export const negocioSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: "Nome é obrigatório" })
    .max(100, { message: "Nome muito longo" }),
  unidade: z
    .string()
    .trim()
    .max(100, { message: "Unidade muito longa" })
    .optional(),
  tipoNegocio: z
    .string()
    .min(1, { message: "Tipo de negócio é obrigatório" }),
  segmento: z
    .string()
    .trim()
    .min(1, { message: "Segmento é obrigatório" })
    .max(100, { message: "Segmento muito longo" }),
  endereco: z
    .string()
    .trim()
    .max(300, { message: "Endereço muito longo" })
    .optional(),
  telefone: z
    .string()
    .trim()
    .max(20, { message: "Telefone muito longo" })
    .optional(),
  whatsapp: z
    .string()
    .trim()
    .max(20, { message: "WhatsApp muito longo" })
    .optional(),
  horario_funcionamento: z
    .string()
    .trim()
    .max(500, { message: "Horário muito longo" })
    .optional(),
  servicos_oferecidos: z
    .array(z.string())
    .optional(),
  promocoes: z
    .string()
    .trim()
    .max(1000, { message: "Promoções muito longas" })
    .optional(),
  diferenciais: z
    .string()
    .trim()
    .max(1000, { message: "Diferenciais muito longos" })
    .optional(),
  valores: z.any().optional()
});

export const leadSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: "Nome é obrigatório" })
    .max(100, { message: "Nome muito longo" }),
  telefone: z
    .string()
    .trim()
    .max(20, { message: "Telefone muito longo" })
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email muito longo" })
    .optional()
    .or(z.literal('')),
  negocio_id: z
    .string()
    .uuid({ message: "Negócio inválido" }),
  origem: z
    .string()
    .min(1, { message: "Origem é obrigatória" }),
  status: z
    .string()
    .min(1, { message: "Status é obrigatório" }),
  pipeline_stage: z
    .string()
    .min(1, { message: "Etapa do pipeline é obrigatória" }),
  observacoes: z
    .string()
    .trim()
    .max(1000, { message: "Observações muito longas" })
    .optional()
    .or(z.literal('')),
  valor_estimado: z
    .string()
    .optional()
    .or(z.literal(''))
});

export const chatbotSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: "Nome é obrigatório" })
    .max(100, { message: "Nome muito longo" }),
  negocio_id: z
    .string()
    .uuid({ message: "Negócio inválido" }),
  template: z
    .string()
    .min(1, { message: "Template é obrigatório" }),
  personalidade: z
    .string()
    .trim()
    .max(500, { message: "Personalidade muito longa" })
    .optional(),
  instrucoes: z
    .string()
    .trim()
    .max(2000, { message: "Instruções muito longas" })
    .optional()
});

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type NegocioFormData = z.infer<typeof negocioSchema>;
export type LeadFormData = z.infer<typeof leadSchema>;
export type ChatbotFormData = z.infer<typeof chatbotSchema>;
