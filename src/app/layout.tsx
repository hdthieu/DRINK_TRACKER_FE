import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "../components/AuthGuard";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Coffee Sweetie Tracker 🌸",
  description: "Theo dõi caffeine & đường với tất cả tình yêu ☕💕",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen overflow-x-hidden relative"
        style={{ background: "var(--vanilla)", color: "var(--brown)" }}
      >
        {/* ─── Ambient background blobs ─────────────────────── */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
        >
          {/* Peach top-left */}
          <div
            className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-[120px]"
            style={{ background: "rgba(255,209,220,0.38)" }}
          />
          {/* Mint bottom-right */}
          <div
            className="absolute -bottom-24 -right-24 w-[440px] h-[440px] rounded-full blur-[110px]"
            style={{ background: "rgba(224,242,241,0.45)" }}
          />
          {/* Latte center warmth */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px]"
            style={{ background: "rgba(255,245,225,0.55)" }}
          />
        </div>

        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 600,
              borderRadius: "1.5rem",
              border: "1.5px solid rgba(215,204,200,0.5)",
              background: "rgba(255,245,225,0.95)",
              color: "var(--brown)",
              backdropFilter: "blur(16px)",
            },
          }}
        />

        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
