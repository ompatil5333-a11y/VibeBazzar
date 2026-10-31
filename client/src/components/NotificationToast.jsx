import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Sparkles } from 'lucide-react';

export const NotificationToast = () => {
  const { toast, setToast, activePage } = useShop();

  if (!toast || !toast.visible || activePage === 'login' || activePage === 'admin') return null;

  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="notification-toast">
      <button
        onClick={closeToast}
        aria-label="Close notification"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          padding: 2
        }}
      >
        <X size={14} />
      </button>

      <div style={{ flexShrink: 0 }}>
        <img
          src={toast.image}
          alt={toast.title}
          style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }}
        />
      </div>

      <div style={{ flex: 1, paddingRight: 10 }}>
        <p style={{ fontSize: 11, color: '#0071e3', fontWeight: 600, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={11} />
          {toast.message}
        </p>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {toast.title}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>
          {toast.time}
        </p>
      </div>
    </div>
  );
};
