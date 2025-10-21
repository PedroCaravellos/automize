import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
}

/**
 * Componente para animar entrada de seções
 * Usa framer-motion para animações suaves
 */
export function AnimatedSection({
  children,
  delay = 0,
  className = "",
  direction = "up",
  once = true,
}: AnimatedSectionProps) {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  const variants = {
    hidden: {
      opacity: 0,
      ...directions[direction],
    } as any,
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    } as any,
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-100px" }}
      variants={variants}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

/**
 * Componente para animar listas com stagger effect
 */
export function AnimatedList({
  children,
  className = "",
  staggerDelay = 0.05,
}: AnimatedListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 } as any,
    visible: { opacity: 1, y: 0 } as any,
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Fade in simples e rápido
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.3,
  className = "",
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Scale in com bounce effect
 */
export function ScaleIn({
  children,
  delay = 0,
  className = "",
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
