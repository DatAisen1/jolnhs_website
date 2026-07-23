import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
}

/**
 * Base card shell (surface, border, radius, padding, shadow-on-hover)
 * shared by program cards, feature cards, and news cards, so visual
 * consistency doesn't depend on each section re-implementing it.
 */
export function Card({ children, className = "", as = "div" }: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={`rounded-card border border-border bg-surface p-card shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}
    >
      {children}
    </Tag>
  );
}
