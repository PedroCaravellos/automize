import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, TrendingUp, Clock, DollarSign } from "lucide-react";

const ROICalculator = () => {
  const [leads, setLeads] = useState(50);
  const [conversion, setConversion] = useState(10);
  const [ticketMedio, setTicketMedio] = useState(200);
  const [horasAtendimento, setHorasAtendimento] = useState(20);
  const [showResults, setShowResults] = useState(false);

  const scrollToPlans = () =>
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });

  const vendaAtual = (leads * conversion / 100) * ticketMedio;
  const vendaComBot = (leads * (conversion * 1.6) / 100) * ticketMedio;
  const aumentoVendas = vendaComBot - vendaAtual;
  const economiaHoras = horasAtendimento * 0.7;
  const economiaReais = economiaHoras * 25;
  const roiMensal = aumentoVendas + economiaReais - 197;
  const roiAnual = roiMensal * 12;

  return (
    <section className="py-24 bg-muted/40">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">
              Calculadora
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Calcule seu ROI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Descubra quanto você pode economizar e ganhar com o Automiza.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator */}
            <div className="bg-card border border-white/[0.06] rounded-xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Suas informações</h3>
              </div>

              <div className="space-y-5">
                {[
                  { label: "Quantos leads você recebe por mês?", value: leads, setter: setLeads },
                  { label: "Taxa de conversão atual (%)", value: conversion, setter: setConversion },
                  { label: "Ticket médio (R$)", value: ticketMedio, setter: setTicketMedio },
                  { label: "Horas gastas no atendimento por semana", value: horasAtendimento, setter: setHorasAtendimento },
                ].map(({ label, value, setter }) => (
                  <div key={label}>
                    <label className="block text-sm text-muted-foreground mb-2">{label}</label>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => setter(Number(e.target.value))}
                      className="bg-muted border-white/[0.08] text-foreground focus:border-primary/50"
                    />
                  </div>
                ))}

                <Button
                  onClick={() => setShowResults(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-11 font-semibold mt-2"
                  size="lg"
                >
                  Calcular ROI
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="bg-card border border-white/[0.06] rounded-xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Seus resultados</h3>
              </div>

              {!showResults ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Calculator className="h-12 w-12 text-white/[0.08] mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Preencha os dados ao lado para ver seus resultados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Aumento nas vendas</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      +R$ {aumentoVendas.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por mês com 60% mais conversões
                    </p>
                  </div>

                  <div className="bg-muted border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Economia de tempo</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{economiaHoras.toFixed(1)}h</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por semana liberadas (R$ {economiaReais.toLocaleString("pt-BR")}/mês)
                    </p>
                  </div>

                  <div className="bg-primary/[0.08] border border-primary/20 rounded-xl p-5 text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      ROI Total com Plano Pro
                    </p>
                    <p className="text-4xl font-bold text-foreground mb-1">
                      +R$ {roiMensal.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">Por mês</p>
                    <p className="text-lg font-semibold text-primary">
                      R$ {roiAnual.toLocaleString("pt-BR")} por ano
                    </p>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground mb-4">
                      * Baseado em médias de clientes reais
                    </p>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white h-11 font-semibold"
                      onClick={scrollToPlans}
                    >
                      Começar teste grátis
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
