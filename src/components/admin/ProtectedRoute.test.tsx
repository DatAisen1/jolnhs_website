import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useAdminAccess } from "@/lib/data/adminAccess";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/data/adminAccess", () => ({
  useAdminAccess: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseAdminAccess = vi.mocked(useAdminAccess);

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
    mockUseAdminAccess.mockReset();
  });

  it("shows a loading state and renders neither children nor the login page while session is resolving", () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockUseAdminAccess.mockReturnValue({
      data: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

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
    mockUseAdminAccess.mockReturnValue({
      data: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderAtAdminRoute();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Officers admin content")).not.toBeInTheDocument();
  });

  it("denies access to authenticated non-admin users", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-123" }, access_token: "token" } as never,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockUseAdminAccess.mockReturnValue({
      data: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderAtAdminRoute();

    expect(screen.getByText("Access denied")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.queryByText("Officers admin content")).not.toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  it("renders children for authenticated admins", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "admin-123" }, access_token: "token" } as never,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockUseAdminAccess.mockReturnValue({
      data: true,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderAtAdminRoute();

    expect(screen.getByText("Officers admin content")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  it("shows an error state with retry when the admin check fails", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "admin-123" }, access_token: "token" } as never,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockUseAdminAccess.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("boom"),
      refetch: vi.fn(),
    } as never);

    renderAtAdminRoute();

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText("Officers admin content")).not.toBeInTheDocument();
  });
});