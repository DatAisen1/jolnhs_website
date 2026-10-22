import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { CampusLifeGroup } from "@/lib/data/campusLifeGroups";

vi.mock("@/lib/data/campusLifeGroups", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/campusLifeGroups")>();
  return { ...actual, useCampusLifeGroups: vi.fn() };
});

import { useCampusLifeGroups } from "@/lib/data/campusLifeGroups";
import { CampusLifeGroups } from "./CampusLifeGroups";

const mockGroups: CampusLifeGroup[] = [
  {
    id: "g1",
    section_id: "s-athletes",
    slug: "basketball",
    name: "Basketball",
    description: "Varsity basketball program.",
    cover_image_path: null,
    cover_image_url: null,
    sort_order: 0,
    is_archived: false,
    members: [
      {
        id: "m1",
        group_id: "g1",
        name: "Coach Reyes",
        role: "coach",
        position: "Head Coach",
        photo_path: "members/m1.webp",
        photo_url: "https://cdn.example/m1.webp",
        sort_order: 0,
        is_archived: false,
      },
      {
        id: "m2",
        group_id: "g1",
        name: "Player One",
        role: "player",
        position: "Point Guard",
        photo_path: null,
        photo_url: null,
        sort_order: 1,
        is_archived: false,
      },
    ],
    photos: [],
  },
  {
    id: "g2",
    section_id: "s-athletes",
    slug: "volleyball",
    name: "Volleyball",
    description: null,
    cover_image_path: null,
    cover_image_url: null,
    sort_order: 1,
    is_archived: false,
    members: [],
    photos: [],
  },
];

function renderGroups(sectionSlug = "athletes", hash = "") {
  return render(
    <MemoryRouter initialEntries={[`/campus-life/${sectionSlug}${hash}`]}>
      <CampusLifeGroups sectionSlug={sectionSlug} />
    </MemoryRouter>
  );
}

describe("CampusLifeGroups", () => {
  it("renders the group card grid with member counts", () => {
    vi.mocked(useCampusLifeGroups).mockReturnValue({ data: mockGroups } as never);
    renderGroups();
    expect(screen.getByRole("heading", { name: "Sports Teams" })).toBeInTheDocument();
    expect(screen.getByText("Basketball")).toBeInTheDocument();
    expect(screen.getByText("2 members")).toBeInTheDocument();
    expect(screen.getByText("Volleyball")).toBeInTheDocument();
  });

  it("expands a group and shows the coach as a photo card but the player as roster text", () => {
    vi.mocked(useCampusLifeGroups).mockReturnValue({ data: mockGroups } as never);
    renderGroups();

    // Players (minors) must not render as photo cards — roster rows only.
    expect(screen.queryByAltText(/Player One/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Basketball/ }));
    expect(screen.getByText("Varsity basketball program.")).toBeInTheDocument();
    expect(screen.getByAltText(/Coach Reyes, Head Coach/)).toBeInTheDocument();
    // Player appears in the roster list, still with no <img>.
    expect(screen.getByText("Player One")).toBeInTheDocument();
    expect(screen.getByText("Point Guard")).toBeInTheDocument();
    expect(screen.queryByAltText(/Player One/)).not.toBeInTheDocument();
  });

  it("opens the deep-linked group from the URL hash", () => {
    vi.mocked(useCampusLifeGroups).mockReturnValue({ data: mockGroups } as never);
    renderGroups("athletes", "#volleyball");
    expect(screen.getByText(/Details for this sport are being finalized/)).toBeInTheDocument();
  });

  it("shows the empty state when a section has no groups", () => {
    vi.mocked(useCampusLifeGroups).mockReturnValue({ data: [] } as never);
    renderGroups();
    expect(screen.getByText("No sports teams listed yet")).toBeInTheDocument();
  });
});
