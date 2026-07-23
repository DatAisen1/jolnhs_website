import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  href?: string; // when provided, renders as an <a> styled identically
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-600 focus-visible:outline-white",
  secondary:
    "bg-secondary text-white hover:bg-blue-600 focus-visible:outline-white",
  outline:
    "border-2 border-white text-white hover:bg-white hover:text-primary",
  ghost: "text-primary hover:bg-primary-50",
};

/**
 * Single Button component for the whole site. Every CTA (hero, enrollment
 * banner, cards) renders through this component so hover/focus/disabled
 * states stay consistent — never hand-roll a one-off <button> elsewhere.
 */
export function Button({
  children,
  variant = "primary",
  href,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-body font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2";
  const classes = `${base} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
