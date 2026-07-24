interface SchoolBadgeProps {
  label: string;
  ariaLabel: string;
  tone?: "primary" | "primary-600";
  size?: number;
  /** Real logo image path (e.g. "/images/logo-jolnhs.png"). When provided,
   *  renders the actual image instead of the placeholder shield SVG. */
  src?: string;
}

/**
 * SchoolBadge
 *
 * WHAT: A simple layered shield/seal SVG standing in for a real school
 *       crest or partner seal (e.g. DepEd).
 * WHY:  A plain circle with initials reads as an unfinished wireframe.
 *       A shield silhouette with a inner ring reads as "designed, waiting
 *       on the real artwork" — a small effort/perception gap that matters
 *       a lot on a first-impression page like a homepage.
 * WHEN: Anywhere the school crest or a partner seal appears (header,
 *       footer, milestone section) — always swap via `label`, never
 *       duplicate this markup by hand.
 * WHEN NOT: Don't use this for arbitrary decorative icons — reach for
 *           lucide-react instead; this is specifically for crest-style badges.
 */
export function SchoolBadge({ label, ariaLabel, tone = "primary", size = 56, src }: SchoolBadgeProps) {
  const colorClass = tone === "primary" ? "text-primary" : "text-primary-600";

  if (src) {
    return (
      <img
        src={src}
        alt={ariaLabel}
        style={{ width: size, height: size }}
        className="rounded-full object-contain"
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      role="img"
      aria-label={ariaLabel}
      className={colorClass}
    >
      <path
        d="M28 2 L52 10 V26 C52 40 42 50 28 54 C14 50 4 40 4 26 V10 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M28 9 L45 15 V26 C45 36.5 38 43.8 28 47 C18 43.8 11 36.5 11 26 V15 Z"
        fill="currentColor"
        opacity="0.08"
      />
      <text
        x="28"
        y="31"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        fontFamily="Inter, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}
