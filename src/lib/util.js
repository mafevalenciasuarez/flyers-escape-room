export function asset(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

export function shuffle(list, random = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function fill(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

export function normalizeAnswer(text) {
  return String(text)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(text) {
  return (String(text).match(/[A-Za-z][A-Za-z'’-]*/g) || []).length;
}

export function sentenceCase(words) {
  const s = words.join(' ');
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}
