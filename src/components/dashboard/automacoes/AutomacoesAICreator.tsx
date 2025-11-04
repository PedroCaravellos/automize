import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface AutomacoesAICreatorProps {
  onGenerate: (description: string) => Promise<void>;
  isGenerating: boolean;
}

export function AutomacoesAICreator({ onGenerate, isGenerating }: AutomacoesAICreatorProps) {
  const [nlDescription, setNlDescription] = useState('');

  const handleGenerate = () => {
    onGenerate(nlDescription);
    setNlDescription('');
  };

  const suggestions = [
    "Enviar follow-up para leads inativos há 3 dias",
    "Lembrar cliente 1 dia antes do agendamento",
    "Agradecer após primeira compra"
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-semibold text-lg mb-1">Criar com IA</h3>
            <p className="text-sm text-muted-foreground">
              Descreva o que você quer automatizar e a IA cria para você
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Enviar boas-vindas para novos leads..."
            value={nlDescription}
            onChange={(e) => setNlDescription(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={isGenerating}
            className="flex-1"
          />
          <Button 
            onClick={handleGenerate}
            disabled={!nlDescription.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Criar
              </>
            )}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setNlDescription(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
