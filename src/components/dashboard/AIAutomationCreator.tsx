import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AIAutomationCreatorProps {
  negocioInfo?: any;
  generatedAutomation?: any;
  onAutomationGenerated: (automation: any) => void;
  onReset: () => void;
  onCancel: () => void;
}

export default function AIAutomationCreator({ 
  negocioInfo,
  generatedAutomation,
  onAutomationGenerated,
  onReset,
  onCancel 
}: AIAutomationCreatorProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const examplePrompts = [
    "Quando entrar um novo lead, mandar boas-vindas imediatamente, depois de 1 hora enviar informações sobre nossos planos, se não responder em 24h mandar mensagem de follow-up final",
    "Ao agendar uma consulta, enviar confirmação, 1 dia antes enviar lembrete, 1 hora antes enviar último aviso",
    "Novo lead: enviar boas-vindas, aguardar 30 minutos, se respondeu enviar catálogo de produtos, se não respondeu aguardar 2 horas e enviar mensagem motivacional",
  ];

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Descrição vazia",
        description: "Por favor, descreva como você quer sua automação.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-automation", {
        body: { 
          description, 
          negocioInfo 
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Limite de requisições") || data.error.includes("429")) {
          toast({
            title: "Limite excedido",
            description: "Muitas requisições. Aguarde alguns minutos e tente novamente.",
            variant: "destructive",
          });
        } else if (data.error.includes("Créditos") || data.error.includes("402")) {
          toast({
            title: "Sem créditos",
            description: "Adicione créditos em Settings > Workspace > Usage.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      onAutomationGenerated(data.automation);
      toast({
        title: "Automação gerada!",
        description: "Revise e edite se necessário, depois salve.",
      });
    } catch (error) {
      console.error("Erro ao gerar automação:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar a automação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (generatedAutomation) {
      onAutomationGenerated(generatedAutomation);
    }
  };

  return (
    <div className="space-y-6">
      {!generatedAutomation ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Crie sua Automação com IA
              </CardTitle>
              <CardDescription>
                Descreva em linguagem natural como você quer que sua automação funcione. 
                A IA irá estruturar tudo automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Descreva sua automação
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Quando entrar um novo lead, mandar boas-vindas, depois de 1h enviar outra mensagem, se não responder em 24h mandar mensagem final"
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Exemplos para se inspirar:</p>
                <div className="space-y-2">
                  {examplePrompts.map((prompt, index) => (
                    <Alert key={index} className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setDescription(prompt)}>
                      <AlertDescription className="text-xs">
                        {prompt}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerate} disabled={loading || !description.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Automação
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {negocioInfo && (
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Negócio selecionado:</strong> {negocioInfo.nome}
                {negocioInfo.unidade && ` - ${negocioInfo.unidade}`}
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Automação Gerada com Sucesso!
            </CardTitle>
            <CardDescription>
              Revise os detalhes abaixo. Você poderá editar o fluxo visual depois de salvar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Nome</label>
              <p className="text-sm text-muted-foreground mt-1">{generatedAutomation.nome}</p>
            </div>

            <div>
              <label className="text-sm font-semibold">Descrição</label>
              <p className="text-sm text-muted-foreground mt-1">{generatedAutomation.descricao}</p>
            </div>

            <div>
              <label className="text-sm font-semibold">Gatilho</label>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {generatedAutomation.trigger_type.replace('_', ' ')}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold">Blocos ({generatedAutomation.blocos?.length || 0})</label>
              <div className="mt-2 space-y-2">
                {generatedAutomation.blocos?.map((bloco: any, index: number) => (
                  <div key={bloco.id} className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
                    <span className="text-xs font-mono bg-primary text-primary-foreground px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{bloco.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">Tipo: {bloco.tipo}</p>
                      {bloco.conteudo && (
                        <p className="text-xs mt-1 text-muted-foreground">{bloco.conteudo}</p>
                      )}
                      {bloco.tempo && (
                        <p className="text-xs mt-1 text-blue-600">
                          ⏱️ Aguardar: {bloco.tempo.valor} {bloco.tempo.unidade}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onReset}>
                Nova Automação
              </Button>
              <Button onClick={handleConfirm}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Continuar para Editar Fluxo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}