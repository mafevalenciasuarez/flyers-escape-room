import { useGame } from '../state/GameContext.jsx';
import useReducedMotion from '../lib/useReducedMotion.js';
import StationSvg from './StationSvg.jsx';
import { Starfield } from './Starfield.jsx';
import './SpaceBackdrop.css';

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
