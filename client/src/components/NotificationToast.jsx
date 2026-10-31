import React from 'react';
import { useShop } from '../context/ShopContext';
import { X } from 'lucide-react';

export const NotificationToast = () => {
  const { toast, setToast } = useShop();

  if (!toast || !toast.visible) return null;

  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="notification-toast">
      <button className="toast-close-btn" onClick={closeToast} aria-label="Close notification">
        <X size={16} />
      </button>

      <div className="toast-banner">
        <img
          src={toast.image}
          alt={toast.title}
          width="80"
          height="70"
        />
      </div>

      <div className="toast-detail">
        <p className="toast-message">{toast.message}</p>
        <p className="toast-title">{toast.title}</p>
        <p className="toast-meta">
          <time>{toast.time}</time>
        </p>
      </div>
    </div>
  );
};
