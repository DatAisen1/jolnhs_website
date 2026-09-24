import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}

const VARIANT_CLASSES = {
  primary: "bg-primary text-white hover:bg-primary-600 focus-visible:outline-primary",
  secondary: "border border-border bg-white text-text-primary hover:bg-background focus-visible:outline-primary",
  danger: "bg-status-error text-white hover:bg-status-error-text focus-visible:outline-status-error",
  ghost: "text-text-secondary hover:bg-background hover:text-text-primary focus-visible:outline-primary",
} as const;

export function AdminButton({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...props
}: AdminButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-small font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
