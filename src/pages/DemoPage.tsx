import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicChatbotSimulator from "@/components/PublicChatbotSimulator";
import * as LZString from "lz-string";

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
        const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{demoData.botName}</h1>
                <p className="text-muted-foreground">
                  {demoData.academyName} • Demo pública
                </p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Página inicial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PublicChatbotSimulator demoData={demoData} />
        </div>
      </main>
    </div>
  );
};

export default DemoPage;