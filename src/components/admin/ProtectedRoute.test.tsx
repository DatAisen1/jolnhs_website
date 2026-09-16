import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

// ProtectedRoute's only real dependency is useAuth(); mocking it (rather
// than standing up a real AuthProvider + Supabase client) is what keeps
// this a unit test of the redirect *logic*, not an integration test of
// auth itself — that's the AuthContext/Supabase's job to have its own
// tests for.
vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

/** Mounts ProtectedRoute inside real routes so a <Navigate> redirect
 *  is observed by what actually ends up on screen (the login page),
 *  the same way a browser would, rather than by inspecting props. */
function renderAtAdminRoute() {
  render(
    <MemoryRouter initialEntries={["/admin/officers"]}>
      <Routes>
        <Route path="/admin/login" element={<p>Login page</p>} />
        <Route
          path="/admin/officers"
          element={
            <ProtectedRoute>
              <p>Officers admin content</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute — redirect logic (P3.6)", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("shows a loading state and renders neither children nor the login page while session is resolving", () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderAtAdminRoute();

    expect(screen.getByText("Checking session…")).toBeInTheDocument();
    expect(screen.queryByText("Officers admin content")).not.toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated access (no session) to /admin/login", () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderAtAdminRoute();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Officers admin content")).not.toBeInTheDocument();
  });

  it("does NOT redirect authenticated access — renders the protected children", () => {
    mockUseAuth.mockReturnValue({
      // Only `session`'s truthiness matters to ProtectedRoute; a
      // minimal stand-in avoids depending on @supabase/supabase-js's
      // full Session shape for a component that never reads its fields.
      session: { access_token: "token" } as unknown as import("@supabase/supabase-js").Session,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderAtAdminRoute();

    expect(screen.getByText("Officers admin content")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });
});