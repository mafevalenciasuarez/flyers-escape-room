import { useGame } from '../state/GameContext.jsx';
import useReducedMotion from '../lib/useReducedMotion.js';
import StationSvg from './StationSvg.jsx';
import './SpaceBackdrop.css';

// Seeded once at module load so a re-render never moves the stars.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createStarfield(dotCount, sparkCount, seed) {
  const rand = mulberry32(seed);
  const dotColours = ['#E8DDAF', '#9DB4DC'];
  const sparkColours = ['#E8DDAF', '#7F9FD0'];
  const stars = [];
  for (let i = 0; i < dotCount + sparkCount; i += 1) {
    const spark = i >= dotCount;
    const x = rand() * 100;
    const y = rand() * 100;
    const calm = x > 45 && y >= 15 && y <= 70;
    stars.push({
      id: i,
      spark,
      x,
      y,
      calm,
      size: spark ? 10 + rand() * 12 : 1 + rand() * 2,
      color: (spark ? sparkColours : dotColours)[rand() < 0.5 ? 0 : 1],
      delay: rand() * 8,
      duration: calm ? 6 + rand() * 4 : 2.5 + rand() * 3.5,
      peak: calm ? 0.15 + rand() * 0.25 : 0.5 + rand() * 0.45,
    });
  }
  return stars;
}

const STARS = createStarfield(70, 8, 0x5a17c0de);

function Sparkle({ color, size }) {
  return (
    <svg className="sparkle" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill={color} d="M12 0.4 14.1 9.9 23.6 12 14.1 14.1 12 23.6 9.9 14.1 0.4 12 9.9 9.9 Z" />
    </svg>
  );
}

export function Starfield() {
  return (
    <div className="starfield">
      {STARS.map((star) => (
        <span
          key={star.id}
          className={star.calm ? 'star is-calm' : 'star'}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.spark ? undefined : star.size,
            height: star.spark ? undefined : star.size,
            background: star.spark ? undefined : star.color,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            '--peak': star.peak,
          }}
        >
          {star.spark ? <Sparkle color={star.color} size={star.size} /> : null}
        </span>
      ))}
    </div>
  );
}

const planetSrc = `${import.meta.env.BASE_URL}img/planet-earth.svg`;

// variant "broken" is the intro. A later "restored" variant can keep the same
// layers and only change how the lights behave (see data-variant in the CSS).
export default function SpaceBackdrop({ variant = 'broken' }) {
  const { state } = useGame();
  const reduced = useReducedMotion();
  const frozen = reduced || state.settings.calm;

  return (
    <div className={frozen ? 'space-scene is-static' : 'space-scene'} data-variant={variant} aria-hidden="true">
      <Starfield />
      <div className="planet">
        <div className="planet-slide">
          <img className="planet-img" src={planetSrc} alt="" />
          <div className="planet-glow-fade">
            <div className="planet-glow-breathe">
              <img className="planet-glow-img" src={planetSrc} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="station">
        <div className="station-enter">
          <div className="station-drift">
            <StationSvg mode="intro" static={frozen} />
          </div>
        </div>
      </div>
    </div>
  );
}
