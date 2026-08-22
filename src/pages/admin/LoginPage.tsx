
import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const ATTEMPTS_KEY = "admin_login_attempts";
const LOCK_UNTIL_KEY = "admin_login_lock_until";

export function LoginPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  useEffect(() => {
    const lockUntil = Number(
      sessionStorage.getItem(LOCK_UNTIL_KEY) ?? 0,
    );

    if (lockUntil > Date.now()) {
      setLockRemaining(
        Math.ceil((lockUntil - Date.now()) / 1000),
      );
    }

    const interval = setInterval(() => {
      const until = Number(
        sessionStorage.getItem(LOCK_UNTIL_KEY) ?? 0,
      );

      const remaining = Math.max(
        0,
        Math.ceil((until - Date.now()) / 1000),
      );

      setLockRemaining(remaining);

      if (remaining === 0) {
        sessionStorage.removeItem(LOCK_UNTIL_KEY);
        sessionStorage.removeItem(ATTEMPTS_KEY);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (session) {
    return <Navigate to="/admin" replace />;
  }

  function handleKeyUp(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLockOn(e.getModifierState("CapsLock"));
  }

  function registerFailedAttempt() {
    const attempts =
      Number(sessionStorage.getItem(ATTEMPTS_KEY) ?? 0) + 1;

    if (attempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS;

      sessionStorage.setItem(
        LOCK_UNTIL_KEY,
        String(until),
      );

      sessionStorage.setItem(ATTEMPTS_KEY, "0");

      setLockRemaining(LOCKOUT_MS / 1000);
    } else {
      sessionStorage.setItem(
        ATTEMPTS_KEY,
        String(attempts),
      );
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (lockRemaining > 0) {
      return;
    }

    setSubmitting(true);

    const { error: signInError } = await signIn(
      email.trim(),
      password.trim(),
    );

    setSubmitting(false);

    if (signInError) {
      registerFailedAttempt();
      setError(signInError);
      return;
    }

    sessionStorage.removeItem(ATTEMPTS_KEY);
    sessionStorage.removeItem(LOCK_UNTIL_KEY);

    navigate("/admin", { replace: true });
  }

  const locked = lockRemaining > 0;

  return (
    <main
      className="
  min-h-screen
  bg-gradient-to-br
  from-[#071A3D]
  via-[#1455A0]
  to-[#B9E6FF]
  p-4
  md:p-6
"
    >
      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">

        {/* ============================================================
            LOGIN CARD
            ============================================================ */}
        <div
          className="
            relative
            grid
            w-full
            max-w-[900px]
            overflow-hidden
            rounded-2xl
            bg-[#F4F8FF]

            /* More visible blue-tinted shadow */
            shadow-[0_18px_45px_rgba(15,64,120,0.28),0_8px_18px_rgba(15,64,120,0.16)]

            md:min-h-[430px]
            md:grid-cols-[1.08fr_0.92fr]
          "
        >

          {/* ==========================================================
              LEFT PANEL — CAMPUS PHOTO
              ========================================================== */}
          <section
            aria-hidden="true"
            className="
              relative
              hidden
              min-h-[430px]
              overflow-hidden
              md:block
            "
          >
            {/* Campus image */}
            <img
              src="/facilities/infront.png"
              alt=""
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />

            {/* Blue overlay */}
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-blue-950/90
                via-blue-900/45
                to-blue-700/10
              "
            />

            {/* Campus information */}
            <div
              className="
                absolute
                inset-x-0
                bottom-0
                z-10
                p-8
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-blue-200
                "
              >
                Content Management
              </p>

              <h2
                className="
                  mt-2
                  max-w-sm
                  font-heading
                  text-2xl
                  leading-tight
                  text-white
                "
              >
                Julia Ortiz Luis
                <br />
                National High School
              </h2>

              <p className="mt-2 text-sm text-blue-100">
                Sto. Domingo, Nueva Ecija
              </p>
            </div>

            {/* ========================================================
                CURVED SECTION DIVIDER
                ======================================================== */}
            <div
              aria-hidden="true"
              className="
                absolute
                right-[-1px]
                top-[-5%]
                z-20
                h-[110%]
                w-[90px]
                bg-[#F4F8FF]
              "
              style={{
                clipPath:
                  "ellipse(72% 52% at 100% 50%)",
              }}
            />

            {/* Smooth curve */}
            <div
              aria-hidden="true"
              className="
                absolute
                right-[-32px]
                top-[25%]
                z-20
                h-[50%]
                w-[75px]
                rounded-full
                bg-[#F4F8FF]
              "
            />
          </section>

          {/* ==========================================================
              RIGHT PANEL — LOGIN FORM
              ========================================================== */}
          <section
            className="
              relative
              z-30
              flex
              min-h-[430px]
              items-center
              justify-center
              bg-[#F4F8FF]
              px-7
              py-8

              md:-ml-7
              md:rounded-l-[55px]

              lg:-ml-8
              lg:rounded-l-[65px]
            "
          >
            <div className="w-full max-w-[320px]">

              {/* ======================================================
                  LOGO + HEADER
                  ====================================================== */}
              <div
                className="
                  mb-5
                  flex
                  flex-col
                  items-center
                  text-center
                "
              >
                <img
                  src="/images/logo-jolnhs.png"
                  alt="Julia Ortiz Luis National High School seal"
                  className="
                    h-14
                    w-14
                    object-contain
                  "
                />

                <h1
                  className="
                    mt-2.5
                    font-heading
                    text-xl
                    font-semibold
                    text-text-primary
                  "
                >
                  Admin sign in
                </h1>

                <p
                  className="
                    mt-1
                    text-xs
                    text-text-secondary
                  "
                >
                  Manage faculty, campus life, and budget content.
                </p>
              </div>

              {/* ======================================================
                  LOGIN FORM
                  ====================================================== */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-3.5"
              >

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="
                      mb-1
                      block
                      text-xs
                      font-medium
                      text-text-primary
                    "
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    autoFocus
                    disabled={locked}
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@jolnhs.edu.ph"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-white
                      px-3.5
                      py-2.5
                      text-sm
                      text-text-primary
                      placeholder:text-text-secondary/60
                      focus:outline-none
                      focus:ring-2
                      focus:ring-primary
                      disabled:bg-background
                      disabled:text-text-secondary
                    "
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="
                      mb-1
                      block
                      text-xs
                      font-medium
                      text-text-primary
                    "
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      autoComplete="current-password"
                      disabled={locked}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      onKeyUp={handleKeyUp}
                      placeholder="Enter password"
                      className="
                        w-full
                        rounded-lg
                        border
                        border-border
                        bg-white
                        px-3.5
                        py-2.5
                        pr-10
                        text-sm
                        text-text-primary
                        placeholder:text-text-secondary/60
                        focus:outline-none
                        focus:ring-2
                        focus:ring-primary
                        disabled:bg-background
                        disabled:text-text-secondary
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value,
                        )
                      }
                      disabled={locked}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        inset-y-0
                        right-0
                        flex
                        items-center
                        px-3
                        text-text-secondary
                        transition-colors
                        hover:text-primary
                        disabled:opacity-50
                      "
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  {/* Caps Lock */}
                  {capsLockOn && (
                    <p
                      className="
                        mt-1
                        text-xs
                        text-status-warning-text
                      "
                    >
                      Caps Lock is on.
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && !locked && (
                  <p
                    role="alert"
                    className="text-xs text-red-600"
                  >
                    {error}
                  </p>
                )}

                {/* Lockout */}
                {locked && (
                  <p
                    role="alert"
                    className="text-xs text-red-600"
                  >
                    Too many failed attempts. Try again in{" "}
                    {lockRemaining}s.
                  </p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submitting || locked}
                  className="w-full"
                >
                  {submitting
                    ? "Signing in…"
                    : "Sign in"}
                </Button>
              </form>

              {/* ======================================================
                  BACK TO WEBSITE
                  ====================================================== */}
              <Link
                to="/"
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  text-xs
                  text-text-secondary
                  transition-colors
                  hover:text-primary
                "
              >
                <ArrowLeft size={13} />
                Back to website
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
