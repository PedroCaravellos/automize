import { cn } from "@/lib/utils";

interface SkipToContentProps {
  targetId?: string;
  label?: string;
}

/**
 * Componente "Pular para o conteúdo principal"
 * Melhora a navegação por teclado permitindo pular a navegação
 */
export function SkipToContent({ 
  targetId = "main-content",
  label = "Pular para o conteúdo principal"
}: SkipToContentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        "sr-only focus:not-sr-only",
        "fixed top-4 left-4 z-[9999]",
        "bg-primary text-primary-foreground",
        "px-4 py-2 rounded-md",
        "font-medium text-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all duration-200"
      )}
    >
      {label}
    </a>
  );
}
