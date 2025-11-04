import { Button } from "@/components/ui/button";
import { Bot, Plus } from "lucide-react";

interface ChatbotsSectionHeaderProps {
  onCreateClick: () => void;
}

export function ChatbotsSectionHeader({ onCreateClick }: ChatbotsSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Chatbots</h2>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Criar Chatbot
      </Button>
    </div>
  );
}
