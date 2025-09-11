import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, RotateCcw, Send, X, ExternalLink, Brain, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Chatbot } from "./ChatbotsSection";
import { Academia } from "./AcademiasSection";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as LZString from "lz-string";
import SimulatorShareModal from "./SimulatorShareModal";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatbotSimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot: Chatbot | null;
  academia: Academia | null;
}

const ChatbotSimulator = ({ open, onOpenChange, chatbot, academia }: ChatbotSimulatorProps) => {
  const { addActivity, updateOnboardingProgress, addAgendamentoDemo } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationEnded, setConversationEnded] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const replaceVariables = (text: string): string => {
    if (!chatbot || !academia) return text;
    
    const today = new Date().toLocaleDateString('pt-BR');
    
    return text
      .replace(/\{\{NOME_ACADEMIA\}\}/g, academia.nome)
      .replace(/\{\{NOME_BOT\}\}/g, chatbot.nome)
      .replace(/\{\{HOJE\}\}/g, today);
  };

  const initializeConversation = () => {
    if (!chatbot) return;
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: replaceVariables(chatbot.mensagens.boasVindas),
      sender: "bot",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    setConversationEnded(false);
    setInputValue("");
  };

  const findBestFaqMatch = (userMessage: string) => {
    if (!chatbot?.mensagens.faqs) return null;

    const userWords = userMessage.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    let bestMatch = null;
    let maxMatches = 0;

    for (const faq of chatbot.mensagens.faqs) {
      const faqWords = faq.pergunta.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const matches = userWords.filter(word => 
        faqWords.some(faqWord => faqWord.includes(word) || word.includes(faqWord))
      ).length;

      if (matches > maxMatches && matches > 0) {
        maxMatches = matches;
        bestMatch = faq;
      }
    }

    return bestMatch;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatbot || conversationEnded || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue("");

    // Check for end command
    if (currentInput.toLowerCase().includes("encerrar")) {
      setTimeout(() => {
        const endMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: replaceVariables(chatbot.mensagens.encerramento),
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, endMessage]);
        setConversationEnded(true);
      }, 1000);
      return;
    }

    setIsTyping(true);

    try {
      if (useAI) {
        console.log('Sending to chatbot-ai:', { 
          message: currentInput, 
          academia: academia?.nome, 
          chatbot: chatbot?.nome,
          faqCount: chatbot?.mensagens?.faqs?.length 
        });
        
        // Use AI-powered response
        const conversationHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        }));

        const { data, error } = await supabase.functions.invoke('chatbot-ai', {
          body: {
            message: currentInput,
            academia: {
              id: academia?.id,
              nome: academia?.nome || '',
              unidade: academia?.unidade || '',
              segmento: academia?.segmento || 'Academia',
              endereco: academia?.endereco || '',
              telefone: academia?.telefone || '',
              whatsapp: academia?.whatsapp || '',
              horarios: academia?.horarios || '',
              modalidades: academia?.modalidades || '',
              valores: academia?.valores || '',
              promocoes: academia?.promocoes || '',
              diferenciais: academia?.diferenciais || ''
            },
            chatbot: {
              mensagemBoasVindas: chatbot.mensagens.boasVindas,
              perguntasFrequentes: chatbot.mensagens.faqs,
              mensagemEncerramento: chatbot.mensagens.encerramento
            },
            conversationHistory
          }
        });

        if (error) {
          console.error('Supabase function invoke error:', error);
          throw new Error(error.message);
        }

        console.log('Chatbot AI response:', data);

        const botResponse = data.response || "Desculpe, não consegui processar sua solicitação.";
        const isFallback = data.fallback || false;
        
        // Check if there's a demo appointment to save
        if (data.agendamento_demo) {
          try {
            addAgendamentoDemo(data.agendamento_demo);
            toast({
              title: "Agendamento de demo criado!",
              description: "O agendamento aparecerá na seção de agendamentos.",
            });
          } catch (error) {
            console.error('Erro ao salvar agendamento demo:', error);
          }
        }
        
        setTimeout(() => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            sender: "bot",
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
          
          // Show fallback notice if using fallback but keep AI active
          if (isFallback) {
            toast({
              description: "Usando resposta de backup. A IA permanece ativa para próximas mensagens.",
              variant: "default"
            });
          }
        }, 500);

      } else {
        // Use traditional FAQ matching
        const faqMatch = findBestFaqMatch(currentInput);
        
        setTimeout(() => {
          let botResponse = "";
          
          if (faqMatch) {
            botResponse = replaceVariables(faqMatch.resposta);
          } else {
            const faqTitles = chatbot.mensagens.faqs.map(faq => faq.pergunta).join(", ");
            botResponse = `Não entendi perfeitamente. Você pode reformular ou escolher uma das opções: ${faqTitles}.`;
          }

          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            sender: "bot",
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 800);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Try FAQ fallback instead of disabling AI
      const faqMatch = findBestFaqMatch(currentInput);
      
      setTimeout(() => {
        const fallbackResponse = faqMatch 
          ? replaceVariables(faqMatch.resposta)
          : "Desculpe, estou enfrentando dificuldades técnicas temporárias. A IA continua ativa para as próximas mensagens.";
          
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fallbackResponse,
          sender: "bot",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        
        // Keep AI active, just show a toast
        toast({
          description: "Erro temporário. Usando resposta de backup. A IA permanece ativa.",
          variant: "default"
        });
      }, 500);
    }
  };

  const handleEndConversation = () => {
    if (!chatbot || conversationEnded) return;

    const endMessage: Message = {
      id: Date.now().toString(),
      text: replaceVariables(chatbot.mensagens.encerramento),
      sender: "bot",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, endMessage]);
    setConversationEnded(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateDemoLink = (): string => {
    if (!chatbot || !academia) return "";

    // Limit FAQs to 5 items max
    const limitedFaqs = chatbot.mensagens.faqs.slice(0, 5);
    
    const demoData = {
      botName: chatbot.nome,
      academyName: `${academia.nome} - ${academia.unidade}`,
      template: chatbot.template,
      mensagens: {
        boasVindas: chatbot.mensagens.boasVindas,
        faqs: limitedFaqs,
        encerramento: chatbot.mensagens.encerramento
      },
      ts: Date.now()
    };

    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(demoData));
    return `${window.location.origin}/demo?d=${compressed}`;
  };

  const handleShareDemo = () => {
    if (!chatbot || !academia) return;
    
    // Check if FAQs exceed limit
    if (chatbot.mensagens.faqs.length > 5) {
      toast({
        description: "Apenas as primeiras 5 FAQs serão incluídas no link de demonstração.",
        variant: "default"
      });
    }
    
    setShareModalOpen(true);
  };

  // Initialize conversation when drawer opens
  useEffect(() => {
    if (open && chatbot && academia) {
      initializeConversation();
      updateOnboardingProgress({ simulatorOpened: true });
      // Add activity log
      addActivity(`Teste de chatbot iniciado — ${chatbot.nome} (${academia.nome}) — ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
    }
  }, [open, chatbot, academia]);

  if (!chatbot || !academia) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] h-[80vh]">
        <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {chatbot.nome}
              </DrawerTitle>
              <DrawerDescription>
                {academia.nome} - {academia.unidade} • {chatbot.status === "Ativo" ? (
                  <Badge variant="default" className="bg-green-500 text-white ml-2">Ativo</Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2">Em configuração</Badge>
                )}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={useAI ? "default" : "outline"}
                size="sm"
                onClick={() => setUseAI(!useAI)}
                className={useAI ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
              >
                {useAI ? <Brain className="h-4 w-4 mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                {useAI ? "IA Ativa" : "FAQ Básico"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareDemo}
                className="text-purple-600 hover:text-purple-600"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Compartilhar demo
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {message.sender === "user" ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[80%]">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-muted text-foreground">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={initializeConversation}
                disabled={!messages.length}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar conversa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndConversation}
                disabled={conversationEnded}
              >
                Encerrar conversa
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={conversationEnded ? "Conversa encerrada" : "Digite sua mensagem..."}
                disabled={conversationEnded}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || conversationEnded || isTyping}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t py-2">
          <p className="text-xs text-muted-foreground text-center">
            {useAI ? "🧠 IA Inteligente ativada" : "📋 Modo FAQ básico"} — Simulação local sem WhatsApp
          </p>
        </DrawerFooter>
      </DrawerContent>

      <SimulatorShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        onGenerateLink={generateDemoLink}
        chatbot={chatbot}
        academia={academia}
      />
    </Drawer>
  );
};

export default ChatbotSimulator;