// Runs once before the test file's module graph loads (see
// vite.config.ts `test.setupFiles`). Registers jest-dom's matchers
// (toBeDisabled, toHaveAttribute, etc.) onto Vitest's `expect` so
// every test file gets them without a per-file import.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// @testing-library/react auto-registers this via a global `afterEach`,
// which only exists when `test.globals: true`. We deliberately keep
// globals off (explicit imports elsewhere), so it's wired up by hand
// here instead — otherwise each test's DOM tree leaks into the next
// test in the same file, producing baffling "found multiple elements"
// failures that have nothing to do with the component under test.
afterEach(() => {
  cleanup();
});

// jsdom has no IntersectionObserver, but framer-motion's whileInView /
// useInView need one to exist (Footer reveal, AnimatedNumber count-up).
// A no-op stub is enough: these components never fire their callbacks
// in tests, which is also the desired behavior — animations stay in
// their "show" state assertions rather than depending on timing.
if (typeof IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as Record<string, unknown>).IntersectionObserver =
    IntersectionObserverStub;
}