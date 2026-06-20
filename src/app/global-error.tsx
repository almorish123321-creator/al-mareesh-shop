'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#FFF9F5', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '2rem', maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
            <h2 style={{ color: '#2D1B14', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>حدث خطأ حرج</h2>
            <div style={{ backgroundColor: '#FEF2F2', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: '#DC2626', fontFamily: 'monospace', wordBreak: 'break-all' }}>{error?.message || 'خطأ غير معروف'}</p>
            </div>
            <button
              onClick={() => reset()}
              style={{ backgroundColor: '#8B1A4A', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
