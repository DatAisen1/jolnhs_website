import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { schoolContact } from "@/data/schoolContact";
import { useSiteSettings, type SiteSetting } from "@/lib/data/siteSettings";
import { ContactPage } from "./ContactPage";

vi.mock("@/lib/supabase", () => ({ supabase: {} }));
vi.mock("@/lib/data/siteSettings", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/siteSettings")>();
  return { ...actual, useSiteSettings: vi.fn() };
});

const mockUseSiteSettings = vi.mocked(useSiteSettings);
const officeHoursValue =
  "Monday–Friday: 7:00 AM – 5:00 PM, Saturday: Closed, Sunday: Closed, Holidays: Closed";

function createSettings(values: Record<string, string>): SiteSetting[] {
  return Object.entries(values).map(([key, value]) => ({
    id: key,
    key,
    value,
    category: "contact",
    updated_at: "",
  }));
}

function renderContactPage() {
  return render(
    <MemoryRouter>
      <ContactPage />
    </MemoryRouter>
  );
}

function mockLoadedSettings(values: Record<string, string>) {
  mockUseSiteSettings.mockReturnValue({
    data: createSettings(values),
    isLoading: false,
    isError: false,
  } as never);
}

describe("ContactPage", () => {
  beforeEach(() => {
    mockUseSiteSettings.mockReset();
  });

  it("renders settings, mailto/social/directions links, phone placeholder, and parsed office hours", () => {
    mockLoadedSettings({
      address: schoolContact.address,
      email: schoolContact.email,
      facebook_handle: schoolContact.facebookHandle,
      facebook_url: schoolContact.facebookUrl,
      maps_url: schoolContact.mapsDirectionsUrl,
      office_hours: officeHoursValue,
    });

    renderContactPage();

    expect(screen.getByRole("heading", { level: 1, name: "Contact Us" })).toBeInTheDocument();
    expect(screen.getByText(schoolContact.address)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: schoolContact.email })).toHaveAttribute(
      "href",
      `mailto:${schoolContact.email}`
    );
    expect(screen.getByRole("link", { name: schoolContact.facebookHandle })).toHaveAttribute(
      "href",
      schoolContact.facebookUrl
    );
    expect(screen.getByRole("link", { name: "Get directions" })).toHaveAttribute(
      "href",
      schoolContact.mapsDirectionsUrl
    );
    expect(screen.getByText("Phone").nextElementSibling).toHaveTextContent(
      "Requires school-provided information"
    );
    expect(screen.getByText("Monday–Friday").nextElementSibling).toHaveTextContent("7:00 AM – 5:00 PM");
    expect(screen.getByText("Saturday").nextElementSibling).toHaveTextContent("Closed");
  });

  it("does not make non-HTTPS Facebook or map URLs clickable", () => {
    mockLoadedSettings({
      facebook_handle: schoolContact.facebookHandle,
      facebook_url: schoolContact.facebookUrl.replace("https:", "http:"),
      maps_url: schoolContact.mapsDirectionsUrl.replace("https://", "https:"),
    });

    renderContactPage();

    expect(screen.queryByRole("link", { name: schoolContact.facebookHandle })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Get directions" })).not.toBeInTheDocument();
    expect(screen.getByText(schoolContact.facebookHandle)).toBeInTheDocument();
  });

  it("shows an error state without displaying stale settings", () => {
    mockUseSiteSettings.mockReturnValue({
      data: createSettings({ address: schoolContact.address }),
      isLoading: false,
      isError: true,
    } as never);

    renderContactPage();

    expect(screen.getByRole("alert")).toHaveTextContent("Contact information unavailable");
    expect(screen.queryByText(schoolContact.address)).not.toBeInTheDocument();
  });
});