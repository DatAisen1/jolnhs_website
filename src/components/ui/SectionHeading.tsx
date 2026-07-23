interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean; // true when placed on a dark background
}

/**
 * Enforces consistent heading typography/spacing across every section, and
 * keeps heading level (h2) consistent for a correct document outline —
 * individual sections should never render their own raw <h2>/<h3>.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  light = false,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  const eyebrowColor = light ? "text-blue-200" : "text-secondary";
  const titleColor = light ? "text-white" : "text-text-primary";
  const subtitleColor = light ? "text-blue-100" : "text-text-secondary";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow && (
        <p
          className={`mb-3 text-small font-semibold uppercase tracking-widest ${eyebrowColor}`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={`text-section ${titleColor}`}>{title}</h2>
      {subtitle && (
        <p className={`mt-4 text-body ${subtitleColor}`}>{subtitle}</p>
      )}
    </div>
  );
}
