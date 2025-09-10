import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, ExternalLink, Crown, Zap, Building2, Download, CreditCard, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type PlanType = 'Basico' | 'Pro' | 'Premium';

interface BillingFormData {
  nomeOuRazao: string;
  documento: string;
  emailCobranca: string;
  endereco: string;
}

interface PlanManagementProps {
  preselectedPlan?: string | null;
}

export default function PlanManagement({ preselectedPlan }: PlanManagementProps) {
  const { 
    subscription, 
    billingInfo, 
    invoices, 
    updateBillingInfo, 
    simulateActivatePlan,
    simulateCancelSubscription, 
    formatBRL,
    isHydrating,
    addActivity
  } = useAuth();
  const { toast } = useToast();
  
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BillingFormData>({
    nomeOuRazao: billingInfo.nomeOuRazao,
    documento: billingInfo.documento,
    emailCobranca: billingInfo.emailCobranca,
    endereco: billingInfo.endereco
  });

  // Update form data when billingInfo changes
  useEffect(() => {
    setFormData({
      nomeOuRazao: billingInfo.nomeOuRazao,
      documento: billingInfo.documento,
      emailCobranca: billingInfo.emailCobranca,
      endereco: billingInfo.endereco
    });
  }, [billingInfo]);

  // Handle preselected plan from URL
  useEffect(() => {
    if (preselectedPlan && !subscription.planoAtivo && ['Basico', 'Pro', 'Premium'].includes(preselectedPlan)) {
      // Visual indication of preselected plan - you could add highlighting logic here if needed
      console.log(`Plan ${preselectedPlan} preselected from URL`);
    }
  }, [preselectedPlan, subscription.planoAtivo]);

const PLAN_PRICES = {
  Basico: 9700,   // R$ 97,00 em centavos
  Pro: 19700,     // R$ 197,00 em centavos
  Premium: 39700  // R$ 397,00 em centavos
} as const;

  const plans = [
    {
      name: "Basico" as PlanType,
      price: PLAN_PRICES.Basico,
      icon: Building2,
      features: ["1 Academia", "1 Chatbot", "500 mensagens/mês", "Suporte via email"]
    },
    {
      name: "Pro" as PlanType,
      price: PLAN_PRICES.Pro,
      icon: Zap,
      features: ["3 Academias", "3 Chatbots", "2.000 mensagens/mês", "Relatórios básicos", "Suporte prioritário"]
    },
    {
      name: "Premium" as PlanType,
      price: PLAN_PRICES.Premium,
      icon: Crown,
      features: ["Academias ilimitadas", "Chatbots ilimitados", "Mensagens ilimitadas", "Relatórios avançados", "Suporte 24/7"]
    }
  ];

  const handlePlanSelection = (planName: PlanType) => {
    setSelectedPlan(planName);
    setPaymentModalOpen(true);
  };

  const validateForm = () => {
    const { nomeOuRazao, documento, emailCobranca, endereco } = formData;
    
    if (!nomeOuRazao.trim() || !emailCobranca.trim() || !endereco.trim()) {
      return false;
    }
    
    // Documento deve ter 11 ou 14 dígitos
    const docNumbers = documento.replace(/\D/g, '');
    if (docNumbers.length !== 11 && docNumbers.length !== 14) {
      return false;
    }
    
    // Email simples validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailCobranca)) {
      return false;
    }
    
    return true;
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan || !validateForm()) return;
    
    setIsLoading(true);
    try {
      // Update billing info
      updateBillingInfo(formData);
      
      // Simulate plan activation
      const { invoiceId } = simulateActivatePlan(selectedPlan);
      
      toast({
        title: "Plano ativado!",
        description: `Plano ${selectedPlan} ativado com sucesso (simulado).`,
      });
      
      setPaymentModalOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível ativar o plano.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    simulateCancelSubscription();
    setCancelModalOpen(false);
    toast({
      title: "Assinatura cancelada",
      description: "Sua assinatura foi cancelada com sucesso (simulado).",
    });
  };

  const handleDownloadInvoice = (invoice: any) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Comprovante de Pagamento - ${invoice.id}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #111827; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .invoice-details { margin: 20px 0; }
    .row { display: flex; justify-content: space-between; margin: 8px 0; }
    .total { font-weight: bold; font-size: 18px; }
    .section-title { margin-top: 24px; margin-bottom: 8px; font-weight: bold; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Automiza</div>
    <h2>Comprovante de Pagamento</h2>
  </div>
  
  <div class="invoice-details">
    <h3 class="section-title">Dados da Empresa</h3>
    <p>Automiza Tecnologia Ltda<br>
    CNPJ: 00.000.000/0001-00<br>
    contato@automiza.com.br</p>
    
    <h3 class="section-title">Dados do Cliente</h3>
    <p>${billingInfo.nomeOuRazao}<br>
    ${billingInfo.documento}<br>
    ${billingInfo.emailCobranca}<br>
    ${billingInfo.endereco}</p>
    
    <h3 class="section-title">Detalhes da Fatura</h3>
    <div class="row"><span>Número:</span><span>${invoice.id}</span></div>
    <div class="row"><span>Plano:</span><span>${invoice.plano}</span></div>
    <div class="row"><span>Data de Emissão:</span><span>${new Date(invoice.criadoEm).toLocaleDateString('pt-BR')}</span></div>
    <div class="row"><span>Pago em:</span><span>${invoice.pagoEm ? new Date(invoice.pagoEm).toLocaleDateString('pt-BR') : '-'}</span></div>
    <div class="row"><span>Status:</span><span>${invoice.status}</span></div>
    <div class="row total"><span>Valor Total:</span><span>${formatBRL(invoice.valor)}</span></div>
  </div>
  
  <script>window.print();</script>
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getStatusCard = () => {
    if (subscription.planoAtivo) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-green-500">Ativo</Badge>
            <span className="font-medium">Plano {subscription.nomePlano}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Cancelar assinatura (simulado)
            </Button>
          </div>
          {subscription.proximaRenovacaoEm && (
            <p className="text-sm text-muted-foreground">
              Próxima renovação: {new Date(subscription.proximaRenovacaoEm).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      );
    }
    
    if (subscription.trialAtivo && !subscription.planoAtivo) {
      const daysLeft = subscription.trialFimEm ? Math.max(0, Math.ceil((new Date(subscription.trialFimEm).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
      return (
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            Trial ativo — {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
          </Badge>
        </div>
      );
    }
    
    return (
      <div className="text-muted-foreground">
        Sem plano ativo. Selecione um plano para liberar o uso.
      </div>
    );
  };

  // Show loading skeleton while hydrating
  if (isHydrating) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                    <Skeleton className="h-10 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasActivePlan = subscription.planoAtivo;

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>{subscription.planoAtivo ? `Plano ativo: ${subscription.nomePlano}` : 'Status da assinatura'}</CardTitle>
        </CardHeader>
        <CardContent>
          {getStatusCard()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar plano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasActivePlan && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                Você já possui o plano {subscription.nomePlano} ativo.
              </p>
            </div>
          )}
          
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const active = subscription.planoAtivo && subscription.nomePlano === plan.name;
              const isPreselected = preselectedPlan === plan.name && !subscription.planoAtivo;
              
              return (
                <Card key={plan.name} className={`relative ${active ? 'ring-2 ring-primary' : ''} ${isPreselected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {active && <Badge variant="default">Atual</Badge>}
                      {isPreselected && <Badge variant="outline" className="border-blue-500 text-blue-600">Sugerido</Badge>}
                    </div>
                    <div className="text-2xl font-bold">{formatBRL(plan.price)}/mês</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handlePlanSelection(plan.name)}
                      disabled={isLoading || active}
                      className="w-full"
                      variant={active ? "outline" : "default"}
                    >
                      {active ? "Plano ativo" : "Prosseguir para pagamento (simulado)"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de faturas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data de emissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...invoices].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()).map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                    <TableCell>{invoice.plano}</TableCell>
                    <TableCell>{formatBRL(invoice.valor)}</TableCell>
                    <TableCell>{new Date(invoice.criadoEm).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === 'paga' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Comprovante
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento (simulado)</DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              {/* Plan Summary */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumo do plano</h4>
                <div className="flex justify-between items-center">
                  <span>Plano {selectedPlan}</span>
                  <span className="font-bold">{formatBRL(plans.find(p => p.name === selectedPlan)?.price || 0)}/mês</span>
                </div>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  {plans.find(p => p.name === selectedPlan)?.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Billing Form */}
              <div className="space-y-4">
                <h4 className="font-medium">Dados de cobrança</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="nomeOuRazao">Nome / Razão social *</Label>
                  <Input
                    id="nomeOuRazao"
                    value={formData.nomeOuRazao}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomeOuRazao: e.target.value }))}
                    placeholder="Digite o nome ou razão social"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento">CPF/CNPJ *</Label>
                  <Input
                    id="documento"
                    value={formData.documento}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, documento: value }));
                    }}
                    placeholder="Somente números"
                    maxLength={14}
                  />
                  <p className="text-xs text-muted-foreground">11 dígitos (CPF) ou 14 dígitos (CNPJ)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailCobranca">E-mail de cobrança *</Label>
                  <Input
                    id="emailCobranca"
                    type="email"
                    value={formData.emailCobranca}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailCobranca: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Rua, nº, bairro, cidade/UF"
                  />
                </div>
              </div>

              <Separator />

              {/* Payment Method */}
              <div className="space-y-2">
                <h4 className="font-medium">Forma de pagamento</h4>
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Cartão de Crédito (Simulado)</span>
                  <Badge variant="secondary" className="ml-auto text-xs">SIMULADO</Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPaymentModalOpen(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={!validateForm() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Processando..." : "Confirmar (simulado)"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancelar assinatura
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Você perderá acesso às funcionalidades premium ao final do ciclo atual. 
              Confirmar cancelamento?
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                className="flex-1"
              >
                Confirmar cancelamento (simulado)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}