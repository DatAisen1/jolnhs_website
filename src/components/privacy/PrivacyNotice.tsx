import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

/**
 * One-line personal-data notice for pages that show staff or student
 * names and photos. Links the page's people content to the full Data
 * Privacy Notice so a data subject (or parent) can always find the
 * correction/removal path in one click.
 */
export function PrivacyNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 text-small text-text-secondary ${className}`}
    >
      <ShieldCheck
        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <span>
        Names and photos shown here are published for school information
        purposes with the consent of the individuals (or their
        parents/guardians). To request a correction or removal, see our{" "}
        <Link
          to="/privacy-policy"
          className="font-medium text-primary underline underline-offset-2 hover:text-primary-600"
        >
          Data Privacy Notice
        </Link>
        .
      </span>
    </p>
  );
}
