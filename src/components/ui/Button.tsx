import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "outlinePrimary" | "white" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string; // when provided, renders as a router <Link> (or a plain
  // <a> for external/mailto/tel URLs) styled identically to <button>
  /** Renders a trailing arrow that slides right on hover — use for
   *  forward-navigation CTAs ("Learn More", "Explore", ...). */
  arrow?: boolean;
}

// Every variant shares the same interactive language: a gentle lift
// with a tinted shadow on hover, a physical press-down on click, and —
// on the two solid-fill variants — a light sheen that sweeps across the
// pill once per hover. All of it rides the shared apple ease curve and
// transition, so buttons feel like one system, and the global
// reduced-motion media query collapses the motion for those users.
const sheen =
  "before:pointer-events-none before:absolute before:inset-y-0 before:-left-1/2 before:w-1/3 before:skew-x-[-25deg] before:blur-md before:transition-transform before:duration-700 motion-safe:hover:before:translate-x-[400%]";
const press = "motion-safe:active:translate-y-px motion-safe:active:scale-[0.97]";
const lift = "motion-safe:hover:-translate-y-0.5";

const variantStyles: Record<Variant, string> = {
  primary:
    `bg-primary text-white hover:bg-primary-600 focus-visible:outline-white ${lift} motion-safe:hover:shadow-lg motion-safe:hover:shadow-primary/40 ${press} ${sheen} before:bg-white/25`,
  secondary:
    `border-2 border-primary bg-secondary text-primary hover:bg-primary-50 focus-visible:outline-primary ${lift} motion-safe:hover:shadow-md motion-safe:hover:shadow-primary/15 ${press}`,
  // For dark backgrounds — white border that fills on hover
  outline:
    `border-2 border-white text-white hover:bg-white hover:text-primary ${lift} motion-safe:hover:shadow-lg motion-safe:hover:shadow-black/20 ${press}`,
  // For light backgrounds — brand outline that fills on hover
  outlinePrimary:
    `border-2 border-primary text-primary hover:bg-primary hover:text-white focus-visible:outline-primary ${lift} motion-safe:hover:shadow-lg motion-safe:hover:shadow-primary/30 ${press}`,
  // For dark backgrounds — solid white pill (inverts the primary style)
  white:
    `bg-white text-primary hover:brightness-95 focus-visible:outline-white ${lift} motion-safe:hover:shadow-lg motion-safe:hover:shadow-black/25 ${press} ${sheen} before:bg-primary-100/70`,
  ghost: `text-primary hover:bg-primary-50 ${press}`,
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
  arrow = false,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full font-semibold transition-[transform,box-shadow,color,background-color,border-color] duration-300 ease-apple before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2";
  const classes = `${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 ease-apple group-hover:translate-x-1"
          aria-hidden="true"
        />
      )}
    </>
  );

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
          {content}
        </a>
      );
    }

    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}