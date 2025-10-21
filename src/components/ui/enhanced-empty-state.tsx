import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EnhancedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: "default" | "compact" | "illustration";
  illustration?: React.ReactNode;
  tips?: string[];
}

export function EnhancedEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = "default",
  illustration,
  tips,
}: EnhancedEmptyStateProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 } as any,
    visible: { opacity: 1, y: 0 } as any,
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 } as any,
    visible: { opacity: 1, y: 0 } as any,
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 } as any,
    visible: { scale: 1, rotate: 0 } as any,
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col items-center justify-center py-8 text-center"
      >
      <motion.div
        variants={iconVariants}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="rounded-full bg-muted p-4 mb-3"
      >
        <Icon className="h-8 w-8 text-muted-foreground" />
      </motion.div>
        <motion.h3 variants={itemVariants} className="text-lg font-semibold mb-1">
          {title}
        </motion.h3>
        <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-4 max-w-sm">
          {description}
        </motion.p>
        {actionLabel && onAction && (
          <motion.div variants={itemVariants}>
            <Button onClick={onAction} size="sm" className="hover-scale">
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <Card className="border-dashed border-2">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col items-center justify-center p-12 text-center"
      >
        {illustration ? (
          <motion.div variants={iconVariants} className="mb-6">
            {illustration}
          </motion.div>
        ) : (
          <motion.div
            variants={iconVariants}
            className="rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 p-6 mb-6"
          >
            <Icon className="h-12 w-12 text-primary" />
          </motion.div>
        )}

        <motion.h3 variants={itemVariants} className="text-2xl font-bold mb-2">
          {title}
        </motion.h3>
        
        <motion.p variants={itemVariants} className="text-muted-foreground mb-6 max-w-md">
          {description}
        </motion.p>

        {tips && tips.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-muted/50 rounded-lg p-4 mb-6 max-w-md"
          >
            <p className="text-sm font-medium mb-2">💡 Dicas:</p>
            <ul className="text-sm text-left space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="text-muted-foreground">
                  • {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="flex gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} size="lg" className="hover-scale">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size="lg"
              className="hover-scale"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      </motion.div>
    </Card>
  );
}
