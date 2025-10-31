import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, RotateCcw, Send, Brain, MessageSquare, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  isMobilePreview?: boolean;
}

const PublicChatbotSimulator = ({ demoData, isMobilePreview = false }: PublicChatbotSimulatorProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationEnded, setConversationEnded] = useState(false);
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || conversationEnded || isTyping) return;

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
          text: replaceVariables(demoData.mensagens.encerramento),
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
        // Use AI-powered response
        const conversationHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        }));

        const { data, error } = await supabase.functions.invoke('chatbot-ai', {
          body: {
            message: currentInput,
            academia: {
              nome: demoData.academyName,
              unidade: '',
              segmento: 'Academia'
            },
            chatbot: {
              mensagemBoasVindas: demoData.mensagens.boasVindas,
              perguntasFrequentes: demoData.mensagens.faqs,
              mensagemEncerramento: demoData.mensagens.encerramento
            },
            conversationHistory
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        const botResponse = data.response || "Desculpe, não consegui processar sua solicitação.";
        
        setTimeout(() => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            sender: "bot",
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);

      } else {
        // Use traditional FAQ matching
        const faqMatch = findBestFaqMatch(currentInput);
        
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
          setIsTyping(false);
        }, 800);
      }
    } catch (error) {
      // Try FAQ fallback
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
        
        // Keep AI active
      }, 500);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mobile WhatsApp Preview
  if (isMobilePreview) {
    return (
      <div className="flex flex-col h-full">
        {/* Chat Messages - Fixed height with internal scroll */}
        <div className="flex-1 overflow-hidden relative" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%230b141a\'/%3E%3Cpath d=\'M20 10h60v2H20zm0 20h45v2H20zm0 20h55v2H20zm0 20h40v2H20z\' fill=\'%23ffffff\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        }}>
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="h-8 w-8 mt-1 shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${demoData.botName}`} />
                        <AvatarFallback className="bg-[#00a884] text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg shadow-md ${
                        message.sender === "user"
                          ? "bg-[#005c4b] text-white rounded-tr-none"
                          : "bg-[#1f2c33] text-white rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <p className="text-[10px] opacity-60">
                          {message.timestamp.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        {message.sender === "user" && (
                          <Check className="h-3 w-3 opacity-60" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <Avatar className="h-8 w-8 mt-1 shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${demoData.botName}`} />
                      <AvatarFallback className="bg-[#00a884] text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="px-4 py-3 rounded-lg bg-[#1f2c33] text-white rounded-tl-none shadow-md">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDuration: '1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s', animationDuration: '1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="bg-[#1e2a30] p-2 border-t border-[#2a3942] shrink-0">
          <div className="flex gap-2 items-center">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={conversationEnded ? "Conversa encerrada" : "Mensagem"}
              disabled={conversationEnded}
              className="flex-1 bg-[#2a3942] border-0 text-white placeholder:text-gray-400 focus-visible:ring-0"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || conversationEnded || isTyping}
              size="icon"
              className="bg-[#00a884] hover:bg-[#00a884]/90 text-white rounded-full h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={initializeConversation}
              disabled={!messages.length}
              className="text-xs text-gray-400 hover:text-white h-auto py-1"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Resetar
            </Button>
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${useAI ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
              <span className="text-[10px] text-gray-400">
                {useAI ? "IA Ativa" : "FAQ"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop/Regular View
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${demoData.botName}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                {demoData.botName} - Demonstração
              </CardTitle>
              <Button
                variant={useAI ? "default" : "outline"}
                size="sm"
                onClick={() => setUseAI(!useAI)}
                className={useAI ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
              >
                {useAI ? <Brain className="h-4 w-4 mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                {useAI ? "IA" : "FAQ"}
              </Button>
            </div>
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
                      <Avatar className="h-8 w-8 mt-1">
                        {message.sender === "user" ? (
                          <>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user`} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${demoData.botName}`} />
                            <AvatarFallback className="bg-muted">
                              <Bot className="h-4 w-4 text-muted-foreground" />
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
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
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${demoData.botName}`} />
                        <AvatarFallback className="bg-muted">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="px-4 py-3 rounded-lg bg-muted text-foreground">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDuration: '1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s', animationDuration: '1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1s' }}></div>
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
          </CardContent>
        </Card>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          {useAI ? "🧠 IA Inteligente ativada" : "📋 Modo FAQ básico"} — Simulação local sem WhatsApp
        </p>
      </div>
    </div>
  );
};

export default PublicChatbotSimulator;