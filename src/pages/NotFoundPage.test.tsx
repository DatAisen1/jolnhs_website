import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/App";
import { navigation } from "@/data/navigation";
import { NotFoundPage } from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("shows a clear heading, a home link, and links for every top-level navigation item", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "We can't find that page." })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");

    for (const item of navigation) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    }
  });

  it("routes an unknown path to the public 404 page", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/this-page-definitely-does-not-exist"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "We can't find that page." })
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("routes /enroll to the admissions page (no longer a 404)", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/enroll"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Enroll at JOLNHS" })
    ).toBeInTheDocument();
  });
});