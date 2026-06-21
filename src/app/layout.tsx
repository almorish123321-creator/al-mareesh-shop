import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "المريش شوب | Al-Mareesh Shop",
  description: "متجر المريش شوب الإلكتروني - ملابس الأطفال والنسائية والأحذية",
  icons: { icon: "/logo.svg" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "المريش شوب",
  },
  openGraph: {
    type: "website",
    title: "المريش شوب | Al-Mareesh Shop",
    description: "متجرك المفضل لملابس الأطفال والنسائية والأحذية بأسعار مميزة وجودة عالية",
    siteName: "المريش شوب",
  },
};

export const viewport: Viewport = {
  themeColor: "#2D1B14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased bg-[#FFF9F5] text-[#2D1B14] font-sans">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
