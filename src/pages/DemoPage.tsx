import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bot } from "lucide-react";
import { getUserData, StoredChatbot, StoredAcademia } from "@/utils/userStorage";
import ChatbotSimulator from "@/components/dashboard/ChatbotSimulator";

const DemoPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [chatbot, setChatbot] = useState<StoredChatbot | null>(null);
  const [academia, setAcademia] = useState<StoredAcademia | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Search across all users' data for the demo slug
    // In a real implementation, this would be more efficient with a proper backend
    let foundBot: StoredChatbot | null = null;
    let foundAcademia: StoredAcademia | null = null;

    // Get all users' data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('automiza:user:')) {
        try {
          const userId = key.replace('automiza:user:', '');
          const userData = getUserData(userId);
          
          // Find chatbot with matching demo slug
          const bot = userData.chatbots.find(bot => 
            bot.demo?.enabled && bot.demo?.slug === slug
          );
          
          if (bot) {
            foundBot = bot;
            foundAcademia = userData.academias.find(a => a.id === bot.academiaId) || null;
            break;
          }
        } catch (error) {
          console.warn('Error reading user data:', error);
        }
      }
    }

    if (!foundBot || !foundAcademia) {
      setNotFound(true);
    } else {
      setChatbot(foundBot);
      setAcademia(foundAcademia);
    }

    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando demo...</p>
        </div>
      </div>
    );
  }

  if (notFound || !chatbot || !academia) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Bot className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Demo não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            O link de demonstração não existe ou foi revogado.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header for public demo */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-semibold text-lg">{chatbot.nome}</h1>
              <p className="text-sm text-muted-foreground">
                {academia.nome} - {academia.unidade} • Demo pública
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Simulator in public mode */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Converse com o {chatbot.nome}</h2>
              <p className="text-muted-foreground">
                Esta é uma demonstração do chatbot. Você pode fazer perguntas e ver como ele responde.
              </p>
            </div>

            {/* Custom simulator for public demo - simplified version */}
            <div className="bg-card border rounded-lg h-96">
              <div className="p-4 text-center text-muted-foreground">
                <p>Simulador público em desenvolvimento</p>
                <p className="text-sm mt-2">
                  Conversação disponível com: {chatbot.nome}
                </p>
                <div className="mt-4 space-y-2 text-left max-w-md mx-auto">
                  <p className="font-medium">FAQs disponíveis:</p>
                  {chatbot.mensagens.faqs.map((faq, index) => (
                    <p key={index} className="text-sm">• {faq.pergunta}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Simulação local — sem WhatsApp • Powered by Automiza
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoPage;