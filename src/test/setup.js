import '@testing-library/dom';

// jsdom has no media playback; make audio elements fail like a missing file.
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value() {
    return Promise.reject(new Error('No audio in tests'));
  },
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value() {},
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value() {},
});

window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));

window.scrollTo = () => {};
