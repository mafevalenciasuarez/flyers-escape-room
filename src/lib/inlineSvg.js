// Shared SVG inlining: parse once, prefix ids so two copies can sit on the
// same page, and tag the layers CSS is allowed to animate.

export const SVG_NS = 'http://www.w3.org/2000/svg';

const parsed = new Map();

export function parseSvg(raw) {
  if (parsed.has(raw)) return parsed.get(raw);
  let result;
  if (typeof DOMParser === 'undefined' || !raw) {
    result = { ok: false, doc: null, svg: null, error: 'SVG parser is not available' };
  } else {
    const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) {
      result = { ok: false, doc: null, svg: null, error: 'SVG did not parse' };
    } else {
      result = { ok: true, doc, svg, error: '' };
    }
  }
  parsed.set(raw, result);
  if (!result.ok) return result;
  const doc = result.doc.cloneNode(true);
  return { ok: true, doc, svg: doc.documentElement, error: '' };
}

// Longest name wins, so "light-room1" does not swallow "light-room10".
// The first element that matches a name is the one CSS talks to.
export function tagByNames(svg, names) {
  const sorted = [...names].sort((a, b) => b.length - a.length);
  const tagged = new Set();
  for (const el of [svg, ...svg.getElementsByTagName('*')]) {
    const id = el.getAttribute('id');
    if (!id) continue;
    const name = sorted.find((n) => id === n || id.startsWith(`${n}_`) || id.startsWith(`${n}-`));
    if (name && !tagged.has(name)) {
      el.setAttribute('data-st', name);
      tagged.add(name);
    }
  }
}

export function tagExact(svg, ids) {
  const wanted = new Set(ids);
  for (const el of svg.getElementsByTagName('*')) {
    const id = el.getAttribute('id');
    if (wanted.has(id)) el.setAttribute('data-st', id);
  }
}

function refRewriter(prefix, ids) {
  return (value) =>
    value
      .replace(/url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g, (m, q, id) => (ids.has(id) ? `url(${q}#${prefix}${id}${q})` : m))
      .replace(/#([^\s'")]+)/g, (m, id) => (ids.has(id) ? `#${prefix}${id}` : m));
}

// Prefix ids, url(#) / href references, and .cls-N rules inside <style>.
// data-st is left as the short name so CSS does not depend on the prefix.
export function prefixDocument(svg, prefix, { preserveClass = [] } = {}) {
  const keep = new Set(preserveClass);
  const all = [svg, ...svg.getElementsByTagName('*')];
  const ids = new Set(all.map((el) => el.getAttribute('id')).filter(Boolean));
  const rewrite = refRewriter(prefix, ids);
  for (const el of all) {
    for (const attr of [...el.attributes]) {
      if (attr.name === 'id') el.setAttribute('id', prefix + attr.value);
      else if (attr.name === 'class') {
        el.setAttribute(
          'class',
          attr.value
            .split(/\s+/)
            .filter(Boolean)
            .map((c) => (keep.has(c) ? c : prefix + c))
            .join(' ')
        );
      } else if (attr.value.includes('#')) el.setAttribute(attr.name, rewrite(attr.value));
    }
  }
  for (const style of svg.getElementsByTagName('style')) {
    style.textContent = style.textContent
      .replace(/\.(-?[_a-zA-Z][\w-]*)/g, (m, c) => `.${prefix}${c}`)
      .replace(/#([_a-zA-Z][\w-]*)/g, (m, id) => (ids.has(id) ? `#${prefix}${id}` : m))
      .replace(/url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g, (m, q, id) => (ids.has(id) ? `url(${q}#${prefix}${id}${q})` : m));
  }
  return prefix;
}
