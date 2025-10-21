import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibleIconProps {
  icon: LucideIcon;
  label: string;
  decorative?: boolean;
  className?: string;
}

/**
 * Wrapper para ícones com suporte a acessibilidade
 * Garante que ícones tenham labels apropriados
 */
export function AccessibleIcon({ 
  icon: Icon, 
  label, 
  decorative = false,
  className 
}: AccessibleIconProps) {
  return (
    <>
      <Icon 
        className={cn(className)}
        aria-hidden={decorative ? "true" : undefined}
        aria-label={!decorative ? label : undefined}
        role={!decorative ? "img" : undefined}
      />
      {!decorative && <span className="sr-only">{label}</span>}
    </>
  );
}
