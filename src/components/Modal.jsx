import { useEffect, useRef } from 'react';

// Accessible dialog: moves focus inside, keeps Tab inside, Escape closes,
// and gives focus back to the button that opened it.
export default function Modal({ title, onClose, children, labelledBy = 'modal-title' }) {
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
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref} tabIndex={-1}>
        <h2 id={labelledBy}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
