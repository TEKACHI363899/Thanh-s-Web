import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetData = () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu về mặc định và xóa bộ nhớ đệm trình duyệt?')) {
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('Cannot clear localStorage:', e);
      }
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '24px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: '#1e293b',
              padding: '32px',
              borderRadius: '16px',
              border: '1.5px solid #334155',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f87171', marginBottom: '12px' }}>
              Đã Xảy Ra Lỗi Khởi Chạy Ứng Dụng
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '20px' }}>
              Hệ thống đã tự động bảo vệ dữ liệu. Vui lòng thử tải lại trang hoặc khôi phục dữ liệu đệm nếu cần.
            </p>

            {this.state.error && (
              <div
                style={{
                  backgroundColor: '#0f172a',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  fontSize: '13px',
                  color: '#fbbf24',
                  fontFamily: 'monospace',
                  marginBottom: '24px',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Tải Lại Trang
              </button>

              <button
                onClick={this.handleResetData}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Xóa Cache & Khôi Phục Dữ Liệu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
