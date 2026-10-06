// Font Awesome Free solid icons (filled). Bundled locally, nothing loaded from a CDN.
import {
  faAlignLeft,
  faArrowRight,
  faBookOpen,
  faCheck,
  faCircle,
  faCircleQuestion,
  faClock,
  faEarListen,
  faEye,
  faFlask,
  faGear,
  faGears,
  faHeadphones,
  faHeart,
  faHighlighter,
  faImage,
  faLeaf,
  faLock,
  faMap,
  faMedal,
  faPlay,
  faPuzzlePiece,
  faRadio,
  faRobot,
  faRotateLeft,
  faSeedling,
  faStar,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

const ICONS = {
  headphones: faHeadphones,
  piece: faPuzzlePiece,
  radio: faRadio,
  help: faCircleQuestion,
  settings: faGear,
  map: faMap,
  star: faStar,
  play: faPlay,
  replay: faRotateLeft,
  text: faAlignLeft,
  picture: faImage,
  highlight: faHighlighter,
  engine: faGears,
  plant: faSeedling,
  science: faFlask,
  robot: faRobot,
  ear: faEarListen,
  eye: faEye,
  heart: faHeart,
  gear: faGear,
  leaf: faLeaf,
  lock: faLock,
  circle: faCircle,
  check: faCheck,
  cross: faXmark,
  clock: faClock,
  close: faXmark,
  medal: faMedal,
  words: faBookOpen,
  arrow: faArrowRight,
};

export default function Icon({ name, label, size = 28, className = '' }) {
  const icon = ICONS[name] || ICONS.star;
  const [width, height, , , svgPath] = icon.icon;
  const paths = Array.isArray(svgPath) ? svgPath : [svgPath];
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
