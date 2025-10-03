import '@testing-library/jest-dom';

// Polyfill para APIs usadas pelo Ant Design em ambiente de testes (jsdom)
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = function matchMedia(query) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () { return false; }
      };
    };
  }

  if (!window.ResizeObserver) {
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.ResizeObserver = ResizeObserver;
  }
}