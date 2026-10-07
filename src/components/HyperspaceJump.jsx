import { useEffect, useRef } from 'react';
import './HyperspaceJump.css';

// Same motion as hyperspace-jump.js, without TweenMax or lodash.
// Drift does not accelerate. The jump is the click sequence from that file:
// a short stretch, then the fast coloured warp, then a settle.
const NAVY = '#192444';
const STAR_COUNT = 300;
const BASE_SIZE = 1;
const DRIFT_SIZE = 2.75;
const DRIFT_VELOCITY = 1;
const VELOCITY_INIT_INC = 1.025;
const JUMP_VELOCITY_INC = 1.25;
const JUMP_SIZE_INC = 1.15;
const SIZE_INC = 1.01;
const HOLD_MS = 600;
const JUMP_MS = 2500;
const TWEEN_S = 0.25;
const FADE_S = 1;
const RAD = Math.PI / 180;
const WARP_COLORS = [
  [197, 239, 247],
  [25, 181, 254],
  [77, 5, 232],
  [165, 55, 253],
  [255, 255, 255],
];

function randomInRange(max, min) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function easeOut(t) {
  return 1 - (1 - t) * (1 - t);
}

class Star {
  constructor() {
    this.reset();
  }

  reset() {
    const angle = randomInRange(0, 360) * RAD;
    const vX = Math.cos(angle);
    const vY = Math.sin(angle);
    const travelled = Math.random() > 0.5
      ? Math.random() * Math.max(window.innerWidth, window.innerHeight) + Math.random() * (window.innerWidth * 0.24)
      : Math.random() * (window.innerWidth * 0.25);
    this.STATE = {
      alpha: this.STATE?.alpha ?? Math.random(),
      angle,
      iX: undefined,
      iY: undefined,
      active: Boolean(travelled),
      x: Math.floor(vX * travelled) + window.innerWidth / 2,
      vX,
      y: Math.floor(vY * travelled) + window.innerHeight / 2,
      vY,
      size: DRIFT_SIZE,
    };
  }
}

function createEngine(canvas, context) {
  const state = {
    stars: Array.from({ length: STAR_COUNT }, () => new Star()),
    bgAlpha: 0,
    sizeInc: SIZE_INC,
    velocity: DRIFT_VELOCITY,
    starAlpha: 1,
    initiating: false,
    jumping: false,
    fading: false,
    settled: false,
  };
  const tweens = [];
  let frame = 0;
  let stopped = false;

  function tweenTo(target, durationS = TWEEN_S, onDone) {
    if (typeof durationS === 'function') {
      onDone = durationS;
      durationS = TWEEN_S;
    }
    const from = {};
    for (const key of Object.keys(target)) from[key] = state[key];
    tweens.push({ target, from, start: performance.now(), dur: durationS * 1000, onDone });
  }

  function tickTweens(now) {
    for (let i = tweens.length - 1; i >= 0; i -= 1) {
      const tw = tweens[i];
      const t = Math.min(1, (now - tw.start) / tw.dur);
      const e = easeOut(t);
      for (const key of Object.keys(tw.target)) {
        state[key] = tw.from[key] + (tw.target[key] - tw.from[key]) * e;
      }
      if (t >= 1) {
        tweens.splice(i, 1);
        tw.onDone?.();
      }
    }
  }

  function resize() {
    context.lineCap = 'round';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.lineCap = 'round';
  }

  function render(now) {
    if (stopped) return;
    tickTweens(now);
    context.fillStyle = NAVY;
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    if (state.bgAlpha > 0) {
      context.fillStyle = `rgba(31, 58, 157, ${state.bgAlpha})`;
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
    // The completing frame clears the fade flag before paint. Stop there,
    // or the streaks flash back at full strength.
    if (state.settled) return;
    const waiting = state.stars.filter((star) => !star.STATE.active);
    if (!state.initiating && waiting.length) waiting[0].STATE.active = true;

    for (const star of state.stars) {
      if (!star.STATE.active) continue;
      if (state.fading) {
        const ink = star.STATE.alpha * state.starAlpha;
        if (ink > 0.004) {
          const [r, g, b] = WARP_COLORS[Math.floor(Math.random() * WARP_COLORS.length)];
          context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${ink})`;
          context.lineWidth = star.STATE.size || DRIFT_SIZE;
          context.beginPath();
          context.moveTo(star.STATE.iX ?? star.STATE.x, star.STATE.iY ?? star.STATE.y);
          context.lineTo(star.STATE.x, star.STATE.y);
          context.stroke();
        }
        continue;
      }
      const { active, x, y, iX, iY, iVX, iVY, size, vX, vY } = star.STATE;
      const drawX = iX ?? x;
      const drawY = iY ?? y;
      const headOutside = x < -80 || x > window.innerWidth + 80 || y < -80 || y > window.innerHeight + 80;
      const outside = drawX < 0 || drawX > window.innerWidth || drawY < 0 || drawY > window.innerHeight;
      // During the warp the tail stays on screen, so recycle a star once its head has left.
      if ((state.jumping && headOutside) || (outside && active && !state.initiating && !state.jumping)) {
        star.reset();
        continue;
      }
      // A frozen tail is what makes a streak. Drift has none. The stretch and the
      // warp keep the tail still while the head runs away from it.
      const holdTail = state.initiating || state.jumping;
      const tailX = typeof iX === 'number' ? iX : (holdTail ? x : undefined);
      const tailY = typeof iY === 'number' ? iY : (holdTail ? y : undefined);
      const stretching = typeof tailX === 'number' && typeof tailY === 'number';
      const newIX = holdTail || !stretching ? tailX : tailX + iVX;
      const newIY = holdTail || !stretching ? tailY : tailY + iVY;
      const newX = x + vX;
      const newY = y + vY;
      const caught = stretching && !state.initiating && (
        (vX < 0 && newIX < x) || (vX > 0 && newIX > x) || (vY < 0 && newIY < y) || (vY > 0 && newIY > y)
      );
      star.STATE = {
        ...star.STATE,
        iX: caught ? undefined : newIX,
        iY: caught ? undefined : newIY,
        iVX: caught || !stretching ? undefined : (typeof iVX === 'number' ? iVX : vX) * VELOCITY_INIT_INC,
        iVY: caught || !stretching ? undefined : (typeof iVY === 'number' ? iVY : vY) * VELOCITY_INIT_INC,
        x: newX,
        vX: star.STATE.vX * state.velocity,
        y: newY,
        vY: star.STATE.vY * state.velocity,
        size: holdTail ? Math.min((size || DRIFT_SIZE) * SIZE_INC, 4) : DRIFT_SIZE,
      };
      const ink = star.STATE.alpha * (state.fading ? state.starAlpha : 1);
      let color = `rgba(255, 255, 255, ${ink})`;
      if (state.jumping || state.fading) {
        const [r, g, b] = WARP_COLORS[Math.floor(Math.random() * WARP_COLORS.length)];
        color = `rgba(${r}, ${g}, ${b}, ${ink})`;
      }
      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(star.STATE.iX || x, star.STATE.iY || y);
      context.lineTo(star.STATE.x, star.STATE.y);
      context.stroke();
    }
    frame = requestAnimationFrame(render);
  }

  function initiate() {
    if (state.jumping || state.initiating) return;
    state.initiating = true;
    tweenTo({ velocity: VELOCITY_INIT_INC, bgAlpha: 0.3 });
    for (const star of state.stars) {
      if (!star.STATE.active) continue;
      star.STATE = {
        ...star.STATE,
        iX: star.STATE.x,
        iY: star.STATE.y,
        iVX: star.STATE.vX,
        iVY: star.STATE.vY,
      };
    }
  }

  function jump() {
    // Keep initiating set so the tails stay frozen for the whole warp.
    // Releasing them lets the tail catch the head and the streak disappears.
    state.bgAlpha = 0;
    state.jumping = true;
    tweenTo({ velocity: JUMP_VELOCITY_INC, bgAlpha: 0.75, sizeInc: JUMP_SIZE_INC });
  }

  function settle(onDone) {
    // Hold the streaks still and fade them with the blue wash.
    // The last frame must not paint them again after starAlpha hits zero.
    state.jumping = false;
    state.fading = true;
    tweenTo(
      { bgAlpha: 0, velocity: DRIFT_VELOCITY, sizeInc: SIZE_INC, starAlpha: 0 },
      FADE_S,
      () => {
        state.settled = true;
        state.starAlpha = 0;
        state.initiating = false;
        state.fading = false;
        onDone?.();
      },
    );
  }

  return {
    start() {
      resize();
      frame = requestAnimationFrame(render);
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(frame);
    },
    resize,
    playJump(onDone) {
      initiate();
      let finish = 0;
      const hold = setTimeout(() => {
        jump();
        finish = setTimeout(() => settle(onDone), JUMP_MS);
      }, HOLD_MS);
      return () => {
        clearTimeout(hold);
        clearTimeout(finish);
      };
    },
  };
}

// Full-screen star field. `jumping` plays the warp once and then calls onJumpDone.
export default function HyperspaceJump({ jumping = false, onJumpDone, onUnavailable }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const doneRef = useRef(onJumpDone);
  const unavailableRef = useRef(onUnavailable);
  doneRef.current = onJumpDone;
  unavailableRef.current = onUnavailable;

  useEffect(() => {
    const canvas = canvasRef.current;
    // jsdom logs and returns null. Skip the call so tests go straight to the station.
    const jsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);
    let context = null;
    if (!jsdom) {
      try {
        context = canvas?.getContext?.('2d') || null;
      } catch {
        context = null;
      }
    }
    if (!context) {
      unavailableRef.current?.();
      return undefined;
    }
    const engine = createEngine(canvas, context);
    engineRef.current = engine;
    engine.start();
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => engine.resize(), 250);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!jumping || !engineRef.current) return undefined;
    return engineRef.current.playJump(() => doneRef.current?.());
  }, [jumping]);

  return <canvas ref={canvasRef} className="hyperspace-canvas" aria-hidden="true" />;
}
