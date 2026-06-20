import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "المريش شوب | Al-Mareesh Shop",
  description: "متجر المريش شوب الإلكتروني - ملابس الأطفال والنسائية والأحذية",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-[#FFF9F5] text-[#2D1B14] font-sans">
        {children}
      </body>
    </html>
  );
}
