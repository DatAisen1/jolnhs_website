import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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

  it("routes /enroll to the public 404 page", () => {
    render(
      <MemoryRouter initialEntries={["/enroll"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "We can't find that page." })
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});