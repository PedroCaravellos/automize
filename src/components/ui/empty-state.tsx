import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 animate-fade-in">
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4 animate-scale-in">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        <div className="flex gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} size="lg" className="hover-scale">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="outline" size="lg" className="hover-scale">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
