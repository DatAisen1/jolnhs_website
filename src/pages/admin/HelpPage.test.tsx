import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelpPage } from "./HelpPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <HelpPage />
    </MemoryRouter>
  );
}

// Every admin sidebar destination except Help itself — if a new admin
// page is added to the menu, this list (and the guide) should grow too.
const ADMIN_PAGES: Array<[string, string]> = [
  ["Dashboard", "/admin"],
  ["Announcements", "/admin/announcements"],
  ["Staff & Faculty", "/admin/staff"],
  ["Campus Life", "/admin/campus-life"],
  ["Gallery", "/admin/gallery"],
  ["Documents", "/admin/documents"],
  ["Budget", "/admin/budget"],
  ["Messages", "/admin/messages"],
  ["Admin Users", "/admin/users"],
  ["Activity Log", "/admin/activity"],
  ["Settings", "/admin/settings"],
];

describe("HelpPage", () => {
  it("has a guide section for every admin page, each linking to that page", () => {
    renderPage();
    for (const [title, path] of ADMIN_PAGES) {
      const section = screen.getByRole("region", { name: title });
      expect(within(section).getByRole("link", { name: /open page/i })).toHaveAttribute("href", path);
      expect(within(section).getByRole("heading", { name: "How to use it" })).toBeInTheDocument();
    }
  });

  it("has a jump link for every topic that targets an existing section", () => {
    const { container } = renderPage();
    const nav = screen.getByRole("navigation", { name: "Guide topics" });
    for (const link of within(nav).getAllByRole("link")) {
      const id = link.getAttribute("href")!.slice(1);
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it("shows the golden rules and the troubleshooting list", () => {
    renderPage();
    expect(screen.getByText("The three golden rules")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /when something goes wrong/i })).toBeInTheDocument();
  });
});
