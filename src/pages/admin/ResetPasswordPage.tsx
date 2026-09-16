import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";

const MIN_PASSWORD_LENGTH = 8;

type LinkStatus = "verifying" | "ready" | "invalid";

/**
 * Landing page for the link in Supabase's password-recovery email
 * (`{site}/admin/reset-password#access_token=...&type=recovery`).
 *
 * This page deliberately does NOT parse the URL hash itself. The
 * Supabase client is created with its default `detectSessionInUrl:
 * true` (see src/lib/supabase.ts), which already reads those tokens
 * out of the hash on load and establishes a session from them — this
 * page's only job is to wait for the `PASSWORD_RECOVERY` auth event
 * that confirms that happened, then call `updateUser` with the new
 * password. Re-parsing the hash ourselves would duplicate logic the
 * client already owns, and risk drifting out of sync with it
 * (Principle 5 — fix the layer that owns the problem).
 *
 * An expired or already-used link doesn't produce that event at all;
 * instead Supabase redirects back with `#error=...&error_description=...`
 * in the hash, which IS this page's concern to read and explain, since
 * the client has no event for "this link was bad."
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("verifying");
  const [linkError, setLinkError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashError = hashParams.get("error_description") ?? hashParams.get("error");
    if (hashError) {
      setLinkStatus("invalid");
      setLinkError(decodeURIComponent(hashError.replace(/\+/g, " ")));
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setLinkStatus("ready");
      }
    });

    // Fallback for the (rare) case where the event fired before this
    // listener attached — e.g. a fast reload. An already-established
    // session by the time this timer runs is still good evidence the
    // link was valid; no session after a few seconds means it wasn't.
    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setLinkStatus((current) => (current === "verifying" ? (data.session ? "ready" : "invalid") : current));
    }, 3000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    // Recovery already leaves the admin signed in with a valid session
    // (that's how updateUser was able to run at all) — send them
    // straight to the dashboard instead of making them log in again
    // with the password they just set.
    setDone(true);
    setTimeout(() => navigate("/admin", { replace: true }), 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-7 shadow-sm">
        <div className="mb-5 flex flex-col items-center text-center">
          <img
            src="/images/logo-jolnhs.png"
            alt="Julia Ortiz Luis National High School seal"
            className="h-12 w-12 object-contain"
          />
          <h1 className="mt-2.5 font-heading text-xl font-semibold text-text-primary">Set a new password</h1>
        </div>

        {linkStatus === "verifying" && (
          <p className="text-center text-small text-text-secondary">Verifying your reset link…</p>
        )}

        {linkStatus === "invalid" && (
          <div className="space-y-4">
            <InlineNotice
              variant="error"
              title="This link isn't valid anymore"
              message={linkError ?? "Reset links expire after a while, and only work once."}
            />
            <Link
              to="/admin/login"
              className="block text-center text-small font-medium text-primary hover:text-primary-700"
            >
              ← Back to sign in
            </Link>
          </div>
        )}

        {linkStatus === "ready" && done && (
          <InlineNotice variant="success" message="Password updated. Taking you to the dashboard…" />
        )}

        {linkStatus === "ready" && !done && (
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div>
              <label htmlFor="new-password" className="mb-1 block text-xs font-medium text-text-primary">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary hover:text-primary"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-xs font-medium text-text-primary">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter the password above"
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {formError && (
              <p role="alert" className="text-xs text-red-600">
                {formError}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}