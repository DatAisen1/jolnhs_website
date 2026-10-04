import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AdminErrorState } from "@/components/admin/AdminStates";
import { useAdminAccess } from "@/lib/data/adminAccess";

/**
 * Gate for every /admin/* page except the login page itself.
 * Client-side access checks are UX only: the database layer remains the
 * real security boundary. This component only prevents a non-admin from
 * seeing privileged screens after an authenticated session is established.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, isError, error, refetch } = useAdminAccess(session);

  if (loading || (session && isAdminLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-text-secondary">Checking session…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg">
          <AdminErrorState error={error} onRetry={() => void refetch()} />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied onSignOut={() => void signOut()} />;
  }

  return <>{children}</>;
}