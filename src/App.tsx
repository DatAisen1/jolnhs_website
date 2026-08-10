import { BrowserRouter, Routes, Route } from "react-router-dom";
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

/**
 * Routing is scaffolded for the whole site even though only some sections
 * are fully implemented, so nav links resolve to a real (stub) route
 * instead of dead links. About, Academics, Campus Life, and Budget
 * Transparency are built out; Enrollment and Contact remain follow-up
 * work — each is a drop-in <Route> + page component.
 */
function StubPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-subtitle text-text-secondary">{title} — coming soon</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Skip link: first focusable element, lets keyboard/screen-reader
          users bypass the full nav and jump straight to page content. */}
      <a href="#main-content" className="sr-only-focusable">
        Skip to main content
      </a>

      <Header />

      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about/overview" element={<AboutOverviewPage />} />
          <Route path="/about/faculty-staff" element={<FacultyStaffPage />} />
          <Route path="/about/*" element={<StubPage title="About JOLNHS" />} />
          <Route path="/academics" element={<AcademicsPage />} />
          <Route path="/academics/:slug" element={<ProgramDetailPage />} />
          <Route path="/campus-life" element={<CampusLifePage />} />
          <Route path="/campus-life/:slug" element={<CampusLifeSectionPage />} />
          {/* Single page, not /budget/proposed, /budget/allocation, etc. —
              those three used to be separate routes reachable via the
              header dropdown; they're now sections of this one page
              (see BudgetSectionNav's in-page anchors). Old bookmarks to
              those sub-paths fall through to the StubPage catch-all
              below rather than 404ing outright. */}
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/budget/*" element={<BudgetPage />} />
          <Route path="/enroll" element={<StubPage title="Enrollment" />} />
          <Route path="/contact" element={<StubPage title="Contact Us" />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}