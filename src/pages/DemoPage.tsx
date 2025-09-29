import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Bot, ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PublicChatbotSimulator from "@/components/PublicChatbotSimulator";
import { decompressFromEncodedURIComponent } from "lz-string";
import { useIsMobile } from "@/hooks/use-mobile";

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

const DemoPage = () => {
  const [searchParams] = useSearchParams();
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadDemoData = () => {
      const compressedData = searchParams.get('d');
      
      if (!compressedData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const decompressed = decompressFromEncodedURIComponent(compressedData);
        if (!decompressed) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = JSON.parse(decompressed) as DemoData;
        
        // Validate data structure
        if (!data.botName || !data.academyName || !data.mensagens || !Array.isArray(data.mensagens.faqs)) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setDemoData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing demo data:', error);
        setNotFound(true);
        setLoading(false);
      }
    };

    loadDemoData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-lg text-muted-foreground">Carregando demo...</p>
        </div>
      </div>
    );
  }

  if (notFound || !demoData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Demo não encontrada ou inválida</h1>
          <p className="text-muted-foreground mb-4">
            O link de demonstração é inválido ou corrompido.
          </p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para página inicial
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-[#0a1014] flex items-center justify-center p-4">
      {/* Mobile WhatsApp-style Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Device Frame */}
        <div className="bg-background rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-800">
          {/* WhatsApp Header */}
          <div className="bg-[#008069] text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Link to="/">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${demoData.botName}`} />
                  <AvatarFallback className="bg-[#00a884] text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-semibold truncate">{demoData.botName}</h1>
                  <p className="text-xs text-white/80 truncate">
                    {demoData.academyName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-white hover:bg-white/10"
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-white hover:bg-white/10"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-white hover:bg-white/10"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="bg-[#0b141a] min-h-[600px]">
            <PublicChatbotSimulator demoData={demoData} isMobilePreview={true} />
          </div>
        </div>

        {/* Demo Label */}
        <div className="text-center mt-4">
          <p className="text-white/60 text-sm">
            🔒 Demonstração Segura • Nenhum dado pessoal é armazenado
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;