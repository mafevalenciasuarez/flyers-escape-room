import Icon from './Icon.jsx';
import { useGame } from '../state/GameContext.jsx';

// Spanish help appears under the English, only when "Ayuda en español" is on.
export function Es({ children }) {
  const { state } = useGame();
  if (!state.settings.spanish || !children) return null;
  return (
    <span className="es" lang="es">
      {children}
    </span>
  );
}

export function Instruction({ icon = 'arrow', en, es, as: Tag = 'p' }) {
  return (
    <Tag className="instruction">
      <Icon name={icon} />
      <span>
        <span className="en">{en}</span>
        <Es>{es}</Es>
      </span>
    </Tag>
  );
}

export function Button({ icon, en, es, variant = 'primary', className = '', ...rest }) {
  return (
    <button type="button" className={`btn btn-${variant} ${className}`} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      <span className="btn-text">
        <span>{en}</span>
        <Es>{es}</Es>
      </span>
    </button>
  );
}
