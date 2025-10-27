import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AIAssistedNegocioCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const tiposNegocio = [
  { value: 'academia', label: 'Academia / Fitness' },
  { value: 'restaurante', label: 'Restaurante / Café' },
  { value: 'clinica', label: 'Clínica / Consultório' },
  { value: 'salao', label: 'Salão de Beleza' },
  { value: 'loja', label: 'Loja / Varejo' },
  { value: 'servicos', label: 'Prestação de Serviços' },
  { value: 'outros', label: 'Outros' },
];

const segmentosPorTipo: Record<string, string[]> = {
  academia: ['Musculação', 'CrossFit', 'Pilates', 'Yoga', 'Lutas', 'Natação'],
  restaurante: ['Comida Brasileira', 'Fast Food', 'Comida Japonesa', 'Pizzaria', 'Cafeteria'],
  clinica: ['Odontologia', 'Fisioterapia', 'Psicologia', 'Nutrição', 'Estética'],
  salao: ['Cabelo', 'Estética', 'Unhas', 'Barbearia'],
  loja: ['Roupas', 'Eletrônicos', 'Móveis', 'Alimentos'],
  servicos: ['Consultoria', 'Educação', 'Tecnologia', 'Limpeza'],
  outros: ['Geral'],
};

export default function AIAssistedNegocioCreator({ open, onOpenChange, onSuccess }: AIAssistedNegocioCreatorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'generating' | 'creating-chatbot' | 'done'>('input');
  const [nome, setNome] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('');
  const [segmento, setSegmento] = useState('');
  const [criarChatbot, setCriarChatbot] = useState(true);

  const resetForm = () => {
    setStep('input');
    setNome('');
    setTipoNegocio('');
    setSegmento('');
    setCriarChatbot(true);
  };

  const handleCreate = async () => {
    if (!nome.trim() || !tipoNegocio || !segmento) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, tipo e segmento do negócio.",
        variant: "destructive",
      });
      return;
    }

    try {
      setStep('generating');

      // 1. Gerar dados do negócio com IA
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-create-negocio', {
        body: { nome, tipoNegocio, segmento }
      });

      if (aiError) throw aiError;
      if (!aiData?.success) throw new Error(aiData?.error || 'Erro ao gerar dados');

      const negocioData = {
        nome,
        tipo_negocio: tipoNegocio,
        segmento,
        user_id: user?.id,
        ...aiData.data,
      };

      // 2. Criar negócio no banco
      const { data: negocio, error: negocioError } = await supabase
        .from('negocios')
        .insert([negocioData])
        .select()
        .single();

      if (negocioError) throw negocioError;

      toast({
        title: "✨ Negócio criado com IA!",
        description: "Dados preenchidos automaticamente pela inteligência artificial.",
      });

      // 3. Criar chatbot se solicitado
      if (criarChatbot && negocio) {
        setStep('creating-chatbot');

        const { data: chatbotAI, error: chatbotAIError } = await supabase.functions.invoke('ai-create-chatbot', {
          body: {
            nomeNegocio: nome,
            tipoNegocio,
            segmento,
            servicos: aiData.data.servicos_oferecidos,
            valores: aiData.data.valores,
          }
        });

        if (chatbotAIError) throw chatbotAIError;
        if (!chatbotAI?.success) throw new Error(chatbotAI?.error || 'Erro ao gerar chatbot');

        const chatbotData = {
          negocio_id: negocio.id,
          nome: chatbotAI.data.nome,
          personalidade: chatbotAI.data.personalidade,
          instrucoes: chatbotAI.data.instrucoes,
          status: 'Ativo',
          ativo: true,
        };

        const { error: chatbotError } = await supabase
          .from('chatbots')
          .insert([chatbotData]);

        if (chatbotError) throw chatbotError;

        toast({
          title: "🤖 Chatbot criado!",
          description: "Seu assistente virtual já está ativo e pronto para atender.",
        });
      }

      setStep('done');
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Erro ao criar negócio:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o negócio.",
        variant: "destructive",
      });
      setStep('input');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Criar Negócio com IA
          </DialogTitle>
          <DialogDescription>
            {step === 'input' && 'Preencha apenas 3 campos. A IA completa o resto!'}
            {step === 'generating' && 'Gerando dados do negócio com inteligência artificial...'}
            {step === 'creating-chatbot' && 'Criando seu chatbot personalizado...'}
            {step === 'done' && 'Tudo pronto! Redirecionando...'}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Negócio *</Label>
              <Input
                id="nome"
                placeholder="Ex: Academia FitMax"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Negócio *</Label>
              <Select value={tipoNegocio} onValueChange={(value) => {
                setTipoNegocio(value);
                setSegmento('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposNegocio.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tipoNegocio && (
              <div className="space-y-2">
                <Label htmlFor="segmento">Segmento *</Label>
                <Select value={segmento} onValueChange={setSegmento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    {segmentosPorTipo[tipoNegocio]?.map((seg) => (
                      <SelectItem key={seg} value={seg}>
                        {seg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="criar-chatbot"
                checked={criarChatbot}
                onChange={(e) => setCriarChatbot(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="criar-chatbot" className="font-normal cursor-pointer">
                Criar chatbot automaticamente (recomendado)
              </Label>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-primary">✨ A IA vai gerar:</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Serviços oferecidos</li>
                <li>• Horários de funcionamento</li>
                <li>• Tabela de preços e planos</li>
                <li>• Promoções e diferenciais</li>
                {criarChatbot && <li className="text-primary font-medium">• Chatbot pronto e ativo</li>}
              </ul>
            </div>
          </div>
        )}

        {(step === 'generating' || step === 'creating-chatbot' || step === 'done') && (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            {step === 'done' ? (
              <>
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-lg font-medium">Tudo pronto! 🎉</p>
              </>
            ) : (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  {step === 'generating' && 'Analisando e gerando dados perfeitos para seu negócio...'}
                  {step === 'creating-chatbot' && 'Criando personalidade e instruções do chatbot...'}
                </p>
              </>
            )}
          </div>
        )}

        {step === 'input' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!nome.trim() || !tipoNegocio || !segmento}>
              <Sparkles className="h-4 w-4 mr-2" />
              Criar com IA
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
