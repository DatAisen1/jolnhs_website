import { describe, expect, it } from "vitest";
import { positionRank, compareMembersByPosition } from "./positionRank";

describe("positionRank", () => {
  it("orders the standard org board by hierarchy", () => {
    const positions = [
      "SSLG Secretary",
      "SSLG President",
      "SSLG Treasurer",
      "SSLG Vice President",
      "SSLG Auditor",
      "SSLG Adviser",
    ];
    const sorted = [...positions].sort(
      (a, b) => positionRank(a) - positionRank(b) || a.localeCompare(b)
    );
    expect(sorted).toEqual([
      "SSLG Adviser",
      "SSLG President",
      "SSLG Vice President",
      "SSLG Secretary",
      "SSLG Treasurer",
      "SSLG Auditor",
    ]);
  });

  it("never ranks Vice President as President", () => {
    expect(positionRank("Vice President")).toBeGreaterThan(positionRank("President"));
  });

  it("keeps advisers, moderators, and coaches first regardless of org type", () => {
    expect(positionRank("Club Moderator")).toBe(0);
    expect(positionRank("Head Coach")).toBe(0);
    expect(positionRank("Organization Adviser")).toBe(0);
  });

  it("recognizes public-relations abbreviations (PRO / PIO / P.O.) with the board staff", () => {
    const pro = positionRank("SSLG P.R.O.");
    expect(positionRank("SSLG P.I.O.")).toBe(pro);
    expect(positionRank("SSLG P.O.")).toBe(pro);
    expect(pro).toBeLessThan(positionRank("SSLG Grade 7 Representative"));
    expect(pro).toBeLessThan(positionRank("Finance Committee"));
  });

  it("orders grade representatives 7 through 12, then breaks ties by name", () => {
    const roster = [
      { name: "Zoe", position: "SSLG Grade 11 Representative", sort_order: 0 },
      { name: "Ana", position: "SSLG Grade 7 Representative", sort_order: 0 },
      { name: "Marco", position: "SSLG Grade 7 Representative", sort_order: 0 },
      { name: "Liza", position: "SSLG Grade 10 Representative", sort_order: 0 },
    ];
    const sorted = [...roster].sort(compareMembersByPosition).map((m) => m.name);
    expect(sorted).toEqual(["Ana", "Marco", "Liza", "Zoe"]);
  });

  it("puts unknown titles between the board and plain members", () => {
    const unknown = positionRank("Events Lead");
    expect(unknown).toBeGreaterThan(positionRank("Auditor"));
    expect(unknown).toBeLessThan(positionRank("Member"));
    expect(positionRank(null)).toBeGreaterThan(unknown);
  });
});

describe("compareMembersByPosition", () => {
  const member = (name: string, position: string | null, sort_order = 0) => ({
    name,
    position,
    sort_order,
  });

  it("sorts a mixed roster by rank, not name", () => {
    const roster = [
      member("Zoe", "Point Guard"),
      member("Ana", "President"),
      member("Marco", "Secretary"),
      member("Liza", "Adviser"),
    ];
    const sorted = [...roster].sort(compareMembersByPosition).map((m) => m.name);
    expect(sorted).toEqual(["Liza", "Ana", "Marco", "Zoe"]);
  });

  it("respects an explicit sort_order over rank", () => {
    const roster = [
      member("Ana", "President", 5),
      member("Marco", "Secretary", 1),
    ];
    const sorted = [...roster].sort(compareMembersByPosition).map((m) => m.name);
    expect(sorted).toEqual(["Marco", "Ana"]);
  });

  it("breaks rank ties by name", () => {
    const roster = [member("Zoe", "Member"), member("Ana", "Member")];
    const sorted = [...roster].sort(compareMembersByPosition).map((m) => m.name);
    expect(sorted).toEqual(["Ana", "Zoe"]);
  });
});
