import type { HTMLAttributes, ReactNode } from "react";

interface AdminCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "div" | "section";
}

export function AdminCard({ children, as = "div", className = "", ...props }: AdminCardProps) {
  const Component = as;
  return (
    <Component {...props} className={`rounded-lg border border-border bg-white p-4 sm:p-5 ${className}`}>
      {children}
    </Component>
  );
}
