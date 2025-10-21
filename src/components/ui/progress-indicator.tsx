import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Step {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep?: number;
  orientation?: "horizontal" | "vertical";
}

/**
 * Indicador de progresso para multi-step flows
 */
export function ProgressIndicator({
  steps,
  currentStep = 0,
  orientation = "horizontal",
}: ProgressIndicatorProps) {
  if (orientation === "vertical") {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.completed
                    ? "bg-primary border-primary"
                    : index === currentStep
                    ? "border-primary bg-background"
                    : "border-muted bg-background"
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {step.completed ? (
                  <Check className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <span
                    className={
                      index === currentStep ? "text-primary font-semibold" : "text-muted-foreground"
                    }
                  >
                    {index + 1}
                  </span>
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-12 mt-2 ${
                    step.completed ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pb-8">
              <h4
                className={`font-medium ${
                  index === currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </h4>
              {step.description && (
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step.completed
                  ? "bg-primary border-primary"
                  : index === currentStep
                  ? "border-primary bg-background"
                  : "border-muted bg-background"
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {step.completed ? (
                <Check className="h-5 w-5 text-primary-foreground" />
              ) : (
                <span
                  className={
                    index === currentStep ? "text-primary font-semibold" : "text-muted-foreground"
                  }
                >
                  {index + 1}
                </span>
              )}
            </motion.div>
            <span
              className={`text-xs mt-2 text-center ${
                index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
          </motion.div>
          {index < steps.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`h-0.5 flex-1 mx-2 ${step.completed ? "bg-primary" : "bg-muted"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Progress bar simples com animação
 */
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "error";
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  variant = "default",
}: ProgressBarProps) {
  const colors = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-destructive",
  };

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && <span className="text-muted-foreground">{progress}%</span>}
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colors[variant]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/**
 * Circular progress indicator
 */
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(progress)}%</span>
        {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
      </div>
    </div>
  );
}
