import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, RotateCcw, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface DemoData {
  botName: string;
  academyName: string;
  template: 'faq' | 'agendamento' | 'cobranca';
  mensagens: {
    boasVindas: string;
    faqs: Array<{ pergunta: string; resposta: string }>;
    encerramento: string;
  };
  ts: number;
}

interface PublicChatbotSimulatorProps {
  demoData: DemoData;
}

const PublicChatbotSimulator = ({ demoData }: PublicChatbotSimulatorProps) => {
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
    const today = new Date().toLocaleDateString('pt-BR');
    
    return text
      .replace(/\{\{NOME_ACADEMIA\}\}/g, demoData.academyName)
      .replace(/\{\{NOME_BOT\}\}/g, demoData.botName)
      .replace(/\{\{HOJE\}\}/g, today);
  };

  const initializeConversation = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: replaceVariables(demoData.mensagens.boasVindas),
      sender: "bot",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    setConversationEnded(false);
    setInputValue("");
  };

  const findBestFaqMatch = (userMessage: string) => {
    const userWords = userMessage.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    let bestMatch = null;
    let maxMatches = 0;

    for (const faq of demoData.mensagens.faqs) {
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
    if (!inputValue.trim() || conversationEnded) return;

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
          text: replaceVariables(demoData.mensagens.encerramento),
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
        const faqTitles = demoData.mensagens.faqs.map(faq => faq.pergunta).join(", ");
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Initialize conversation on component mount
  useEffect(() => {
    initializeConversation();
  }, [demoData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FAQ Reference Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Perguntas Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoData.mensagens.faqs.map((faq, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted">
                  <p className="font-medium text-sm">{faq.pergunta}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Digite qualquer uma dessas perguntas ou palavras relacionadas para testar o chatbot.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Simulator */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {demoData.botName} - Demonstração
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
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
          </CardContent>
        </Card>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          Simulação local — sem WhatsApp
        </p>
      </div>
    </div>
  );
};

export default PublicChatbotSimulator;