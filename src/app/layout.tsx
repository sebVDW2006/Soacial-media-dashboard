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
                <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-4">
                  <span className="text-2xl font-bold tracking-[-0.08em] text-leaf">Content OS</span>
                </div>
              </header>
            }
          >
            <Nav />
          </Suspense>
          <main className="page-wrap">{children}</main>
        </div>
      </body>
    </html>
  );
}
