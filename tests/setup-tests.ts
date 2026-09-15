import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest.config.ts does not set `test.globals: true`, so @testing-library/react's
// automatic-cleanup detection (which relies on a global `afterEach`) never registers.
// Without this, DOM trees from previous tests in the same file remain mounted, causing
// "found multiple elements" failures in any later test that queries by role/placeholder.
afterEach(() => {
  cleanup();
});
