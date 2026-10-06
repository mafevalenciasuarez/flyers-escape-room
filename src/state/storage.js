const KEY = 'radio-silence-v1';

// sessionStorage can be blocked (private mode, school settings). The game must still work.
export function loadSaved() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore: resume is optional */
  }
}

export function clearSaved() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
