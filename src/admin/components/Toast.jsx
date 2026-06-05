import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`admin-toast admin-toast--${type}`} role="status">
      <span className="admin-toast__chrome" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
