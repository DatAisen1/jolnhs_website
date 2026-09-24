import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Building2, Wallet, LogOut, Menu, X, Settings, Image, Megaphone, Download, ShieldCheck, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  to?: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const NAV_GROUPS: ReadonlyArray<{ label: string; items: ReadonlyArray<NavItem> }> = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/staff", label: "Staff & Faculty", icon: Users, end: false },
      { to: "/admin/campus-life", label: "Campus Life", icon: Building2, end: false },
      { label: "Homepage", icon: LayoutDashboard },
      { label: "Announcements", icon: Megaphone },
      { label: "Gallery", icon: Image },
      { label: "Downloads", icon: Download },
    ],
  },
  {
    label: "Transparency",
    items: [{ to: "/admin/budget", label: "Budget", icon: Wallet, end: false }],
  },
  {
    label: "System",
    items: [
      { label: "Admin Users", icon: ShieldCheck },
      { label: "Activity Log", icon: ClipboardList },
      { label: "Settings", icon: Settings },
    ],
  },
] as const;

const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items).filter((item): item is NavItem & { to: string } => Boolean(item.to));

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
  const sidebarRef = useRef<HTMLElement>(null);
  const currentNavItem = useCurrentNavItem();
  const email = session?.user.email;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateInertState = () => {
      sidebarRef.current?.toggleAttribute("inert", mediaQuery.matches && !mobileOpen);
    };

    updateInertState();
    mediaQuery.addEventListener("change", updateInertState);
    return () => mediaQuery.removeEventListener("change", updateInertState);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

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
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white shadow-sm transition-transform md:static md:transition-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarOpen ? "md:translate-x-0 md:flex" : "md:hidden"}`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
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

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  if (!item.to) {
                    return (
                      <div key={item.label} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-small text-text-secondary/60" aria-disabled="true">
                        <Icon size={17} aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                        <span className="text-[10px] font-medium uppercase tracking-wide">Soon</span>
                      </div>
                    );
                  }
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `relative flex items-center gap-2.5 rounded-md border-l-2 py-2 pl-3 pr-3 text-small font-medium transition-colors ${
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-transparent text-text-secondary hover:bg-background hover:text-text-primary"
                        }`
                      }
                    >
                      <Icon size={17} aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-3 shadow-sm">
          <button
            onClick={() => {
              if (window.innerWidth < 768) setMobileOpen((v) => !v);
              else setSidebarOpen((v) => !v);
            }}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
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