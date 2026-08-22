import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Building2, Wallet, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/staff", label: "Staff & Faculty", icon: Users },
  { to: "/admin/campus-life", label: "Campus Life", icon: Building2 },
  { to: "/admin/budget", label: "Budget", icon: Wallet },
] as const;

/** Shared shell for every /admin/* page (except /admin/login). Sidebar
 *  collapses to an off-canvas drawer below md, and can be manually
 *  hidden on desktop too, per the "collapsible" decision — this is the
 *  one component every future admin page mounts inside, so getting its
 *  behavior right here means every page below inherits it for free. */
export function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-white transition-transform md:static md:transition-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarOpen ? "md:translate-x-0 md:flex" : "md:hidden"}`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="font-heading text-small font-semibold text-text-primary">
            JOLNHS Admin
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-text-secondary md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-small font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-background hover:text-text-primary"
                }`
              }
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-small text-text-secondary hover:bg-background hover:text-text-primary"
          >
            <LogOut size={17} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-3">
          <button
            onClick={() => {
              setSidebarOpen((v) => !v);
              setMobileOpen((v) => !v);
            }}
            aria-label="Toggle sidebar"
            className="text-text-secondary hover:text-text-primary"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}