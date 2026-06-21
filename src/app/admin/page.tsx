'use client';

import dynamic from 'next/dynamic';

const AdminClient = dynamic(() => import('../home-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FFF9F5] flex flex-col items-center justify-center gap-4" dir="rtl">
      <div className="text-4xl font-bold text-[#8B1A4A]">لوحة التحكم</div>
      <div className="flex gap-2">
        <div className="h-4 w-4 rounded-full bg-[#D4A853]/50 animate-pulse" />
        <div className="h-4 w-4 rounded-full bg-[#8B1A4A]/50 animate-pulse" />
        <div className="h-4 w-4 rounded-full bg-[#D4A853]/50 animate-pulse" />
      </div>
      <p className="text-[#8B7355] text-sm">جاري تحميل لوحة التحكم...</p>
    </div>
  ),
});

export default function AdminPage() {
  return <AdminClient autoAdmin />;
}
