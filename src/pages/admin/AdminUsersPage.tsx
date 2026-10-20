import { useState } from "react";
import type { FormEvent } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { useAddAdminByEmail, useAdminUsers, useRemoveAdmin } from "@/lib/data/adminUsers";

export function AdminUsersPage() {
  const { session } = useAuth();
  const user = session?.user;
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const { data: admins, isLoading, isError, error, refetch } = useAdminUsers();
  const addAdmin = useAddAdminByEmail();
  const removeAdmin = useRemoveAdmin();

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      await addAdmin.mutateAsync(trimmed);
      setEmail("");
      setFeedback({ kind: "ok", text: `${trimmed} now has admin access.` });
    } catch (err) {
      const msg = getErrorMessage(err, "Could not grant admin access.");
      setFeedback({
        kind: "err",
        text: /no account found/i.test(msg)
          ? `No account exists for ${trimmed}. The person must sign up (create an account) first, then you can grant admin access here.`
          : msg,
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Admin Users"
        description="Grant or revoke admin access. A person must have an account first — this page only marks their account as an administrator."
      />

      <AdminCard className="mb-6">
        <h2 className="mb-1 text-small font-semibold text-text-primary">Grant admin access</h2>
        <p className="mb-3 text-small text-text-secondary">
          Enter the email of an existing account. They'll be able to sign in at /admin immediately.
        </p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="admin-email" className="sr-only">Account email</label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@example.com"
            className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-small text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <AdminButton type="submit" loading={addAdmin.isPending}>
            <UserPlus size={16} aria-hidden="true" /> Grant access
          </AdminButton>
        </form>
        {feedback && (
          <p
            className={`mt-3 rounded-md border px-4 py-3 text-small ${
              feedback.kind === "ok"
                ? "border-status-success bg-status-success-bg text-status-success-text"
                : "border-status-error bg-status-error-bg text-status-error-text"
            }`}
          >
            {feedback.text}
          </p>
        )}
      </AdminCard>

      {isLoading && <AdminListSkeleton rows={3} />}
      {isError && <AdminErrorState error={error} onRetry={() => refetch()} />}

      {admins && (
        <ul className="space-y-3">
          {admins.map((admin) => {
            const isSelf = admin.user_id === user?.id;
            return (
              <li key={admin.user_id}>
                <AdminCard className="flex items-center gap-4 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-small font-semibold text-text-primary">
                      {admin.email}
                      {isSelf && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] text-text-secondary">
                      Admin since {new Date(admin.created_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {!isSelf && (
                    <ConfirmButton
                      label={`Revoke admin access for ${admin.email}`}
                      confirmMessage={`Revoke access for ${admin.email}? They'll be signed out of admin features.`}
                      onConfirm={() => removeAdmin.mutate({ userId: admin.user_id, email: admin.email })}
                    />
                  )}
                </AdminCard>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
