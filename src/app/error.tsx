'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#2D1B14] mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-gray-500 text-sm mb-4">نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.</p>
        <div className="bg-red-50 rounded-lg p-3 mb-4 text-right">
          <p className="text-xs text-red-600 font-mono break-words">{error?.message || 'خطأ غير معروف'}</p>
        </div>
        <button
          onClick={() => reset()}
          className="bg-[#8B1A4A] text-white px-6 py-2 rounded-lg hover:bg-[#6B1438] transition-colors font-medium"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
