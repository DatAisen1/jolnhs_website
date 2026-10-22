import type { JSX } from "react";

/**
 * OrigamiIcon — the site's hero emblem system.
 *
 * Every interior page hero carries a hand-authored ORIGAMI-style
 * emblem: paper built from flat, faceted polygons (folded-paper
 * shading) rather than stroke icons. Facet palette mimics one light
 * source — top facets brightest (#F7FBFF), mid facets sky tints,
 * down-facing folds the deepest blue (#5BA9DC) — in the site's navy
 * + sky-blue (#8ACFF8 family) brand, with navy for small details.
 *
 * These are decorative by contract: always aria-hidden, no title.
 * The page's heading carries the meaning.
 */

const paper = {
  lightest: "#F7FBFF",
  light: "#E3F2FC",
  mid: "#C7E6FA",
  shade: "#A6D7F6",
  deep: "#7FC2EE",
  deepest: "#5BA9DC",
  navy: "#1E3A6E",
  pale: "#8ACFF8",
} as const;

export const ORIGAMI_ICONS = {
  /* Academics landing + Senior High — graduation cap */
  mortarboard: (
    <>
      <polygon points="32,10 8,26 32,26" fill={paper.light} />
      <polygon points="32,10 56,26 32,26" fill={paper.lightest} />
      <polygon points="8,26 32,26 32,42" fill={paper.mid} />
      <polygon points="56,26 32,26 32,42" fill={paper.shade} />
      <polygon points="20,34 32,42 32,52 20,44" fill={paper.deep} />
      <polygon points="20,34 32,42 44,34 32,42" fill={paper.mid} />
      <polygon points="44,34 44,44 32,52 32,42" fill={paper.deepest} />
      <polygon points="56,26 56,40 53.5,40 53.5,26" fill={paper.mid} />
      <polygon points="56,40 58,46 54,46" fill={paper.lightest} />
      <circle cx="56" cy="48" r="2.2" fill={paper.light} />
    </>
  ),

  /* About / Our Story */
  school: (
    <>
      <polygon points="32,4 44,7.5 32,10.5" fill={paper.pale} />
      <polygon points="31.4,4 32.6,4 32.6,13 31.4,13" fill={paper.navy} />
      <polygon points="32,12 10,28 32,28" fill={paper.light} />
      <polygon points="32,12 54,28 32,28" fill={paper.lightest} />
      <polygon points="14,28 32,28 32,52 14,52" fill={paper.mid} />
      <polygon points="32,28 50,28 50,52 32,52" fill={paper.shade} />
      <polygon points="14,28 32,28 32,32 14,32" fill={paper.light} />
      <polygon points="32,28 50,28 50,32 32,32" fill={paper.lightest} />
      <polygon points="27,52 27,42 37,42 37,52" fill={paper.navy} />
      <polygon points="27,42 32,38 37,42" fill={paper.deepest} />
      <polygon points="18,34 24,34 24,39 18,39" fill={paper.light} />
      <polygon points="40,34 46,34 46,39 40,39" fill={paper.lightest} />
    </>
  ),

  /* Faculty & Staff — the owl of guidance */
  owl: (
    <>
      <polygon points="18,16 26,5 29,17" fill={paper.shade} />
      <polygon points="46,16 38,5 35,17" fill={paper.deep} />
      <polygon points="32,10 14,28 32,28" fill={paper.lightest} />
      <polygon points="32,10 50,28 32,28" fill={paper.light} />
      <polygon points="14,28 32,28 32,55" fill={paper.mid} />
      <polygon points="50,28 32,28 32,55" fill={paper.shade} />
      <polygon points="14,28 10,42 16,44 18,32" fill={paper.deep} />
      <polygon points="50,28 54,42 48,44 46,32" fill={paper.deepest} />
      <polygon points="32,30 26,26 38,26" fill={paper.lightest} />
      <circle cx="25" cy="26" r="4.2" fill={paper.light} />
      <circle cx="39" cy="26" r="4.2" fill={paper.lightest} />
      <circle cx="25" cy="26" r="2.2" fill={paper.navy} />
      <circle cx="39" cy="26" r="2.2" fill={paper.navy} />
      <polygon points="32,30 28,27 36,27" fill={paper.deepest} />
    </>
  ),

  /* Budget Transparency — the origami piggy bank */
  piggy: (
    <>
      <polygon points="50,8 50,15 47,15 47,9" fill={paper.navy} />
      <circle cx="48.5" cy="7" r="3" fill={paper.lightest} stroke={paper.navy} strokeWidth="1" />
      <polygon points="27,17 33,8 36,19" fill={paper.shade} />
      <polygon points="16,24 32,16 32,33" fill={paper.lightest} />
      <polygon points="32,16 50,24 32,33" fill={paper.light} />
      <polygon points="16,24 32,33 16,46" fill={paper.mid} />
      <polygon points="50,24 32,33 50,44 32,33" fill={paper.light} opacity="0" />
      <polygon points="16,24 32,33 50,24 50,42 34,50 16,46" fill="none" />
      <polygon points="16,46 32,33 32,50" fill={paper.mid} />
      <polygon points="50,24 32,33 32,50 50,42" fill={paper.shade} />
      <polygon points="16,24 16,46 10,44 12,26" fill={paper.deep} />
      <circle cx="13" cy="32" r="4.5" fill={paper.lightest} />
      <circle cx="11.5" cy="31.5" r="1.1" fill={paper.navy} />
      <circle cx="14.5" cy="31.5" r="1.1" fill={paper.navy} />
      <polygon points="31.5,18 33,18 45,22.5 43.5,22.5" fill={paper.navy} />
      <polygon points="22,50 28,50 25,56" fill={paper.deep} />
      <polygon points="38,50 44,48 42,56" fill={paper.deepest} />
      <polyline points="50,28 54,26 56,29" fill="none" stroke={paper.navy} strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),

  /* Campus Life landing */
  kite: (
    <>
      <polygon points="32,5 14,29 32,29" fill={paper.lightest} />
      <polygon points="32,5 32,29 50,29" fill={paper.light} />
      <polygon points="14,29 32,29 32,43" fill={paper.mid} />
      <polygon points="50,29 32,29 32,43" fill={paper.shade} />
      <line x1="32" y1="5" x2="32" y2="43" stroke={paper.navy} strokeWidth="0.9" opacity="0.5" />
      <line x1="14" y1="29" x2="50" y2="29" stroke={paper.navy} strokeWidth="0.9" opacity="0.5" />
      <path d="M32,43 Q27,50 31,56" fill="none" stroke={paper.navy} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <polygon points="31,47 26,49 31,53" fill={paper.pale} />
      <polygon points="31,53 36,55 31,57" fill={paper.shade} />
    </>
  ),

  /* Student Organizations */
  star: (
    <>
      <polygon points="32,6 38,23 45,22 34,32 26,32 19,22 26,23" fill={paper.lightest} />
      <polygon points="45,22 57,23 43,32 34,32" fill={paper.light} />
      <polygon points="57,23 43,32 40,45 32,40 34,32" fill={paper.mid} />
      <polygon points="40,45 48,52 32,44 32,40" fill={paper.shade} />
      <polygon points="48,52 32,44 16,52 24,45 32,40" fill={paper.mid} opacity="0" />
      <polygon points="32,44 16,52 24,36 26,32 32,40" fill={paper.shade} />
      <polygon points="16,52 24,36 21,26 26,32" fill={paper.deep} />
      <polygon points="19,22 7,23 21,31 26,32" fill={paper.light} />
      <polygon points="7,23 21,31 26,32" fill={paper.mid} />
      <polygon points="57,23 43,32" fill={paper.mid} opacity="0" />
      <polygon points="43,32 40,45" fill={paper.mid} opacity="0" />
    </>
  ),

  /* PTA + SNED — care and partnership */
  heart: (
    <>
      <polygon points="32,16 20,7 32,32" fill={paper.light} />
      <polygon points="32,16 44,7 32,32" fill={paper.lightest} />
      <polygon points="20,7 7,14 32,32" fill={paper.mid} />
      <polygon points="44,7 57,14 32,32" fill={paper.lightest} opacity="0.85" />
      <polygon points="7,14 7,27 32,54 32,32" fill={paper.mid} />
      <polygon points="7,27 32,54 32,44" fill={paper.deep} />
      <polygon points="57,14 57,27 32,54 32,32" fill={paper.shade} />
      <polygon points="57,27 32,54 32,44" fill={paper.deepest} />
    </>
  ),

  /* Athletics */
  trophy: (
    <>
      <polygon points="18,10 46,10 46,14 18,14" fill={paper.light} />
      <polygon points="18,14 32,14 32,32 20,32" fill={paper.lightest} />
      <polygon points="32,14 46,14 44,32 32,32" fill={paper.mid} />
      <polygon points="18,14 8,16 10,26 18,24" fill={paper.mid} />
      <polygon points="8,16 6,22 10,26" fill={paper.deep} />
      <polygon points="46,14 56,16 54,26 46,24" fill={paper.shade} />
      <polygon points="56,16 58,22 54,26" fill={paper.deepest} />
      <polygon points="29,32 35,32 36,42 28,42" fill={paper.deep} />
      <polygon points="24,42 40,42 40,48 24,48" fill={paper.mid} />
      <polygon points="32,42 40,42 40,48 32,48" fill={paper.shade} />
      <polygon points="20,48 44,48 46,54 18,54" fill={paper.deep} />
      <polygon points="32,48 44,48 46,54 32,54" fill={paper.deepest} />
      <polygon points="32,18 34,22 30,22" fill={paper.navy} />
      <polygon points="32,22 30,22 32,26 34,22" fill={paper.navy} opacity="0.85" />
    </>
  ),

  /* Journalism / travel of ideas */
  plane: (
    <>
      <polygon points="8,28 56,12 30,36" fill={paper.lightest} />
      <polygon points="8,28 30,36 22,42" fill={paper.mid} />
      <polygon points="8,28 14,33 22,42" fill={paper.light} />
      <polygon points="30,36 56,12 36,55" fill={paper.mid} />
      <polygon points="36,55 30,36 27,44" fill={paper.shade} />
      <polygon points="30,36 36,55 41,40" fill={paper.deep} opacity="0.6" />
      <line x1="30" y1="36" x2="56" y2="12" stroke={paper.navy} strokeWidth="0.8" opacity="0.35" />
    </>
  ),

  /* Campus Journalists section */
  newspaper: (
    <>
      <polygon points="50,16 57,18 57,46 50,48" fill={paper.shade} />
      <polygon points="14,10 50,10 50,48 14,48" fill={paper.lightest} />
      <polygon points="14,10 22,10 22,48 14,48" fill={paper.mid} />
      <polygon points="42,10 50,10 50,18 42,18" fill={paper.light} />
      <polygon points="50,10 50,18 44,18 42,10" fill={paper.mid} opacity="0.7" />
      <rect x="26" y="16" width="18" height="10" fill={paper.pale} />
      <polygon points="26,26 44,26 44,28 26,28" fill={paper.navy} opacity="0.75" />
      <rect x="26" y="31" width="18" height="2" fill={paper.navy} opacity="0.45" />
      <rect x="26" y="35" width="18" height="2" fill={paper.navy} opacity="0.45" />
      <rect x="26" y="39" width="12" height="2" fill={paper.navy} opacity="0.45" />
    </>
  ),

  /* Campus Gallery section */
  camera: (
    <>
      <polygon points="20,20 25,12 39,12 44,20" fill={paper.lightest} />
      <polygon points="39,12 44,20 32,20 32,12" fill={paper.light} />
      <polygon points="10,20 32,20 32,48 10,48" fill={paper.light} />
      <polygon points="32,20 54,20 54,48 32,48" fill={paper.mid} />
      <polygon points="10,20 54,20 54,24 10,24" fill={paper.shade} opacity="0.55" />
      <polygon points="32,26 40,30 40,38 32,42 24,38 24,30" fill={paper.navy} />
      <polygon points="32,29 37,31.5 37,36.5 32,39 27,36.5 27,31.5" fill={paper.shade} />
      <polygon points="31,30.5 34,32 32,34 29,33" fill={paper.lightest} />
      <rect x="46" y="27" width="4.5" height="4.5" fill={paper.navy} />
    </>
  ),

  /* STE — science, technology, engineering */
  rocket: (
    <>
      <polygon points="32,5 23,19 32,19" fill={paper.lightest} />
      <polygon points="32,5 41,19 32,19" fill={paper.light} />
      <polygon points="23,19 32,19 32,42 23,38" fill={paper.light} />
      <polygon points="41,19 32,19 32,42 41,38" fill={paper.mid} />
      <polygon points="23,19 32,19 32,24 23,24" fill={paper.lightest} />
      <polygon points="32,19 41,19 41,24 32,24" fill={paper.light} opacity="0.6" />
      <polygon points="23,36 14,49 23,44" fill={paper.deep} />
      <polygon points="41,36 50,49 41,44" fill={paper.deepest} />
      <circle cx="32" cy="29" r="4.6" fill={paper.navy} />
      <circle cx="32" cy="29" r="3.1" fill={paper.pale} />
      <polygon points="31,27.5 33.5,28.5 31.5,30" fill={paper.lightest} />
      <polygon points="28,44 36,44 32,57" fill={paper.mid} />
      <polygon points="30,44 34,44 32,51" fill={paper.lightest} />
      <polygon points="32,44 36,44 32,57" fill={paper.shade} />
    </>
  ),

  /* SP-ICT — computing */
  mouse: (
    <>
      <path d="M38,13 Q46,4 54,8" fill="none" stroke={paper.pale} strokeWidth="1.6" strokeLinecap="round" />
      <polygon points="32,13 24,13 18,21 32,27" fill={paper.lightest} />
      <polygon points="32,13 40,13 46,21 32,27" fill={paper.light} />
      <polygon points="18,21 32,27 32,54 18,45" fill={paper.mid} />
      <polygon points="46,21 32,27 32,54 46,45" fill={paper.shade} />
      <rect x="31.1" y="15.5" width="1.8" height="7" fill={paper.navy} />
      <line x1="18" y1="27" x2="46" y2="27" stroke={paper.navy} strokeWidth="0.9" opacity="0.4" />
    </>
  ),

  /* Regular Program — the open book */
  book: (
    <>
      <polygon points="32,15 11,8 11,40 32,49" fill={paper.light} />
      <polygon points="11,8 32,15 32,28 11,22" fill={paper.lightest} />
      <polygon points="32,15 53,8 53,40 32,49" fill={paper.mid} />
      <polygon points="53,8 32,15 32,28 53,22" fill={paper.light} opacity="0.85" />
      <polygon points="32,11 33,13 33,52 32,54 31,52 31,13" fill={paper.navy} opacity="0.7" />
      <line x1="15" y1="18" x2="27" y2="21.5" stroke={paper.navy} strokeWidth="1.5" opacity="0.4" />
      <line x1="15" y1="23" x2="27" y2="26.5" stroke={paper.navy} strokeWidth="1.5" opacity="0.4" />
      <line x1="15" y1="30" x2="26" y2="33.2" stroke={paper.navy} strokeWidth="1.2" opacity="0.3" />
      <line x1="37" y1="21.5" x2="49" y2="18" stroke={paper.navy} strokeWidth="1.5" opacity="0.4" />
      <line x1="37" y1="26.5" x2="49" y2="23" stroke={paper.navy} strokeWidth="1.5" opacity="0.4" />
      <line x1="38" y1="33.2" x2="49" y2="30" stroke={paper.navy} strokeWidth="1.2" opacity="0.3" />
    </>
  ),

  /* Contact Us */
  envelope: (
    <>
      <polygon points="8,18 56,18 56,48 8,48" fill={paper.mid} />
      <polygon points="8,18 32,35 56,18" fill={paper.lightest} />
      <polygon points="8,18 32,35 32,38 8,48" fill={paper.mid} />
      <polygon points="56,18 32,35 32,38 56,48" fill={paper.shade} />
      <polygon points="8,48 32,34 56,48" fill={paper.light} />
      <polygon points="32,34 56,48 44,48 32,40" fill={paper.mid} opacity="0.5" />
    </>
  ),

  /* Downloads — the origami masu box */
  box: (
    <>
      <polygon points="32,15 12,25 32,32" fill={paper.lightest} />
      <polygon points="32,15 52,25 32,32" fill={paper.light} />
      <polygon points="12,25 32,32 32,39" fill={paper.mid} />
      <polygon points="52,25 32,32 32,39" fill={paper.shade} />
      <polygon points="20,26.5 32,30 44,26.5 32,23" fill={paper.navy} opacity="0.8" />
      <polygon points="12,25 12,41 32,50 32,39" fill={paper.deep} />
      <polygon points="12,25 32,32 32,39 12,32" fill={paper.mid} />
      <polygon points="52,25 52,41 32,50 32,39" fill={paper.deepest} />
      <polygon points="52,25 32,32 32,39 52,32" fill={paper.shade} />
      <polygon points="12,41 32,50 32,55 12,46" fill={paper.mid} />
      <polygon points="52,41 32,50 32,55 52,46" fill={paper.shade} opacity="0.6" />
    </>
  ),

  /* News & Announcements */
  megaphone: (
    <>
      <polygon points="12,24 27,32 12,40" fill={paper.lightest} />
      <polygon points="12,24 42,13 27,32" fill={paper.light} />
      <polygon points="12,40 42,47 27,32" fill={paper.mid} />
      <polygon points="42,13 49,11 49,45 42,47" fill={paper.light} />
      <polygon points="42,13 49,11 49,28 42,30" fill={paper.lightest} opacity="0.8" />
      <polygon points="49,11 52,13 52,43 49,45" fill={paper.shade} />
      <polygon points="12,28 16,28 16,44 12,44" fill={paper.navy} />
      <polygon points="12,40 16,40 16,44 12,44" fill={paper.navy} />
      <path d="M55,20 Q61,22 61,29" fill="none" stroke={paper.pale} strokeWidth="2" strokeLinecap="round" />
      <path d="M57,34 Q60,32 60,29" fill="none" stroke={paper.pale} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <path d="M55,38 Q57,36 57,34" fill="none" stroke={paper.pale} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </>
  ),

  /* Data Privacy */
  shield: (
    <>
      <polygon points="32,7 12,15 32,24" fill={paper.lightest} />
      <polygon points="32,7 52,15 32,24" fill={paper.light} />
      <polygon points="12,15 32,24 32,55 12,34" fill={paper.mid} />
      <polygon points="52,15 32,24 32,55 52,34" fill={paper.shade} />
      <polyline points="23,32 30,40 42,24" fill="none" stroke={paper.navy} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  /* Cookie Policy */
  cookie: (
    <>
      <polygon points="32,10 47,16 32,30" fill={paper.lightest} />
      <polygon points="47,16 52,30 32,30" fill={paper.light} />
      <polygon points="52,30 47,45 32,30" fill={paper.mid} />
      <polygon points="47,45 32,52 32,30" fill={paper.shade} />
      <polygon points="32,52 17,45 32,30" fill={paper.mid} />
      <polygon points="17,45 12,30 32,30" fill={paper.shade} opacity="0.7" />
      <polygon points="12,30 17,16 32,30" fill={paper.light} />
      <polygon points="17,16 32,10 32,30" fill={paper.mid} opacity="0.6" />
      <circle cx="26" cy="22" r="2.6" fill={paper.navy} />
      <circle cx="38" cy="20" r="2.4" fill={paper.navy} />
      <circle cx="41" cy="33" r="2.6" fill={paper.navy} />
      <circle cx="31" cy="41" r="2.4" fill={paper.navy} />
      <circle cx="20" cy="34" r="2.2" fill={paper.navy} />
      <circle cx="27" cy="32" r="2" fill={paper.navy} opacity="0.8" />
    </>
  ),

  /* Enroll — beginnings: the origami crane */
  crane: (
    <>
      <polygon points="19,33 36,25 44,38 27,45" fill={paper.light} />
      <polygon points="19,33 36,25 27,38" fill={paper.lightest} />
      <polygon points="36,25 44,38 27,45 27,38" fill={paper.mid} />
      <polygon points="27,30 38,11 42,35" fill={paper.lightest} />
      <polygon points="31,27 38,11 40,30" fill={paper.light} opacity="0.7" />
      <polygon points="19,33 10,20 12,16 24,30" fill={paper.lightest} />
      <polygon points="10,20 8,14 15,18" fill={paper.mid} />
      <polygon points="10,20 5,20 8,17" fill={paper.navy} />
      <polygon points="44,38 55,29 47,42" fill={paper.shade} />
      <polygon points="44,38 50,44 40,44" fill={paper.deep} opacity="0.6" />
      <path d="M20,50 Q32,55 44,50" fill="none" stroke={paper.pale} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    </>
  ),
} satisfies Record<string, JSX.Element>;

export type OrigamiIconName = keyof typeof ORIGAMI_ICONS;

export function OrigamiIcon({
  name,
  className = "h-16 w-16",
}: {
  name: OrigamiIconName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      {ORIGAMI_ICONS[name]}
    </svg>
  );
}
