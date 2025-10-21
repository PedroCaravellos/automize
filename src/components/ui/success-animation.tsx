import { motion } from "framer-motion";
import { Check, X, AlertTriangle, Info } from "lucide-react";

interface SuccessAnimationProps {
  type?: "success" | "error" | "warning" | "info";
  message?: string;
  onComplete?: () => void;
}

/**
 * Animação de sucesso/erro/warning/info
 * Útil para feedback após ações
 */
export function SuccessAnimation({
  type = "success",
  message,
  onComplete,
}: SuccessAnimationProps) {
  const config = {
    success: {
      icon: Check,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success",
    },
    error: {
      icon: X,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning",
    },
    info: {
      icon: Info,
      color: "text-info",
      bgColor: "bg-info/10",
      borderColor: "border-info",
    },
  };

  const { icon: Icon, color, bgColor, borderColor } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onAnimationComplete={onComplete}
      className="flex flex-col items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className={`w-20 h-20 rounded-full ${bgColor} border-4 ${borderColor} flex items-center justify-center mb-4`}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.3,
          }}
        >
          <Icon className={`h-10 w-10 ${color}`} />
        </motion.div>
      </motion.div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

/**
 * Checkmark animado simples
 */
export function AnimatedCheckmark({ size = 64 }: { size?: number }) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 } as any,
    visible: { pathLength: 1, opacity: 1 } as any,
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      initial="hidden"
      animate="visible"
      className="text-success"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        variants={draw}
        transition={{ duration: 1.5 }}
      />
      <motion.path
        d="M7 12l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={draw}
        transition={{ duration: 1.5 }}
      />
    </motion.svg>
  );
}

/**
 * Confetti celebração
 */
export function ConfettiCelebration() {
  const confettiColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: confettiColors[i % confettiColors.length],
            left: `${Math.random() * 100}%`,
            top: "-5%",
          }}
          initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 500,
            rotate: Math.random() * 720,
            opacity: 0,
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
