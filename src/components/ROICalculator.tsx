import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calculator, TrendingUp, Clock, DollarSign } from "lucide-react";

const ROICalculator = () => {
  const [leads, setLeads] = useState(50);
  const [conversion, setConversion] = useState(10);
  const [ticketMedio, setTicketMedio] = useState(200);
  const [horasAtendimento, setHorasAtendimento] = useState(20);
  const [showResults, setShowResults] = useState(false);

  const calculate = () => {
    setShowResults(true);
  };

  // Cálculos
  const vendaAtual = (leads * conversion / 100) * ticketMedio;
  const vendaComBot = (leads * (conversion * 1.6) / 100) * ticketMedio; // 60% mais conversões
  const aumentoVendas = vendaComBot - vendaAtual;
  const economiaHoras = horasAtendimento * 0.7; // 70% de economia
  const economiaReais = economiaHoras * 25; // R$ 25/hora
  const roiMensal = aumentoVendas + economiaReais - 197; // Plano Pro
  const roiAnual = roiMensal * 12;

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Calcule seu ROI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Descubra quanto você pode economizar e ganhar com o Automiza
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Calculator */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Calculator className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-heading font-semibold">
                Suas informações
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantos leads você recebe por mês?
                </label>
                <Input
                  type="number"
                  value={leads}
                  onChange={(e) => setLeads(Number(e.target.value))}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Taxa de conversão atual (%)
                </label>
                <Input
                  type="number"
                  value={conversion}
                  onChange={(e) => setConversion(Number(e.target.value))}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ticket médio (R$)
                </label>
                <Input
                  type="number"
                  value={ticketMedio}
                  onChange={(e) => setTicketMedio(Number(e.target.value))}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Horas gastas no atendimento por semana
                </label>
                <Input
                  type="number"
                  value={horasAtendimento}
                  onChange={(e) => setHorasAtendimento(Number(e.target.value))}
                  className="text-lg"
                />
              </div>

              <Button 
                onClick={calculate}
                className="w-full"
                size="lg"
              >
                Calcular ROI
              </Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="h-6 w-6 text-secondary" />
              <h3 className="text-2xl font-heading font-semibold">
                Seus resultados
              </h3>
            </div>

            {!showResults ? (
              <div className="text-center text-muted-foreground py-12">
                <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados ao lado para ver seus resultados</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-accent rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Aumento nas vendas</h4>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    +R$ {aumentoVendas.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Por mês com 60% mais conversões
                  </p>
                </div>

                <div className="bg-gradient-accent rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Economia de tempo</h4>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {economiaHoras.toFixed(1)}h
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Por semana liberadas (R$ {economiaReais.toLocaleString('pt-BR')}/mês)
                  </p>
                </div>

                <div className="bg-gradient-hero text-primary-foreground rounded-xl p-6">
                  <h4 className="font-semibold mb-4 text-center">
                    ROI Total com Plano Pro
                  </h4>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      +R$ {roiMensal.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-sm opacity-90 mb-4">Por mês</p>
                    <div className="text-2xl font-semibold">
                      R$ {roiAnual.toLocaleString('pt-BR')} por ano
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    * Baseado em médias de clientes reais
                  </p>
                  <Button variant="hero" size="lg" className="w-full">
                    Começar teste grátis
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;