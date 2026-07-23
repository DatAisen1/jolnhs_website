import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Enforces the 1280px content width consistently across every section,
 * so no section ever hardcodes its own max-width or side padding.
 */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-content px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}
