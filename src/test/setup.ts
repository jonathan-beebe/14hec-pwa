import '@testing-library/jest-dom/vitest'

// jsdom does not implement matchMedia; provide a minimal stub so any
// component or hook that reads media queries (prefers-reduced-motion,
// viewport breakpoints, etc.) doesn't throw under test.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}
