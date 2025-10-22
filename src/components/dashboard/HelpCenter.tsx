import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export const HelpCenter = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "Como criar um novo chatbot?",
    "Como adicionar horários de atendimento?",
    "Como criar uma automação?",
    "Como conectar o WhatsApp?",
    "Como gerenciar leads?"
  ];

  const handleAsk = async (q?: string) => {
    const questionToAsk = q || question;
    if (!questionToAsk.trim()) return;

    setIsLoading(true);
    setAnswer('');
    
    try {
      const { data, error } = await supabase.functions.invoke('help-ai', {
        body: { question: questionToAsk }
      });

      if (error) throw error;

      setAnswer(data.answer);
      if (q) setQuestion(q);
    } catch (error: any) {
      console.error('Error getting help:', error);
      toast.error('Erro ao buscar ajuda. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Central de Ajuda Inteligente</DialogTitle>
          <DialogDescription>
            Digite sua dúvida e nossa IA responderá com um tutorial específico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Como adicionar horário de atendimento?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleAsk()} 
              disabled={isLoading || !question.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {!answer && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Perguntas frequentes:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAsk(q)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {answer && (
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{answer}</div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
