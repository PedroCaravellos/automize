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
  });

  const [errors, setErrors] = useState({
    nome: "",
    unidade: "",
    segmento: "",
  });

  useEffect(() => {
    if (academia) {
      setFormData({
        nome: academia.nome,
        unidade: academia.unidade,
        segmento: academia.segmento,
      });
    } else {
      setFormData({
        nome: "",
        unidade: "",
        segmento: "",
      });
    }
    setErrors({ nome: "", unidade: "", segmento: "" });
  }, [academia, open]);

  const validateForm = () => {
    const newErrors = {
      nome: "",
      unidade: "",
      segmento: "",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {academia ? "Editar Academia" : "Adicionar Academia"}
          </DialogTitle>
          <DialogDescription>
            {academia 
              ? "Atualize as informações da academia."
              : "Preencha os dados para cadastrar uma nova academia."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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