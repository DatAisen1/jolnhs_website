import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { setConsent, useCookieConsent } from "@/lib/consent";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.8384851614747!2d120.8768644!3d15.6002918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396d56bc6c4569f%3A0x38a58219fbe28103!2sJulia%20Ortiz%20Luis%20National%20High%20School!5e0!3m2!1sen!2sus!4v1784873839872";

/**
 * Google Maps embed gated on cookie consent — loading the iframe is
 * what actually sets Google's cookies, so the iframe itself stays out
 * of the DOM until the visitor has said yes (or clicks "Load map",
 * which counts as that yes). "Get Directions" stays usable either way;
 * it's a plain link, not the embed.
 */
export function ConsentGatedMap() {
  const consent = useCookieConsent();

  if (consent === "accepted") {
    return (
      <iframe
        title="Julia Ortiz Luis National High School Location"
        src={MAP_EMBED_URL}
        width="100%"
        height="300"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-3 bg-primary-800/50 px-6 text-center">
      <MapPin className="h-8 w-8 text-secondary-300" aria-hidden="true" />
      <p className="max-w-sm text-small text-secondary-100">
        The map loads Google services and sets their cookies.{" "}
        <Link
          to="/cookie-policy"
          className="font-medium text-secondary-300 underline underline-offset-2 hover:text-white"
        >
          Learn more
        </Link>
      </p>
      <button
        type="button"
        onClick={() => setConsent("accepted")}
        className="rounded-full bg-white px-5 py-2 text-small font-semibold text-primary transition-colors hover:bg-secondary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Load map
      </button>
    </div>
  );
}
