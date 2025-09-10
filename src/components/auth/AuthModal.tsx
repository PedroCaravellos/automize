import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AuthForm from "./AuthForm";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === "signin" ? "Entrar na sua conta" : "Criar conta"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "signin" 
              ? "Entre com suas credenciais para acessar o dashboard" 
              : "Crie sua conta para começar a automatizar seu negócio"
            }
          </DialogDescription>
        </DialogHeader>
        
        <AuthForm 
          mode={mode} 
          onModeChange={setMode}
          onSuccess={handleSuccess}
          isModal={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;