import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight,
  Building2,
  Phone,
  Briefcase
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Validação do formulário
const formSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, "Número inválido. Use formato: +5511987654321")
    .min(10, "Número muito curto")
    .max(20, "Número muito longo"),
  business_segment: z
    .string()
    .min(1, "Selecione o segmento do seu negócio"),
});

type FormData = z.infer<typeof formSchema>;

interface WhatsAppSetupRequestProps {
  onSuccess?: () => void;
}

const BUSINESS_SEGMENTS = [
  { value: "academia", label: "Academia / Fitness" },
  { value: "salao", label: "Salão de Beleza" },
  { value: "clinica", label: "Clínica / Consultório" },
  { value: "restaurante", label: "Restaurante / Bar" },
  { value: "ecommerce", label: "E-commerce / Loja" },
  { value: "servicos", label: "Serviços Gerais" },
  { value: "educacao", label: "Educação / Cursos" },
  { value: "imobiliaria", label: "Imobiliária" },
  { value: "advogacia", label: "Advocacia / Jurídico" },
  { value: "outros", label: "Outros" },
];

const SETUP_TIMELINE = [
  {
    step: 1,
    title: "Solicitação Recebida",
    description: "Analisamos seus dados",
    duration: "Imediato",
    icon: CheckCircle2,
  },
  {
    step: 2,
    title: "Configuração WhatsApp",
    description: "Ativamos sua conta Business API",
    duration: "1-2 dias úteis",
    icon: Clock,
  },
  {
    step: 3,
    title: "Tudo Pronto!",
    description: "Comece a automatizar vendas",
    duration: "Pronto para usar",
    icon: Sparkles,
  },
];

export const WhatsAppSetupRequest = ({ onSuccess }: WhatsAppSetupRequestProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingTicket, setExistingTicket] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      whatsapp_number: "",
      business_segment: "",
    },
  });

  useEffect(() => {
    fetchExistingTicket();
  }, []);

  const fetchExistingTicket = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("whatsapp_setup_tickets" as any)
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setExistingTicket(data);
        form.reset({
          company_name: (data as any).company_name,
          whatsapp_number: (data as any).whatsapp_number,
          business_segment: (data as any).business_segment,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar ticket:", error);
    }
  };

  const onSubmit = async (values: FormData) => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const ticketData = {
        user_id: session.user.id,
        company_name: values.company_name,
        whatsapp_number: values.whatsapp_number,
        business_segment: values.business_segment,
        status: "pending",
      };

      const { error } = await supabase
        .from("whatsapp_setup_tickets" as any)
        .insert(ticketData);

      if (error) throw error;

      toast({
        title: "🎉 Solicitação enviada com sucesso!",
        description: "Você receberá uma notificação quando seu WhatsApp estiver ativo.",
      });

      await fetchExistingTicket();
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!existingTicket) return null;

    const statusConfig = {
      pending: {
        label: "⏳ Aguardando Configuração",
        variant: "outline" as const,
        className: "border-orange-500 text-orange-600 bg-orange-50",
      },
      in_progress: {
        label: "🔧 Em Configuração",
        variant: "outline" as const,
        className: "border-blue-500 text-blue-600 bg-blue-50",
      },
      active: {
        label: "✅ Ativo",
        variant: "outline" as const,
        className: "border-green-500 text-green-600 bg-green-50",
      },
      needs_info: {
        label: "⚠️ Precisa de Atenção",
        variant: "outline" as const,
        className: "border-red-500 text-red-600 bg-red-50",
      },
    };

    const config = statusConfig[existingTicket.status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Se já tem ticket ativo, mostra status
  if (existingTicket && existingTicket.status !== "needs_info") {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-600">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">WhatsApp Business API</h3>
                <p className="text-sm text-muted-foreground">
                  Status da sua solicitação
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Empresa:</span>
                  <span className="text-sm text-muted-foreground">
                    {existingTicket.company_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">WhatsApp:</span>
                  <span className="text-sm text-muted-foreground">
                    {existingTicket.whatsapp_number}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Segmento:</span>
                  <span className="text-sm text-muted-foreground">
                    {BUSINESS_SEGMENTS.find(s => s.value === existingTicket.business_segment)?.label || existingTicket.business_segment}
                  </span>
                </div>
              </div>
            </div>

            {existingTicket.status === "pending" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ⏱️ <strong>Previsão:</strong> Seu WhatsApp estará ativo em 1-2 dias úteis. Você receberá uma notificação assim que estiver pronto!
                </p>
              </div>
            )}

            {existingTicket.status === "in_progress" && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-900">
                  🔧 <strong>Quase lá!</strong> Estamos finalizando a configuração do seu WhatsApp. Em breve você poderá começar a automatizar suas vendas!
                </p>
              </div>
            )}

            {existingTicket.status === "active" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  🎉 <strong>Parabéns!</strong> Seu WhatsApp está ativo e pronto para usar. Comece criando chatbots e automatizando seu atendimento!
                </p>
              </div>
            )}

            {existingTicket.admin_notes && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">📝 Observações:</p>
                <p className="text-sm text-muted-foreground">{existingTicket.admin_notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Timeline de Progresso */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6">Como funciona o processo</h3>
          <div className="space-y-4">
            {SETUP_TIMELINE.map((item, index) => {
              const Icon = item.icon;
              const isCompleted = 
                (existingTicket.status === "pending" && index === 0) ||
                (existingTicket.status === "in_progress" && index <= 1) ||
                (existingTicket.status === "active" && index <= 2);
              
              return (
                <div key={item.step} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{item.title}</h4>
                      <span className="text-xs text-muted-foreground">{item.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  {index < SETUP_TIMELINE.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // Formulário de solicitação
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-green-600">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Solicitar WhatsApp Business</h3>
            <p className="text-sm text-muted-foreground">
              Preencha os dados abaixo e deixe o resto com a gente
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Minha Academia Fitness" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Como sua empresa aparecerá no WhatsApp
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do WhatsApp</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+5511987654321" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Use o formato: +55 11 98765-4321 (com código do país)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_segment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Segmento do Negócio</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu segmento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUSINESS_SEGMENTS.map((segment) => (
                        <SelectItem key={segment.value} value={segment.value}>
                          {segment.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Isso nos ajuda a configurar seu WhatsApp da melhor forma
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Solicitar Ativação do WhatsApp"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            ⏱️ <strong>Tempo estimado:</strong> Seu WhatsApp estará ativo em 1-2 dias úteis. Você será notificado assim que tudo estiver pronto!
          </p>
        </div>
      </Card>

      {/* Preview Visual */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Assim que seu WhatsApp estiver ativo...</h3>
        <div className="grid gap-4">
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Chatbots Inteligentes</p>
              <p className="text-xs text-muted-foreground">
                Responda automaticamente seus clientes 24/7
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Automações de Vendas</p>
              <p className="text-xs text-muted-foreground">
                Envie ofertas e lembretes automaticamente
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">CRM Integrado</p>
              <p className="text-xs text-muted-foreground">
                Gerencie leads e clientes em um só lugar
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Como funciona</h3>
        <div className="space-y-4">
          {SETUP_TIMELINE.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.title}</h4>
                    <span className="text-xs text-muted-foreground">{item.duration}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
                {index < SETUP_TIMELINE.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
