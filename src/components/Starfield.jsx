import './Starfield.css';

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
    stars.push({
      id: i,
      spark,
      x,
      y,
      calm: x > 45 && y >= 15 && y <= 70,
      size: spark ? 10 + rand() * 12 : 1 + rand() * 2,
      color: (spark ? sparkColours : dotColours)[rand() < 0.5 ? 0 : 1],
      delay: rand() * 8,
      durRoll: rand(),
      peakRoll: rand(),
    });
  }
  return stars;
}

const STARS = createStarfield(70, 8, 0x5a17c0de);
export const STAR_COUNT = STARS.length;

function look(star, calmZone) {
  const calm = calmZone && star.calm;
  return {
    calm,
    duration: calm ? 6 + star.durRoll * 4 : 2.5 + star.durRoll * 3.5,
    peak: calm ? 0.15 + star.peakRoll * 0.25 : 0.5 + star.peakRoll * 0.45,
  };
}

function Sparkle({ color, size }) {
  return (
    <svg className="sparkle" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill={color} d="M12 0.4 14.1 9.9 23.6 12 14.1 14.1 12 23.6 9.9 14.1 0.4 12 9.9 9.9 Z" />
    </svg>
  );
}

// calmZone keeps the intro's quiet band over the title. maxOpacity caps --peak.
export function Starfield({ calmZone = true, maxOpacity = 1 }) {
  return (
    <div className="starfield" aria-hidden="true">
      {STARS.map((star) => {
        const shown = look(star, calmZone);
        const peak = Math.min(shown.peak, maxOpacity);
        return (
          <span
            key={star.id}
            className={shown.calm ? 'star is-calm' : 'star'}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.spark ? undefined : star.size,
              height: star.spark ? undefined : star.size,
              background: star.spark ? undefined : star.color,
              animationDelay: `${star.delay}s`,
              animationDuration: `${shown.duration}s`,
              '--peak': peak,
            }}
          >
            {star.spark ? <Sparkle color={star.color} size={star.size} /> : null}
          </span>
        );
      })}
    </div>
  );
}
