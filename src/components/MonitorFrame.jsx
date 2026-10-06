// The rounded frame around a picture. Room 1 adds selected, right and review
// classes. Step pictures use the plain frame only.
export default function MonitorFrame({ className = '', children }) {
  const extra = className.trim();
  return (
    <span className={extra ? `monitor ${extra}` : 'monitor'}>
      {children}
      <span className="monitor-dot" aria-hidden="true" />
    </span>
  );
}
