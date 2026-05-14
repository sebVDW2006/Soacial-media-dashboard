import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { VersionWatcher } from "@/components/VersionWatcher";

export const metadata: Metadata = {
  title: "Content Dashboard",
  description: "A central content management system for Seb and uBlend",
  applicationName: "Content Dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Content Dashboard",
  },
  icons: {
    apple: "/icons/icon-192.png",
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f0e8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <VersionWatcher />
        <div className="page-shell">
          <Suspense
            fallback={
              <header className="top-nav">
                <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-6 py-5 lg:px-10">
                  <span className="text-[1.85rem] font-semibold tracking-[-0.08em] text-[var(--brand)]">
                    Content Dashboard
                  </span>
                </div>
              </header>
            }
          >
            <Nav />
          </Suspense>
          <main className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-8 lg:px-10 lg:pt-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
