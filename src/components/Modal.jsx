import { useEffect, useRef } from 'react';
import { useGame } from '../state/GameContext.jsx';
import Icon from './Icon.jsx';

// Accessible dialog: moves focus inside, keeps Tab inside, Escape closes,
// and gives focus back to the button that opened it.
export default function Modal({ title, onClose, children, labelledBy = 'modal-title', sfx = 'click' }) {
  const { t } = useGame();
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const opener = document.activeElement;
    const node = ref.current;
    const focusables = () => [...node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled);
    (focusables()[0] || node).focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && onCloseRef.current) {
        e.preventDefault();
        onCloseRef.current();
      } else if (e.key === 'Tab') {
        const els = focusables();
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      if (opener && opener.focus) opener.focus();
    };
    // Run once. onClose is a new function on every parent render; re-running
    // this would focus the first control again and scroll the dialog to the top.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref} tabIndex={-1} data-sfx={sfx === 'none' ? 'none' : undefined}>
        <h2 className="modal-title" id={labelledBy}>{title}</h2>
        <div className="modal-body">{children}</div>
        {onClose ? (
          <button type="button" className="modal-x" onClick={onClose} aria-label={t('close')}>
            <Icon name="cross" size={22} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
