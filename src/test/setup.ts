import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: () => "blob:test",
});

Object.defineProperty(URL, "revokeObjectURL", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "alert", {
  writable: true,
  value: () => {},
});

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});
