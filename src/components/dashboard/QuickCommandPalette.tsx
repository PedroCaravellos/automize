import { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Plus,
  Calendar,
  Bot,
  Zap,
  Users,
  Search,
  BarChart3,
  Settings,
  PlayCircle,
} from "lucide-react";

interface QuickCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand: (command: string, data?: any) => void;
  leads?: any[];
  negocios?: any[];
  chatbots?: any[];
  automacoes?: any[];
}

export default function QuickCommandPalette({
  open,
  onOpenChange,
  onCommand,
  leads = [],
  negocios = [],
  chatbots = [],
  automacoes = [],
}: QuickCommandPaletteProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = useCallback(
    (callback: () => void) => {
      onOpenChange(false);
      callback();
    },
    [onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Digite um comando ou busque..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Ações Rápidas">
          <CommandItem
            onSelect={() =>
              handleSelect(() => onCommand("novo-lead"))
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Novo Lead</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">Ctrl</span>N
            </kbd>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => onCommand("novo-agendamento"))
            }
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Novo Agendamento</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">Ctrl</span>A
            </kbd>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => onCommand("nova-automacao"))
            }
          >
            <Zap className="mr-2 h-4 w-4" />
            <span>Nova Automação</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">Ctrl</span>M
            </kbd>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => onCommand("testar-chatbot"))
            }
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Testar Chatbot</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">Ctrl</span>B
            </kbd>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navegação">
          <CommandItem
            onSelect={() => handleSelect(() => onCommand("nav-overview"))}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Visão Geral</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onCommand("nav-negocios"))}
          >
            <Bot className="mr-2 h-4 w-4" />
            <span>Meus Negócios</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onCommand("nav-chatbots"))}
          >
            <Bot className="mr-2 h-4 w-4" />
            <span>Chatbots</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onCommand("nav-crm"))}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Leads/CRM</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onCommand("nav-agendamentos"))}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Agendamentos</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onCommand("nav-automacoes"))}
          >
            <Zap className="mr-2 h-4 w-4" />
            <span>Automações</span>
          </CommandItem>
        </CommandGroup>

        {leads.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Leads Recentes">
              {leads.slice(0, 5).map((lead) => (
                <CommandItem
                  key={lead.id}
                  onSelect={() =>
                    handleSelect(() => onCommand("open-lead", lead))
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{lead.nome}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {lead.telefone}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {chatbots.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Chatbots">
              {chatbots.slice(0, 3).map((chatbot) => (
                <CommandItem
                  key={chatbot.id}
                  onSelect={() =>
                    handleSelect(() => onCommand("open-chatbot", chatbot))
                  }
                >
                  <Bot className="mr-2 h-4 w-4" />
                  <span>{chatbot.nome}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
