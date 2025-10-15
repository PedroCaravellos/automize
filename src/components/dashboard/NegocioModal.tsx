import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Negocio } from "./NegociosSection";

interface NegocioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  negocio?: Negocio;
  onSave: (negocio: Partial<Negocio>) => void;
}

const tiposNegocio = [
  { value: 'academia', label: 'Academia & Fitness' },
  { value: 'clinica', label: 'Clínica & Saúde' },
  { value: 'barbearia', label: 'Barbearia & Beleza' },
  { value: 'restaurante', label: 'Restaurante & Alimentação' },
  { value: 'escola', label: 'Escola & Educação' },
  { value: 'oficina', label: 'Oficina & Manutenção' },
  { value: 'loja', label: 'Loja & Comércio' },
  { value: 'consultoria', label: 'Consultoria & Serviços' },
  { value: 'outros', label: 'Outros' }
];

const segmentosPorTipo = {
  academia: ['Academia', 'Box CrossFit', 'Estúdio de Pilates', 'Personal Trainer', 'Funcional'],
  clinica: ['Clínica Médica', 'Clínica Odontológica', 'Fisioterapia', 'Psicologia', 'Estética'],
  barbearia: ['Barbearia', 'Salão de Beleza', 'Spa', 'Estética Facial', 'Manicure'],
  restaurante: ['Restaurante', 'Lanchonete', 'Pizzaria', 'Cafeteria', 'Food Truck'],
  escola: ['Escola', 'Curso Técnico', 'Idiomas', 'Música', 'Informática'],
  oficina: ['Oficina Mecânica', 'Elétrica Automotiva', 'Funilaria', 'Moto', 'Bicicletas'],
  loja: ['Roupas', 'Calçados', 'Eletrônicos', 'Casa e Decoração', 'Farmácia'],
  consultoria: ['Contabilidade', 'Advocacia', 'Marketing', 'TI', 'Recursos Humanos'],
  outros: ['Imobiliária', 'Petshop', 'Lavanderia', 'Gráfica', 'Outros']
};

const NegocioModal = ({ open, onOpenChange, negocio, onSave }: NegocioModalProps) => {
  const [formData, setFormData] = useState<Partial<Negocio>>({
    nome: "",
    unidade: "",
    tipoNegocio: "outros",
    segmento: "",
    endereco: "",
    telefone: "",
    whatsapp: "",
    horario_funcionamento: "",
    servicos_oferecidos: [],
    valores: {
      planos: [],
      servicosAvulsos: [],
      observacoes: ""
    },
    promocoes: "",
    diferenciais: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (negocio) {
        setFormData({ ...negocio });
      } else {
        setFormData({
          nome: "",
          unidade: "",
          tipoNegocio: "outros",
          segmento: "",
          endereco: "",
          telefone: "",
          whatsapp: "",
          horario_funcionamento: "",
          servicos_oferecidos: [],
          valores: {
            planos: [],
            servicosAvulsos: [],
            observacoes: ""
          },
          promocoes: "",
          diferenciais: "",
        });
      }
      setErrors({});
    }
  }, [open, negocio]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome?.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.tipoNegocio) {
      newErrors.tipoNegocio = "Tipo de negócio é obrigatório";
    }

    if (!formData.segmento?.trim()) {
      newErrors.segmento = "Segmento é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const trimmedData = {
        ...formData,
        nome: formData.nome?.trim(),
        segmento: formData.segmento?.trim(),
        unidade: formData.unidade?.trim(),
        endereco: formData.endereco?.trim(),
        telefone: formData.telefone?.trim(),
        whatsapp: formData.whatsapp?.trim(),
        horario_funcionamento: formData.horario_funcionamento?.trim(),
        promocoes: formData.promocoes?.trim(),
        diferenciais: formData.diferenciais?.trim(),
        valores: formData.valores && (
          formData.valores.planos?.length > 0 || 
          formData.valores.servicosAvulsos?.length > 0 || 
          formData.valores.observacoes
        ) ? formData.valores : undefined,
      };
      onSave(trimmedData);
    }
  };

  const handleInputChange = (field: keyof Negocio, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTipoNegocioChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      tipoNegocio: value,
      segmento: "" // Reset segmento when tipo changes
    }));
    if (errors.tipoNegocio) {
      setErrors((prev) => ({ ...prev, tipoNegocio: "" }));
    }
  };

  const getSegmentosDisponiveis = () => {
    return segmentosPorTipo[formData.tipoNegocio as keyof typeof segmentosPorTipo] || segmentosPorTipo.outros;
  };

  const getPlaceholderByTipo = (field: string) => {
    const placeholders = {
      academia: {
        servicos: "Musculação, Pilates, Funcional...",
        horario: "Segunda a Sexta: 06h às 22h, Sábado: 08h às 18h",
        promocoes: "50% de desconto na matrícula, Sem taxa de adesão",
        diferenciais: "Equipamentos modernos, Personal trainer incluso"
      },
      clinica: {
        servicos: "Consultas, Exames, Procedimentos...",
        horario: "Segunda a Sexta: 08h às 18h",
        promocoes: "Consulta de retorno gratuita",
        diferenciais: "Equipamentos de última geração, Profissionais especializados"
      },
      barbearia: {
        servicos: "Corte, Barba, Sobrancelha...",
        horario: "Segunda a Sábado: 09h às 19h",
        promocoes: "Pacote corte + barba com desconto",
        diferenciais: "Ambiente aconchegante, Produtos premium"
      }
    };

    const tipo = formData.tipoNegocio as keyof typeof placeholders;
    return placeholders[tipo]?.[field as keyof typeof placeholders.academia] || 
           `Ex: ${field === 'servicos' ? 'Serviços oferecidos...' : field}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {negocio ? "Editar Negócio" : "Novo Negócio"}
          </DialogTitle>
          <DialogDescription>
            {negocio ? "Atualize as informações do seu negócio." : "Cadastre um novo negócio."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome || ""}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Nome do seu negócio"
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && (
              <p className="text-sm text-red-500 mt-1">{errors.nome}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <Label htmlFor="tipoNegocio">Tipo *</Label>
            <Select
              value={formData.tipoNegocio || "outros"}
              onValueChange={handleTipoNegocioChange}
            >
              <SelectTrigger className={errors.tipoNegocio ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposNegocio.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipoNegocio && (
              <p className="text-sm text-red-500 mt-1">{errors.tipoNegocio}</p>
            )}
          </div>

          {/* Segmento */}
          <div>
            <Label htmlFor="segmento">Segmento *</Label>
            <Select
              value={formData.segmento || ""}
              onValueChange={(value) => handleInputChange("segmento", value)}
            >
              <SelectTrigger className={errors.segmento ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o segmento" />
              </SelectTrigger>
              <SelectContent>
                {getSegmentosDisponiveis().map((segmento) => (
                  <SelectItem key={segmento} value={segmento}>
                    {segmento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.segmento && (
              <p className="text-sm text-red-500 mt-1">{errors.segmento}</p>
            )}
          </div>

          {/* Unidade/Local */}
          <div>
            <Label htmlFor="unidade">Unidade/Local</Label>
            <Input
              id="unidade"
              value={formData.unidade || ""}
              onChange={(e) => handleInputChange("unidade", e.target.value)}
              placeholder="Centro, Filial Norte, etc."
            />
          </div>

          {/* Endereço */}
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco || ""}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone || ""}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
              placeholder="(11) 9999-9999"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp || ""}
              onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Horário */}
          <div>
            <Label htmlFor="horario">Horário</Label>
            <Textarea
              id="horario"
              value={formData.horario_funcionamento || ""}
              onChange={(e) => handleInputChange("horario_funcionamento", e.target.value)}
              placeholder={getPlaceholderByTipo('horario')}
              rows={2}
            />
          </div>

          {/* Serviços */}
          <div>
            <Label htmlFor="servicos">Serviços</Label>
            <Textarea
              id="servicos"
              value={Array.isArray(formData.servicos_oferecidos) 
                ? formData.servicos_oferecidos.join(', ') 
                : formData.servicos_oferecidos || ""}
              onChange={(e) => {
                const value = e.target.value;
                const array = value ? value.split(',').map(s => s.trim()) : [];
                handleInputChange("servicos_oferecidos", array);
              }}
              placeholder={getPlaceholderByTipo('servicos')}
              rows={2}
            />
          </div>

          {/* Promoções */}
          <div>
            <Label htmlFor="promocoes">Promoções</Label>
            <Textarea
              id="promocoes"
              value={formData.promocoes || ""}
              onChange={(e) => handleInputChange("promocoes", e.target.value)}
              placeholder={getPlaceholderByTipo('promocoes')}
              rows={2}
            />
          </div>

          {/* Diferenciais */}
          <div>
            <Label htmlFor="diferenciais">Diferenciais</Label>
            <Textarea
              id="diferenciais"
              value={formData.diferenciais || ""}
              onChange={(e) => handleInputChange("diferenciais", e.target.value)}
              placeholder={getPlaceholderByTipo('diferenciais')}
              rows={2}
            />
          </div>

          {/* Seção de Preços */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-base">Preços e Valores</h4>
            
            {/* Planos/Mensalidades */}
            <div>
              <Label className="text-sm font-medium">Planos de Assinatura (Mensalidades, Anuidades, etc.)</Label>
              <div className="space-y-2 mt-2">
                {(formData.valores?.planos || []).map((plano, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 border rounded-lg">
                    <Input
                      placeholder="Ex: Plano Mensal"
                      value={plano.nome}
                      onChange={(e) => {
                        const novosPlanos = [...(formData.valores?.planos || [])];
                        novosPlanos[index] = { ...plano, nome: e.target.value };
                        handleInputChange("valores", { ...formData.valores, planos: novosPlanos });
                      }}
                      className="flex-1"
                    />
                    <div className="relative w-24">
                      <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-6 text-sm"
                        value={plano.preco}
                        onChange={(e) => {
                          const novosPlanos = [...(formData.valores?.planos || [])];
                          novosPlanos[index] = { ...plano, preco: parseFloat(e.target.value) || 0 };
                          handleInputChange("valores", { ...formData.valores, planos: novosPlanos });
                        }}
                      />
                    </div>
                    <Select
                      value={plano.periodo}
                      onValueChange={(value) => {
                        const novosPlanos = [...(formData.valores?.planos || [])];
                        novosPlanos[index] = { ...plano, periodo: value };
                        handleInputChange("valores", { ...formData.valores, planos: novosPlanos });
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="unico">Único</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const novosPlanos = (formData.valores?.planos || []).filter((_, i) => i !== index);
                        handleInputChange("valores", { ...formData.valores, planos: novosPlanos });
                      }}
                      className="text-destructive hover:text-destructive/80 px-2"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const novosPlanos = [...(formData.valores?.planos || []), { nome: "", preco: 0, periodo: "mensal" }];
                    handleInputChange("valores", { ...formData.valores, planos: novosPlanos });
                  }}
                  className="w-full"
                >
                  + Adicionar Plano
                </Button>
              </div>
            </div>

            {/* Serviços Avulsos */}
            <div>
              <Label className="text-sm font-medium">Serviços Avulsos (Consultas, Aulas Avulsas, etc.)</Label>
              <div className="space-y-2 mt-2">
                {(formData.valores?.servicosAvulsos || []).map((servico, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 border rounded-lg">
                    <Input
                      placeholder="Ex: Consulta"
                      value={servico.nome}
                      onChange={(e) => {
                        const novosServicos = [...(formData.valores?.servicosAvulsos || [])];
                        novosServicos[index] = { ...servico, nome: e.target.value };
                        handleInputChange("valores", { ...formData.valores, servicosAvulsos: novosServicos });
                      }}
                      className="flex-1"
                    />
                    <div className="relative w-24">
                      <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-6 text-sm"
                        value={servico.preco}
                        onChange={(e) => {
                          const novosServicos = [...(formData.valores?.servicosAvulsos || [])];
                          novosServicos[index] = { ...servico, preco: parseFloat(e.target.value) || 0 };
                          handleInputChange("valores", { ...formData.valores, servicosAvulsos: novosServicos });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const novosServicos = (formData.valores?.servicosAvulsos || []).filter((_, i) => i !== index);
                        handleInputChange("valores", { ...formData.valores, servicosAvulsos: novosServicos });
                      }}
                      className="text-destructive hover:text-destructive/80 px-2"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const novosServicos = [...(formData.valores?.servicosAvulsos || []), { nome: "", preco: 0 }];
                    handleInputChange("valores", { ...formData.valores, servicosAvulsos: novosServicos });
                  }}
                  className="w-full"
                >
                  + Adicionar Serviço
                </Button>
              </div>
            </div>

            {/* Observações sobre Preços */}
            <div>
              <Label htmlFor="observacoes-precos">Observações sobre Preços</Label>
              <Textarea
                id="observacoes-precos"
                value={formData.valores?.observacoes || ""}
                onChange={(e) => handleInputChange("valores", { ...formData.valores, observacoes: e.target.value })}
                placeholder="Ex: Desconto para estudantes, Promoção até dezembro, etc."
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="min-w-[120px]">
            {negocio ? "Atualizar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NegocioModal;