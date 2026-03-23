"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Lấy chìa khóa từ Cookies
      const token = Cookies.get("coffee_token");
      const publicPaths = ["/login", "/verify", "/register"];
      const isPublicPath = publicPaths.includes(pathname);

      if (!token && !isPublicPath) {
        setAuthorized(false);
        router.push("/login");
      } else {
        setAuthorized(true);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!authorized && !["/login", "/verify"].includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-300 font-bold">
        Đang kiểm tra...
      </div>
    );
  }

  return <>{children}</>;
}
