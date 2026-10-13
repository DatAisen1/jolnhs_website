import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { HomePage } from "@/pages/HomePage";
import { FacultyStaffPage } from "@/pages/FacultyStaffPage";
import { AboutOverviewPage } from "@/pages/AboutOverviewPage";
import { AcademicsPage } from "@/pages/AcademicsPage";
import { ProgramDetailPage } from "@/pages/ProgramDetailPage";
import { CampusLifePage } from "@/pages/CampusLifePage";
import { CampusLifeSectionPage } from "@/pages/CampusLifeSectionPage";
import { BudgetPage } from "@/pages/BudgetPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ContactPage } from "@/pages/ContactPage";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useNoIndex } from "@/hooks/useNoIndex";

const LoginPage = lazy(() =>
  import("@/pages/admin/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const ResetPasswordPage = lazy(() =>
  import("@/pages/admin/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);
const DashboardPage = lazy(() =>
  import("@/pages/admin/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const CampusLifeManagePage = lazy(() =>
  import("@/pages/admin/CampusLifeManagePage").then((m) => ({ default: m.CampusLifeManagePage }))
);
const StaffManagePage = lazy(() =>
  import("@/pages/admin/StaffManagePage").then((m) => ({ default: m.StaffManagePage }))
);
const BudgetManagePage = lazy(() =>
  import("@/pages/admin/BudgetManagePage").then((m) => ({ default: m.BudgetManagePage }))
);
const SettingsPage = lazy(() =>
  import("@/pages/admin/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);

/** Scrolls to the top on every route change. React Router keeps scroll
 *  position by default, which would land visitors mid-page when they
 *  follow a nav link. Skips the reset when the new URL carries a hash —
 *  in-page anchors (e.g. the Budget section nav) need the browser's own
 *  jump-to-anchor to win. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

/** Public site chrome: header, footer, skip link. */
function PublicLayout() {
  return (
    <>
      <a href="#main-content" className="sr-only-focusable">
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

/** Bare shell for the ONE unauthenticated admin page (login) — no
 *  sidebar, since there's nothing to navigate to yet, and no public
 *  Header/Footer, since this is still a separate context from the
 *  public site. Renamed from the old `AdminLayout` to avoid colliding
 *  with the real sidebar shell (imported above) now that both exist. */
function AdminAuthLayout() {
  // Login and reset-password get noindex too — they're not secret, but
  // there's no reason for a search engine to surface them.
  useNoIndex();
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <Outlet />
    </main>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutOverviewPage />} />
        <Route path="/about/overview" element={<AboutOverviewPage />} />
        <Route path="/about/faculty-staff" element={<FacultyStaffPage />} />
        <Route path="/about/*" element={<NotFoundPage />} />
        <Route path="/academics" element={<AcademicsPage />} />
        <Route path="/academics/:slug" element={<ProgramDetailPage />} />
        <Route path="/campus-life" element={<CampusLifePage />} />
        <Route path="/campus-life/:slug" element={<CampusLifeSectionPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/budget/*" element={<BudgetPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Unauthenticated admin: just the login form, no sidebar */}
      <Route element={<AdminAuthLayout />}>
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={null}>
              <LoginPage />
            </Suspense>
          }
        />
        {/* Landing page for Supabase's password-recovery email link.
              Lives here (unauthenticated shell), not behind ProtectedRoute —
              an admin arrives here via a one-time link, not an existing
              session, even though Supabase does establish one once the
              link's tokens are consumed (see ResetPasswordPage). */}
        <Route
          path="/admin/reset-password"
          element={
            <Suspense fallback={null}>
              <ResetPasswordPage />
            </Suspense>
          }
        />
      </Route>

      {/* Authenticated admin: sidebar shell wraps every page below it.
            One ProtectedRoute guards the whole subtree — individual
            pages (DashboardPage, CampusLifeManagePage, etc.) no longer
            need their own guard. */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/campus-life"
          element={
            <Suspense fallback={null}>
              <CampusLifeManagePage />
            </Suspense>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <Suspense fallback={null}>
              <StaffManagePage />
            </Suspense>
          }
        />
        <Route
          path="/admin/budget"
          element={
            <Suspense fallback={null}>
              <BudgetManagePage />
            </Suspense>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <Suspense fallback={null}>
              <SettingsPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}