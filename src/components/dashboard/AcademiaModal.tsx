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
import { Academia } from "./AcademiasSection";

interface AcademiaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academia: Academia | null;
  onSave: (academia: Omit<Academia, "id" | "createdAt">) => void;
}

const AcademiaModal = ({ open, onOpenChange, academia, onSave }: AcademiaModalProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    unidade: "",
    segmento: "" as "Academia" | "Estúdio" | "Box" | "",
    endereco: "",
    telefone: "",
    whatsapp: "",
    horarios: "",
    modalidades: "",
    valores: "",
    promocoes: "",
    diferenciais: "",
  });

  const [errors, setErrors] = useState({
    nome: "",
    unidade: "",
    segmento: "",
    endereco: "",
    telefone: "",
    whatsapp: "",
    horarios: "",
    modalidades: "",
    valores: "",
    promocoes: "",
    diferenciais: "",
  });

  useEffect(() => {
    if (academia) {
      setFormData({
        nome: academia.nome,
        unidade: academia.unidade,
        segmento: academia.segmento,
        endereco: academia.endereco || "",
        telefone: academia.telefone || "",
        whatsapp: academia.whatsapp || "",
        horarios: academia.horarios || "",
        modalidades: academia.modalidades || "",
        valores: academia.valores || "",
        promocoes: academia.promocoes || "",
        diferenciais: academia.diferenciais || "",
      });
    } else {
      setFormData({
        nome: "",
        unidade: "",
        segmento: "",
        endereco: "",
        telefone: "",
        whatsapp: "",
        horarios: "",
        modalidades: "",
        valores: "",
        promocoes: "",
        diferenciais: "",
      });
    }
    setErrors({ 
      nome: "", 
      unidade: "", 
      segmento: "",
      endereco: "",
      telefone: "",
      whatsapp: "",
      horarios: "",
      modalidades: "",
      valores: "",
      promocoes: "",
      diferenciais: "",
    });
  }, [academia, open]);

  const validateForm = () => {
    const newErrors = {
      nome: "",
      unidade: "",
      segmento: "",
      endereco: "",
      telefone: "",
      whatsapp: "",
      horarios: "",
      modalidades: "",
      valores: "",
      promocoes: "",
      diferenciais: "",
    };

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome da academia é obrigatório";
    }
    if (!formData.unidade.trim()) {
      newErrors.unidade = "Unidade/Bairro é obrigatório";
    }
    if (!formData.segmento) {
      newErrors.segmento = "Segmento é obrigatório";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        nome: formData.nome.trim(),
        unidade: formData.unidade.trim(),
        segmento: formData.segmento as "Academia" | "Estúdio" | "Box",
        endereco: formData.endereco.trim(),
        telefone: formData.telefone.trim(),
        whatsapp: formData.whatsapp.trim(),
        horarios: formData.horarios.trim(),
        modalidades: formData.modalidades.trim(),
        valores: formData.valores.trim(),
        promocoes: formData.promocoes.trim(),
        diferenciais: formData.diferenciais.trim(),
        statusChatbot: academia?.statusChatbot || "Nenhum",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {academia ? "Editar Academia" : "Adicionar Academia"}
          </DialogTitle>
          <DialogDescription>
            {academia 
              ? "Atualize as informações da academia para melhorar as respostas do chatbot."
              : "Preencha os dados para cadastrar uma nova academia. Quanto mais detalhes, melhor será o chatbot."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Academia *</Label>
            <Input
              id="nome"
              placeholder="Ex: SmartFit, Bodytech..."
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              className={errors.nome ? "border-destructive" : ""}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade/Bairro *</Label>
            <Input
              id="unidade"
              placeholder="Ex: Centro, Ipanema, Shopping..."
              value={formData.unidade}
              onChange={(e) => handleInputChange("unidade", e.target.value)}
              className={errors.unidade ? "border-destructive" : ""}
            />
            {errors.unidade && (
              <p className="text-sm text-destructive">{errors.unidade}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="segmento">Segmento *</Label>
            <Select
              value={formData.segmento}
              onValueChange={(value) => handleInputChange("segmento", value)}
            >
              <SelectTrigger className={errors.segmento ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academia">Academia</SelectItem>
                <SelectItem value="Estúdio">Estúdio</SelectItem>
                <SelectItem value="Box">Box</SelectItem>
              </SelectContent>
            </Select>
            {errors.segmento && (
              <p className="text-sm text-destructive">{errors.segmento}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Input
              id="endereco"
              placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="Ex: (11) 1234-5678"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="Ex: (11) 98765-4321"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horarios">Horários de Funcionamento</Label>
            <Textarea
              id="horarios"
              placeholder="Ex: Segunda a Sexta: 6h às 23h | Sábado: 8h às 18h | Domingo: 9h às 16h"
              value={formData.horarios}
              onChange={(e) => handleInputChange("horarios", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modalidades">Modalidades Disponíveis</Label>
            <Textarea
              id="modalidades"
              placeholder="Ex: Musculação, Natação, Pilates, Yoga, Crossfit, Zumba, Spinning, Judô..."
              value={formData.modalidades}
              onChange={(e) => handleInputChange("modalidades", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valores">Planos e Valores</Label>
            <Textarea
              id="valores"
              placeholder="Ex: Mensal: R$ 89,90 | Trimestral: R$ 239,90 | Anual: R$ 899,90 | Taxa de matrícula: R$ 50,00"
              value={formData.valores}
              onChange={(e) => handleInputChange("valores", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promocoes">Promoções Atuais</Label>
            <Textarea
              id="promocoes"
              placeholder="Ex: Matrícula grátis em janeiro | 50% desconto no primeiro mês | Traga um amigo e ganhe..."
              value={formData.promocoes}
              onChange={(e) => handleInputChange("promocoes", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diferenciais">Diferenciais da Academia</Label>
            <Textarea
              id="diferenciais"
              placeholder="Ex: Equipamentos importados, Personal trainer incluso, Estacionamento gratuito, App exclusivo..."
              value={formData.diferenciais}
              onChange={(e) => handleInputChange("diferenciais", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {academia ? "Atualizar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcademiaModal;