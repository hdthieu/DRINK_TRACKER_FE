"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("coffee_token");
    const publicPaths = ["/login", "/verify"];

    if (!token) {
      if (!publicPaths.includes(pathname)) {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    } else {
      if (publicPaths.includes(pathname)) {
        router.push("/");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff5f7] font-['Quicksand']">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-pink-400 font-bold">
            Đợi Princess một xíu nhé... 🌸
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
