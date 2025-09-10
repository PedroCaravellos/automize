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
import { Bot, User, RotateCcw, Send, X } from "lucide-react";
import { Chatbot } from "./ChatbotsSection";
import { Academia } from "./AcademiasSection";
import { useAuth } from "@/contexts/AuthContext";

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
  const { addActivity } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationEnded, setConversationEnded] = useState(false);
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

  const handleSendMessage = () => {
    if (!inputValue.trim() || !chatbot || conversationEnded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Check for end command
    if (inputValue.toLowerCase().includes("encerrar")) {
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
      setInputValue("");
      return;
    }

    // Find FAQ match
    const faqMatch = findBestFaqMatch(inputValue);
    
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
    }, 800);

    setInputValue("");
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

  // Initialize conversation when drawer opens
  useEffect(() => {
    if (open && chatbot && academia) {
      initializeConversation();
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
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
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
                disabled={!inputValue.trim() || conversationEnded}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t py-2">
          <p className="text-xs text-muted-foreground text-center">
            Simulação local — sem WhatsApp
          </p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ChatbotSimulator;