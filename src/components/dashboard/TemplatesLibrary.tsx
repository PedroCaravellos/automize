import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, MessageSquare, Workflow, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'chatbot' | 'automation' | 'funnel';
  icon: React.ReactNode;
  data: any;
}

const TEMPLATES: Template[] = [
  {
    id: 'chatbot-academia',
    name: 'Chatbot para Academia',
    description: 'Fluxo completo para agendar aula experimental e coletar leads',
    category: 'chatbot',
    icon: <MessageSquare className="h-6 w-6" />,
    data: {
      nome: 'Chatbot Academia',
      descricao: 'Atendimento automatizado para academias',
      prompt_sistema: 'Você é um assistente virtual de uma academia. Seja animado e motivador! Ajude os interessados a agendar aulas experimentais e tire dúvidas sobre planos e modalidades.',
      primeira_mensagem: 'Olá! 💪 Bem-vindo à nossa academia!\n\nComo posso ajudar você hoje?\n1️⃣ Agendar aula experimental gratuita\n2️⃣ Ver modalidades e horários\n3️⃣ Conhecer nossos planos\n4️⃣ Falar com um atendente',
      palavras_chave: ['treino', 'musculação', 'aula', 'experimental', 'plano', 'matricula', 'horário']
    }
  },
  {
    id: 'chatbot-salao',
    name: 'Chatbot para Salão de Beleza',
    description: 'Agendamento de serviços e sugestão de pacotes',
    category: 'chatbot',
    icon: <MessageSquare className="h-6 w-6" />,
    data: {
      nome: 'Chatbot Salão',
      descricao: 'Atendimento automatizado para salões de beleza',
      prompt_sistema: 'Você é um assistente virtual de um salão de beleza. Seja elegante e atencioso! Ajude os clientes a agendar serviços, sugira pacotes e tire dúvidas.',
      primeira_mensagem: 'Olá! ✨ Seja bem-vinda ao nosso salão!\n\nQue serviço você gostaria de agendar?\n💇 Corte e escova\n💅 Manicure e pedicure\n🎨 Coloração\n💆 Tratamentos\n\nOu digite sua preferência!',
      palavras_chave: ['corte', 'escova', 'coloração', 'manicure', 'pedicure', 'tratamento', 'pacote']
    }
  },
  {
    id: 'chatbot-clinica',
    name: 'Chatbot para Clínica Médica',
    description: 'Coleta de sintomas e agendamento de consultas com compliance LGPD',
    category: 'chatbot',
    icon: <MessageSquare className="h-6 w-6" />,
    data: {
      nome: 'Chatbot Clínica',
      descricao: 'Atendimento automatizado para clínicas médicas',
      prompt_sistema: 'Você é um assistente virtual de uma clínica médica. Seja profissional, empático e cuidadoso com informações de saúde. IMPORTANTE: Sempre informe sobre a LGPD e peça consentimento para armazenar dados pessoais.',
      primeira_mensagem: 'Olá! 🏥 Bem-vindo à nossa clínica.\n\nPara continuar, preciso do seu consentimento para coletar e armazenar seus dados conforme a LGPD. Seus dados serão usados apenas para atendimento médico.\n\nVocê concorda? (Sim/Não)\n\nApós isso, poderei ajudar você com:\n📅 Agendar consulta\n📋 Informar sintomas\n📞 Falar com atendente',
      palavras_chave: ['consulta', 'médico', 'sintomas', 'exame', 'agendamento', 'retorno']
    }
  },
  {
    id: 'automation-followup',
    name: 'Automação Follow-up',
    description: 'Sequência automática de follow-up para leads sem resposta',
    category: 'automation',
    icon: <Workflow className="h-6 w-6" />,
    data: {
      nome: 'Follow-up Automático',
      descricao: 'Sequência de mensagens para engajar leads',
      trigger_type: 'manual',
      blocks: [
        {
          type: 'delay',
          config: { hours: 24 }
        },
        {
          type: 'whatsapp',
          config: {
            message: 'Oi! Notei que você demonstrou interesse. Ainda tem alguma dúvida que eu possa ajudar?'
          }
        },
        {
          type: 'delay',
          config: { hours: 48 }
        },
        {
          type: 'whatsapp',
          config: {
            message: 'Última chance! Temos uma oferta especial que pode te interessar. Quer saber mais?'
          }
        }
      ]
    }
  },
  {
    id: 'automation-lembrete',
    name: 'Automação Lembrete de Agendamento',
    description: 'Envia lembrete 24h antes de compromissos agendados',
    category: 'automation',
    icon: <Workflow className="h-6 w-6" />,
    data: {
      nome: 'Lembrete de Agendamento',
      descricao: 'Lembra o cliente 24h antes do compromisso',
      trigger_type: 'agendamento_criado',
      blocks: [
        {
          type: 'delay',
          config: { hours: 24, before_event: true }
        },
        {
          type: 'whatsapp',
          config: {
            message: '🔔 Lembrete!\n\nVocê tem um compromisso agendado para amanhã às {{hora}}.\n\nNos vemos lá! 😊'
          }
        }
      ]
    }
  }
];

export const TemplatesLibrary = () => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'chatbot' | 'automation' | 'funnel'>('chatbot');
  const [isCloning, setIsCloning] = useState(false);
  const navigate = useNavigate();

  const handleClone = async (template: Template) => {
    setIsCloning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (template.category === 'chatbot') {
        // Clone chatbot
        const { error } = await supabase
          .from('chatbots')
          .insert({
            user_id: user.id,
            ...template.data
          });

        if (error) throw error;
        toast.success('Chatbot clonado com sucesso!');
        navigate('/dashboard?tab=chatbots');
      } else if (template.category === 'automation') {
        // Clone automation
        const { error } = await supabase
          .from('automacoes')
          .insert({
            user_id: user.id,
            ...template.data,
            ativo: false // Start disabled
          });

        if (error) throw error;
        toast.success('Automação clonada com sucesso!');
        navigate('/dashboard?tab=automacoes');
      }

      setOpen(false);
    } catch (error: any) {
      console.error('Error cloning template:', error);
      toast.error('Erro ao clonar template');
    } finally {
      setIsCloning(false);
    }
  };

  const filteredTemplates = TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Templates Prontos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Biblioteca de Templates</DialogTitle>
          <DialogDescription>
            Clone templates prontos e personalize para seu negócio
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chatbot">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chatbots
            </TabsTrigger>
            <TabsTrigger value="automation">
              <Workflow className="h-4 w-4 mr-2" />
              Automações
            </TabsTrigger>
            <TabsTrigger value="funnel">
              <TrendingUp className="h-4 w-4 mr-2" />
              Funis (Em breve)
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {template.icon}
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      onClick={() => handleClone(template)}
                      disabled={isCloning}
                      size="sm"
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Clonar Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {selectedCategory === 'funnel' && (
              <div className="text-center py-12 text-muted-foreground">
                Templates de funil em desenvolvimento 🚧
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
