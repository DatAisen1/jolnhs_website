import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { sendContactMessage } from "@/lib/data/contact";
import { getErrorMessage } from "@/lib/errors";

const fieldClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-small text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-small font-medium text-text-primary";

const SUBJECTS = [
  "General inquiry",
  "Enrollment / admissions",
  "Student records request",
  "Faculty & staff concern",
  "Other",
];

/**
 * ContactForm — public message form writing straight into the
 * contact_messages inbox (migration 0013). Spam mitigation is a
 * honeypot field + a submit cooldown; the table itself is insert-only
 * for the public, so nothing submitted can ever be read back out.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see this
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    // Honeypot filled = bot. Silently pretend success so bots learn nothing.
    if (website) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    setErrorText("");
    try {
      await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject,
        message: message.trim(),
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorText(getErrorMessage(err, "Your message couldn't be sent. Please try again or use the email link."));
    }
  }

  if (status === "sent") {
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-card border border-status-success bg-status-success-bg px-6 py-10 text-center">
        <CheckCircle2 size={36} className="text-status-success-text" aria-hidden="true" />
        <h2 className="mt-4 font-heading text-subtitle text-text-primary">Message received</h2>
        <p className="mt-2 max-w-sm text-small text-text-secondary">
          Thank you — your message is in the school's inbox. The administration reads and
          responds during office hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-border bg-surface p-6 shadow-sm" noValidate={false}>
      <h2 className="mb-1 font-heading text-subtitle text-text-primary">Send us a message</h2>
      <p className="mb-5 text-small text-text-secondary">
        Questions about enrollment, records, or programs — we read every message.
      </p>

      {/* Honeypot: hidden from humans via CSS + aria-hidden; bots fill it. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input
          id="cf-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {status === "error" && (
        <p role="alert" className="mb-4 rounded-md border border-status-error bg-status-error-bg px-4 py-3 text-small text-status-error-text">
          {errorText}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className={labelClass}>Full name *</label>
          <input id="cf-name" required className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="cf-email" className={labelClass}>Email *</label>
          <input id="cf-email" required type="email" className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="cf-phone" className={labelClass}>Phone (optional)</label>
          <input id="cf-phone" type="tel" className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label htmlFor="cf-subject" className={labelClass}>Subject</label>
          <select id="cf-subject" className={fieldClass} value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cf-message" className={labelClass}>Message *</label>
          <textarea
            id="cf-message"
            required
            className={`${fieldClass} min-h-[120px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-[12px] text-text-secondary">
          Your message goes to the school's admin inbox — it is never published.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-small font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          <Send size={15} aria-hidden="true" />
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
