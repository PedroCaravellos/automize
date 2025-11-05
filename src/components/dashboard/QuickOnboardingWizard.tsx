import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, CheckCircle2, Building2, Tag, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SEGMENTOS = [
  { value: "academia", label: "🏋️ Academia / Fitness", description: "Treinos, avaliações e planos" },
  { value: "salao", label: "✨ Salão de Beleza", description: "Cortes, coloração e estética" },
  { value: "clinica", label: "🏥 Clínica Médica/Odontológica", description: "Consultas e exames" },
  { value: "restaurante", label: "🍽️ Restaurante / Food", description: "Reservas e delivery" },
  { value: "consultoria", label: "💼 Consultoria / Serviços", description: "Consultoria empresarial" },
  { value: "ecommerce", label: "🛍️ E-commerce / Loja", description: "Vendas online" },
  { value: "default", label: "🏢 Outro Segmento", description: "Configuração genérica" },
];

export default function QuickOnboardingWizard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "loading" | "success">("form");
  const [empresaNome, setEmpresaNome] = useState("");
  const [segmento, setSegmento] = useState("");
  const [numeroWhatsApp, setNumeroWhatsApp] = useState("");

  const handleSkip = () => {
    // Permite acesso ao dashboard sem criar negócio
    localStorage.setItem('onboarding-skipped', 'true');
    window.location.href = "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresaNome || !segmento || !numeroWhatsApp) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setStep("loading");

    try {
      console.log("🚀 Iniciando auto-setup...");

      const { data, error } = await supabase.functions.invoke("auto-setup", {
        body: {
          userId: user?.id,
          empresaNome,
          segmento,
          numeroWhatsApp,
        },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "Erro ao criar setup automático");
      }

      console.log("✅ Setup concluído:", data);

      setStep("success");

      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload(); // Força reload para atualizar dados
      }, 3000);

    } catch (error) {
      console.error("❌ Erro no setup:", error);
      setStep("form");
      toast({
        title: "Erro ao configurar",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    }
  };

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Criando seu ambiente...</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Configurando negócio
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando chatbot inteligente
                  </p>
                  <p className="flex items-center justify-center gap-2 opacity-50">
                    Preparando funil de vendas
                  </p>
                  <p className="flex items-center justify-center gap-2 opacity-50">
                    Adicionando leads de exemplo
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-green-500/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Tudo Pronto! 🎉</h3>
                <p className="text-muted-foreground">
                  Seu negócio foi configurado com sucesso
                </p>
              </div>
              <div className="w-full pt-4 space-y-2 text-sm text-left bg-muted/50 rounded-lg p-4">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Negócio criado e configurado
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Chatbot inteligente pronto
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Funil de vendas configurado
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Leads de exemplo adicionados
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecionando para o dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Setup Automático em 1 Minuto</CardTitle>
              <CardDescription className="text-base">
                Responda 3 perguntas e deixe o resto com a gente
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Empresa */}
            <div className="space-y-2">
              <Label htmlFor="empresa" className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Nome da Empresa
              </Label>
              <Input
                id="empresa"
                placeholder="Ex: Studio Fit, Salão Elegância, Clínica Vida..."
                value={empresaNome}
                onChange={(e) => setEmpresaNome(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>

            {/* Segmento */}
            <div className="space-y-2">
              <Label htmlFor="segmento" className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Segmento do Negócio
              </Label>
              <Select value={segmento} onValueChange={setSegmento} required>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o segmento..." />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENTOS.map((seg) => (
                    <SelectItem key={seg.value} value={seg.value} className="py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{seg.label}</span>
                        <span className="text-xs text-muted-foreground">{seg.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {segmento && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Criaremos um chatbot otimizado para {SEGMENTOS.find(s => s.value === segmento)?.label.split(" ")[1]}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4" />
                Número do WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(11) 99999-9999"
                value={numeroWhatsApp}
                onChange={(e) => setNumeroWhatsApp(e.target.value)}
                className="h-12 text-base"
                required
              />
              <p className="text-xs text-muted-foreground">
                Usaremos este número para configurar as integrações do WhatsApp
              </p>
            </div>

            {/* Preview do que será criado */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                O que vamos criar automaticamente:
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground pl-6">
                <li>✓ Negócio pré-configurado com suas informações</li>
                <li>✓ Chatbot inteligente personalizado para seu segmento</li>
                <li>✓ Funil de vendas com estágios padrão</li>
                <li>✓ 2-3 leads de exemplo para você testar</li>
                <li>✓ Automação de boas-vindas ativa</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <Button type="submit" size="lg" className="w-full h-12 text-base">
                <Sparkles className="mr-2 h-5 w-5" />
                Criar Meu Negócio Automaticamente
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={handleSkip}
              >
                Pular por agora e explorar o dashboard
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              ⏱️ Leva apenas 10 segundos • Você pode editar tudo depois
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
