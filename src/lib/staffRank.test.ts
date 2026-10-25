import { describe, it, expect } from "vitest";
import { compareStaffByRank, staffPositionRank } from "./staffRank";

describe("staffPositionRank", () => {
  it("orders the DepEd hierarchy: principal > head teacher > master teacher > teacher", () => {
    expect(staffPositionRank("PRINCIPAL I")).toBeLessThan(staffPositionRank("HEAD TEACHER III"));
    expect(staffPositionRank("HEAD TEACHER III")).toBeLessThan(staffPositionRank("MASTER TEACHER I"));
    expect(staffPositionRank("MASTER TEACHER I")).toBeLessThan(staffPositionRank("TEACHER III"));
  });

  it("puts assistant principal below principal but above head teacher", () => {
    expect(staffPositionRank("ASSISTANT PRINCIPAL")).toBe(20);
    expect(staffPositionRank("PRINCIPAL II")).toBe(10);
    expect(staffPositionRank("HEAD TEACHER VI")).toBe(30);
  });

  it("recognizes non-teaching office roles", () => {
    expect(staffPositionRank("REGISTRAR I")).toBe(65);
    expect(staffPositionRank("ADMINISTRATIVE OFFICER II")).toBe(60);
    expect(staffPositionRank("ADMINISTRATIVE ASSISTANT III")).toBe(65);
  });

  it("returns a generic rank for unknown positions and empty text", () => {
    expect(staffPositionRank("HAHA")).toBe(90);
    expect(staffPositionRank("")).toBe(100);
    expect(staffPositionRank(null)).toBe(100);
  });
});

describe("compareStaffByRank", () => {
  const m = (name: string, position: string, head = false) => ({ name, position, is_department_head: head });

  it("sorts senior-first within the same tier by grade (Principal IV > Principal I)", () => {
    expect(compareStaffByRank(m("B", "PRINCIPAL IV"), m("A", "PRINCIPAL I"))).toBeLessThan(0);
    expect(compareStaffByRank(m("A", "TEACHER I"), m("B", "TEACHER III"))).toBeGreaterThan(0);
  });

  it("sorts a realistic roster like live data", () => {
    const sorted = [
      m("E", "TEACHER I"),
      m("A", "MASTER TEACHER  II PhD"),
      m("C", "TEACHER III,PhD"),
      m("B", "HEAD TEACHER III"),
      m("D", "ADMINISTRATIVE OFFICER I"),
      m("F", "SECURITY GUARD"),
    ].sort(compareStaffByRank).map((x) => x.name);
    expect(sorted).toEqual(["B", "A", "C", "E", "D", "F"]);
  });

  it("puts the department head ahead of everyone", () => {
    const sorted = [m("B", "TEACHER I"), m("A", "TEACHER I", true)].sort(compareStaffByRank);
    expect(sorted[0].name).toBe("A");
  });

  it("does not produce NaN when neither position has a grade", () => {
    expect(() => {
      [m("A", "TEACHER"), m("B", "TEACHER")].sort(compareStaffByRank);
    }).not.toThrow();
    const result = [m("B", "TEACHER"), m("A", "TEACHER")].sort(compareStaffByRank);
    expect(result[0].name).toBe("A"); // deterministic: name tiebreak
  });
});
