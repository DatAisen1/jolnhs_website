import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { StaffMember } from "@/lib/data/publicStaff";
import type { StaffDepartment } from "@/lib/data/staffDepartments";
import { DepartmentCards } from "./DepartmentCards";

function dept(id: string, name: string, slug = id): StaffDepartment {
  return {
    id,
    category: "jhs-faculty",
    name,
    slug,
    description: null,
    sort_order: 0,
    is_archived: false,
    created_at: "",
    updated_at: "",
  };
}

function member(id: string, name: string, position: string, department_id: string | null, head = false): StaffMember {
  return {
    id,
    name,
    position,
    category: "jhs-faculty",
    department_id,
    is_department_head: head,
    photo_path: null,
    sort_order: 0,
    is_archived: false,
    created_at: "",
    updated_at: "",
  };
}

const DEPARTMENTS = [dept("d-sci", "Science Department", "science"), dept("d-eng", "English Department", "english")];

const MEMBERS = [
  member("m1", "Santos, Maria", "TEACHER I", "d-sci"),
  member("m2", "Reyes, Jose", "HEAD TEACHER III", "d-sci", true),
  member("m3", "Cruz, Ana", "TEACHER III", "d-sci"),
  member("m4", "Dela Rosa, Ben", "TEACHER II", "d-eng"),
  member("m5", "Lopez, Carla", "TEACHER I", null),
  // Points at an archived/removed department — must still appear (Other).
  member("m6", "Garcia, Dan", "TEACHER I", "d-gone"),
];

function renderCards(hash = "") {
  return render(
    <MemoryRouter initialEntries={[`/about/faculty-staff?category=jhs-faculty${hash}`]}>
      <DepartmentCards departments={DEPARTMENTS} members={MEMBERS} />
    </MemoryRouter>
  );
}

describe("DepartmentCards", () => {
  it("renders a card per department with member counts, plus an Other card for unassigned people", () => {
    renderCards();
    expect(screen.getByRole("button", { name: /Science Department/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /English Department/ })).toBeInTheDocument();
    const otherButton = screen.getByRole("button", { name: /Other/ });
    expect(otherButton).toBeInTheDocument();
    // Lopez (no dept) + Garcia (archived dept) land in Other.
    expect(within(otherButton).getByText("2 members")).toBeInTheDocument();
  });

  it("shows the department head on the collapsed card", () => {
    renderCards();
    const scienceButton = screen.getByRole("button", { name: /Science Department/ });
    expect(within(scienceButton).getByText(/Head: Reyes, Jose/)).toBeInTheDocument();
  });

  it("expands to show members head-first in rank order with a Department Head tag", () => {
    renderCards();
    fireEvent.click(screen.getByRole("button", { name: /Science Department/ }));

    const panel = document.getElementById("dept-science");
    expect(panel).toBeInTheDocument();
    const names = within(panel!).getAllByText(/,/);
    // Head Teacher (head flag) first, then Teacher III before Teacher I.
    expect(names[0].textContent).toContain("Reyes, Jose");
    expect(names[1].textContent).toContain("Cruz, Ana");
    expect(names[2].textContent).toContain("Santos, Maria");
    expect(within(panel!).getByText("Department Head")).toBeInTheDocument();
  });

  it("opens the deep-linked department from the URL hash", () => {
    renderCards("#dept-english");
    const panel = document.getElementById("dept-english");
    expect(panel).toBeInTheDocument();
    expect(within(panel!).getByText("Dela Rosa, Ben")).toBeInTheDocument();
  });

  it("closes the open card when it is clicked again", () => {
    renderCards();
    const button = screen.getByRole("button", { name: /English Department/ });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("dept-english")).toBeInTheDocument();
    fireEvent.click(button);
    // The detail panel exits via animation — the state that matters
    // (aria-expanded + URL hash cleared) flips immediately.
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(window.location.hash).toBe("");
  });
});
