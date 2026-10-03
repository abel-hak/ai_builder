import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => ({ data: [], error: null }),
        }),
      }),
      insert: async () => ({ error: null }),
    }),
  },
}));

vi.mock("@/lib/ai-stream", () => ({
  streamAI: vi.fn(async ({ onDone }: { onDone: () => void }) => {
    onDone();
  }),
}));

// jsdom has no IntersectionObserver, which framer-motion's useInView needs.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: IntersectionObserverStub,
});

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
    dispatchEvent: () => {},
  }),
});
