import Icon from './Icon.jsx';
import { useGame } from '../state/GameContext.jsx';

const COLOURS = { purple: '#7b3fbf', yellow: '#e0b400', green: '#2e8b57', blue: '#2563eb', red: '#c62828' };

// A secret piece. Colour pieces always show the colour word too.
export default function PieceCard({ clue, size = 'md' }) {
  const { t } = useGame();
  const type = t('pieceTypes')[clue.type];
  let visual = null;
  if (clue.type === 'colour') {
    visual = <span className="piece-swatch" style={{ background: COLOURS[clue.value] || clue.value }} aria-hidden="true" />;
  } else if (clue.icon) {
    visual = <Icon name={clue.icon} size={size === 'lg' ? 56 : 36} />;
  }
  return (
    <span className={`piece-card piece-${size}`}>
      {visual}
      <span className="piece-label">
        <span className="piece-type">{type}</span>
        <strong className={visual ? '' : 'piece-text'}>{clue.label}</strong>
      </span>
    </span>
  );
}
