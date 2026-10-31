import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught rendering exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'Poppins, system-ui, sans-serif',
            background: 'var(--bg-body, #f8fafc)',
            color: 'var(--text-main, #1e293b)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              maxWidth: 480,
              background: 'var(--bg-card, #ffffff)',
              padding: 36,
              borderRadius: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid var(--border-glass, #e2e8f0)'
            }}
          >
            <img
              src="/assets/images/logo/vibe-3d-logo.jpg"
              alt="Vibe Bazzar"
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                margin: '0 auto 16px',
                display: 'block',
                boxShadow: '0 8px 24px rgba(255, 71, 87, 0.35)'
              }}
            />
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#ff4757' }}>
              Oops! Something went wrong
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
              {this.state.error?.message || 'A transient UI rendering issue occurred.'}
            </p>
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                padding: '10px 24px',
                borderRadius: 99,
                background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 71, 87, 0.4)'
              }}
            >
              Reload Vibe Bazzar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
