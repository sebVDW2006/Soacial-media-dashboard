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
                <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-6 py-5 lg:px-10">
                  <span className="text-[1.85rem] font-semibold tracking-[-0.08em] text-[var(--brand)]">
                    Content OS
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
