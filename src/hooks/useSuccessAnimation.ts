import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Trash2, Edit, Plus, Send, Save } from "lucide-react";

type SuccessType = "create" | "update" | "delete" | "send" | "save" | "success";

const iconMap = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  send: Send,
  save: Save,
  success: CheckCircle2,
};

export function useSuccessAnimation() {
  const showSuccess = (message: string, type: SuccessType = "success") => {
    toast({
      title: message,
      duration: 3000,
      className: "animate-fade-in",
    });
  };

  return { showSuccess };
}
