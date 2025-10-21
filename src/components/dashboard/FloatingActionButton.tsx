import { useState } from "react";
import { Plus, Users, Calendar, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FloatingActionButtonProps {
  onNavigateTo: (tab: string) => void;
  onOpenNewLead: () => void;
  onOpenNewAgendamento: () => void;
  onOpenNewAutomacao: () => void;
}

export default function FloatingActionButton({
  onNavigateTo,
  onOpenNewLead,
  onOpenNewAgendamento,
  onOpenNewAutomacao,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: "Novo Lead",
      icon: <Users className="h-4 w-4" />,
      action: () => {
        onOpenNewLead();
        setIsOpen(false);
      },
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Agendar",
      icon: <Calendar className="h-4 w-4" />,
      action: () => {
        onOpenNewAgendamento();
        setIsOpen(false);
      },
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      label: "Automação",
      icon: <Zap className="h-4 w-4" />,
      action: () => {
        onOpenNewAutomacao();
        setIsOpen(false);
      },
      color: "bg-amber-500 hover:bg-amber-600",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col-reverse gap-3 mb-3"
            >
              {actions.map((action, index) => (
                <Tooltip key={action.label}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        size="lg"
                        onClick={action.action}
                        className={`h-12 w-12 rounded-full shadow-lg ${action.color} text-white`}
                      >
                        {action.icon}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{action.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              onClick={() => setIsOpen(!isOpen)}
              className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transition-all"
              aria-label={isOpen ? "Fechar menu de ações" : "Abrir menu de ações"}
            >
              <motion.div
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? "Fechar" : "Ações Rápidas"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
