import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIdleSignOut } from "./useIdleSignOut";
import { IDLE_TIMEOUT_MS, WARNING_LEAD_MS } from "@/lib/idleSession";

const signOutMock = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase", () => ({
  supabase: { auth: { signOut: (...args: unknown[]) => signOutMock(...args) } },
}));

function setup() {
  return renderHook(() => useIdleSignOut());
}

describe("useIdleSignOut", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    signOutMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows no warning and does not sign out while the admin is active", () => {
    const { result } = setup();

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - WARNING_LEAD_MS - 60_000);
    });

    expect(result.current.secondsLeft).toBeNull();
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("warns with a live countdown during the final minute", () => {
    const { result } = setup();

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 30_000);
    });

    expect(result.current.secondsLeft).toBe(30);
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("signs out once and flags the timeout reason at the deadline", () => {
    setup();

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS + 5_000);
    });

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("jolnhs-admin-logout-reason")).toBe("timeout");
  });

  it("resets the clock on user activity", () => {
    const { result } = setup();

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 10_000);
    });
    act(() => {
      window.dispatchEvent(new Event("pointerdown"));
    });
    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(result.current.secondsLeft).toBeNull();
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("'Stay signed in' clears the warning and restarts the clock", () => {
    const { result } = setup();

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 30_000);
    });
    expect(result.current.secondsLeft).toBe(30);

    act(() => result.current.staySignedIn());
    expect(result.current.secondsLeft).toBeNull();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("keeps the idle clock across a remount (page refresh does not reset it)", () => {
    const first = setup();

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 10_000);
    });
    first.unmount();

    setup();
    act(() => {
      vi.advanceTimersByTime(15_000);
    });

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });
});
