import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CONSENT_KEY } from "@/lib/consent";
import { CookieBanner } from "./CookieBanner";
import { ConsentGatedMap } from "./ConsentGatedMap";

function renderBoth() {
  return render(
    <MemoryRouter>
      <CookieBanner />
      <ConsentGatedMap />
    </MemoryRouter>
  );
}

describe("cookie consent", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the banner when no choice is saved", () => {
    render(
      <MemoryRouter>
        <CookieBanner />
      </MemoryRouter>
    );
    expect(screen.getByRole("region", { name: /cookie consent/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accept" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Decline" })).toBeTruthy();
  });

  it("Accept saves the choice, hides the banner, and unlocks the map", async () => {
    const user = userEvent.setup();
    renderBoth();

    await user.click(screen.getByRole("button", { name: "Accept" }));

    expect(
      screen.queryByRole("region", { name: /cookie consent/i })
    ).toBeNull();
    expect(screen.getByTitle(/Location/i)).toBeTruthy();
    expect(window.localStorage.getItem(CONSENT_KEY)).toContain("accepted");
  });

  it("Decline saves the choice, hides the banner, and keeps the map blocked", async () => {
    const user = userEvent.setup();
    renderBoth();

    await user.click(screen.getByRole("button", { name: "Decline" }));

    expect(
      screen.queryByRole("region", { name: /cookie consent/i })
    ).toBeNull();
    expect(screen.queryByTitle(/Location/i)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Load map" })
    ).toBeTruthy();
    expect(window.localStorage.getItem(CONSENT_KEY)).toContain("declined");
  });

  it("'Load map' on the placeholder counts as accepting", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ConsentGatedMap />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Load map" }));

    expect(screen.getByTitle(/Location/i)).toBeTruthy();
    expect(window.localStorage.getItem(CONSENT_KEY)).toContain("accepted");
  });
});
