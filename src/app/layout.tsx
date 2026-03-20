import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "../components/AuthGuard";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Coffee Diary 🌸",
  description: "Theo dõi caffeine với tất cả tình yêu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="antialiased">
      <body className="min-h-screen bg-[#fffcf9] overflow-x-hidden relative font-['Quicksand']">
        <Toaster richColors position="top-center" />
        {/* Decorative background blobs */}
        <div className="fixed inset-0 -z-10 pointer-events-none opacity-50 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-100/40 blur-[130px] rounded-full" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-orange-100/30 blur-[110px] rounded-full" />
        </div>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
