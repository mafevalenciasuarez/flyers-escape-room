import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getStationMarkup, INSTANCE_TOKEN } from '../lib/stationSvg.js';
import './StationSvg.css';

// Focus-circle centres as fractions of the station viewBox. Measured with no
// camera transform, once per mount and again after a resize settles.
export function usePointFractions(hostRef) {
  const [points, setPoints] = useState({});
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let timer = 0;
    const measure = () => {
      const svg = host.querySelector('svg');
      const vb = svg?.viewBox?.baseVal;
      if (!svg || !vb?.width || !vb?.height) return;
      const next = {};
      for (const el of host.querySelectorAll('[data-st^="focus-"]')) {
        if (typeof el.getBBox !== 'function') return;
        let box;
        try {
          box = el.getBBox();
        } catch {
          return;
        }
        const name = el.getAttribute('data-st').slice('focus-'.length);
        next[name] = {
          x: (box.x + box.width / 2) / vb.width,
          y: (box.y + box.height / 2) / vb.height,
        };
      }
      setPoints((prev) => {
        const keys = Object.keys(next);
        const same = keys.length === Object.keys(prev).length && keys.every((key) => prev[key] && prev[key].x === next[key].x && prev[key].y === next[key].y);
        return same ? prev : next;
      });
    };
    measure();
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    observer?.observe(host);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, [hostRef]);
  return points;
}

const StationSvg = forwardRef(function StationSvg(
  {
    mode = 'map',
    lightStates = {},
    zoneStates = {},
    focusRoom = '',
    onZoneEnter,
    onZoneLeave,
    onZoneClick,
    static: isStatic = false,
  },
  ref
) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const html = useMemo(() => getStationMarkup().replaceAll(INSTANCE_TOKEN, uid), [uid]);
  const hostRef = useRef(null);
  const setHost = (node) => {
    hostRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || mode !== 'map') return;
    for (const [id, state] of Object.entries(lightStates)) {
      host.querySelector(`[data-st="light-${id}"]`)?.setAttribute('data-state', state);
    }
    for (const [id, state] of Object.entries(zoneStates)) {
      host.querySelector(`[data-st="zone-${id}"]`)?.setAttribute('data-state', state);
    }
  }, [mode, lightStates, zoneStates, html]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || mode !== 'map') return undefined;
    const stops = [];
    for (const el of host.querySelectorAll('[data-st^="zone-"]')) {
      const id = el.getAttribute('data-st').slice('zone-'.length);
      const enter = () => onZoneEnter?.(id);
      const leave = () => onZoneLeave?.(id);
      const click = (event) => {
        event.preventDefault();
        onZoneClick?.(id);
      };
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointerleave', leave);
      el.addEventListener('click', click);
      stops.push(() => {
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('pointerleave', leave);
        el.removeEventListener('click', click);
      });
    }
    return () => stops.forEach((stop) => stop());
  }, [mode, onZoneEnter, onZoneLeave, onZoneClick, html]);

  return (
    <div
      ref={setHost}
      className={`station-svg station-${mode}${isStatic ? ' is-static' : ''}`}
      data-focus={focusRoom || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

export default StationSvg;
