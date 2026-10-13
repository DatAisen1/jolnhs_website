import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "outline" | "outlinePrimary" | "white" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string; // when provided, renders as a router <Link> (or a plain
  // <a> for external/mailto/tel URLs) styled identically to <button>
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-600 focus-visible:outline-white",
  secondary:
    "border-2 border-primary bg-secondary text-primary hover:bg-primary-50 focus-visible:outline-primary",
  // For dark backgrounds — white border that fills on hover
  outline:
    "border-2 border-white text-white hover:bg-white hover:text-primary",
  // For light backgrounds — brand outline that fills on hover
  outlinePrimary:
    "border-2 border-primary text-primary hover:bg-primary hover:text-white focus-visible:outline-primary",
  // For dark backgrounds — solid white pill (inverts the primary style)
  white:
    "bg-white text-primary hover:brightness-95 focus-visible:outline-white",
  ghost: "text-primary hover:bg-primary-50",
};

type Size = "md" | "sm";

const sizeStyles: Record<Size, string> = {
  md: "gap-2 px-8 py-3 text-body",
  sm: "gap-2 px-6 py-3 text-small",
};

/**
 * Single Button component for the whole site. Every CTA (hero, enrollment
 * banner, cards) renders through this component so hover/focus/disabled
 * states stay consistent — never hand-roll a one-off <button> elsewhere.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-300 ease-apple focus-visible:outline-2 focus-visible:outline-offset-2";
  const classes = `${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    // External links (full URLs) and mailto/tel links must stay real
    // anchors — React Router's <Link> only handles in-app routes.
    // Everything else (every internal /path used across this site) goes
    // through <Link> so navigation is a client-side route swap instead
    // of a full page reload.
    const isExternal = /^([a-z]+:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);

    if (isExternal) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}