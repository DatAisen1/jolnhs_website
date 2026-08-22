import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/pages/HomePage";
import { FacultyStaffPage } from "@/pages/FacultyStaffPage";
import { AboutOverviewPage } from "@/pages/AboutOverviewPage";
import { AcademicsPage } from "@/pages/AcademicsPage";
import { ProgramDetailPage } from "@/pages/ProgramDetailPage";
import { CampusLifePage } from "@/pages/CampusLifePage";
import { CampusLifeSectionPage } from "@/pages/CampusLifeSectionPage";
import { BudgetPage } from "@/pages/BudgetPage";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

const LoginPage = lazy(() =>
  import("@/pages/admin/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import("@/pages/admin/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const CampusLifeManagePage = lazy(() =>
  import("@/pages/admin/CampusLifeManagePage").then((m) => ({ default: m.CampusLifeManagePage }))
);

function StubPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-subtitle text-text-secondary">{title} — coming soon</p>
    </div>
  );
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
    </>
  );
}

/** Bare shell for the ONE unauthenticated admin page (login) — no
 *  sidebar, since there's nothing to navigate to yet, and no public
 *  Header/Footer, since this is still a separate context from the
 *  public site. Renamed from the old `AdminLayout` to avoid colliding
 *  with the real sidebar shell (imported above) now that both exist. */
function AdminAuthLayout() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <Outlet />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about/overview" element={<AboutOverviewPage />} />
          <Route path="/about/faculty-staff" element={<FacultyStaffPage />} />
          <Route path="/about/*" element={<StubPage title="About JOLNHS" />} />
          <Route path="/academics" element={<AcademicsPage />} />
          <Route path="/academics/:slug" element={<ProgramDetailPage />} />
          <Route path="/campus-life" element={<CampusLifePage />} />
          <Route path="/campus-life/:slug" element={<CampusLifeSectionPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/budget/*" element={<BudgetPage />} />
          <Route path="/enroll" element={<StubPage title="Enrollment" />} />
          <Route path="/contact" element={<StubPage title="Contact Us" />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}