import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Building2, Wallet, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, soon: false },
  { to: "/admin/staff", label: "Staff & Faculty", icon: Users, end: false, soon: false },
  { to: "/admin/campus-life", label: "Campus Life", icon: Building2, end: false, soon: false },
  { to: "/admin/budget", label: "Budget", icon: Wallet, end: false, soon: false },
] as const;

/** Longest-prefix match against NAV_ITEMS so the topbar's page title
 *  stays correct on nested routes (e.g. a future `/admin/staff/:id`
 *  still reads "Staff & Faculty") without every page having to pass
 *  its own title down. Falls back to "Admin" for anything unmatched. */
function useCurrentNavItem() {
  const { pathname } = useLocation();
  return (
    NAV_ITEMS.filter((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to))).sort(
      (a, b) => b.to.length - a.to.length,
    )[0] ?? null
  );
}

/** Deterministic 1-2 letter avatar initials from an email address —
 *  avoids depending on a display-name field the admin's user records
 *  don't have; "jane.doe@jolnhs.edu.ph" → "JD". */
function initialsFromEmail(email: string | undefined) {
  if (!email) return "?";
  const local = email.split("@")[0];
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2);
  return letters.toUpperCase();
}

export function AdminLayout() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentNavItem = useCurrentNavItem();
  const email = session?.user.email;

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white shadow-sm transition-transform md:static md:transition-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarOpen ? "md:translate-x-0 md:flex" : "md:hidden"}`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-small font-bold text-white"
              aria-hidden="true"
            >
              JO
            </span>
            <span className="truncate font-heading text-small font-semibold leading-tight text-text-primary">
              JOLNHS
              <br />
              <span className="font-sans text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                Admin
              </span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="shrink-0 text-text-secondary md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, soon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-2.5 rounded-lg py-2 pl-3 pr-3 text-small font-medium transition-colors ${
                  isActive
                    ? "border-l-2 border-primary bg-primary/8 text-primary"
                    : "border-l-2 border-transparent text-text-secondary hover:bg-background hover:text-text-primary"
                }`
              }
            >
              <Icon size={17} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {soon && (
                <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[11px] font-semibold text-primary"
              aria-hidden="true"
            >
              {initialsFromEmail(email)}
            </span>
            <span className="min-w-0 flex-1 truncate text-small text-text-secondary" title={email}>
              {email ?? "Signed in"}
            </span>
            <button
              onClick={() => void handleSignOut()}
              aria-label="Sign out"
              title="Sign out"
              className="shrink-0 rounded-md p-1.5 text-text-secondary hover:bg-background hover:text-text-primary"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-3 shadow-sm">
          <button
            onClick={() => {
              setSidebarOpen((v) => !v);
              setMobileOpen((v) => !v);
            }}
            aria-label="Toggle sidebar"
            className="rounded-md p-1 text-text-secondary hover:bg-background hover:text-text-primary"
          >
            <Menu size={20} />
          </button>
          <h2 className="font-heading text-small font-semibold text-text-primary">
            {currentNavItem?.label ?? "Admin"}
          </h2>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}