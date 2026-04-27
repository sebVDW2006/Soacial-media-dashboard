import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Content OS",
  description: "A central content management system for Seb and uBlend",
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
      <body>
        <div className="page-shell">
          <Suspense
            fallback={
              <header className="top-nav">
                <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                  <span className="text-[1.85rem] font-semibold tracking-[-0.08em] text-[var(--brand)]">
                    Content OS
                  </span>
                </div>
              </header>
            }
          >
            <Nav />
          </Suspense>
          <main className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
