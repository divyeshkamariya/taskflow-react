import "@testing-library/jest-dom/vitest";
import { createElement, cloneElement } from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom has no layout engine, so give the charts a fixed size
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) =>
      createElement(
        "div",
        { style: { width: 400, height: 300 } },
        cloneElement(children, { width: 400, height: 300 }),
      ),
  };
});

// jsdom does not implement ResizeObserver
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
