"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, RefreshCw, ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function VerifyContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  // Bộ đếm ngược cho nút gửi lại
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/auth/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.data?.devOtp) {
          toast.success(`[DEV] Mã mới của bạn là: ${data.data.devOtp}`, {
            duration: 10000,
          });
        } else {
          toast.success("Mã OTP mới đã được gửi về Gmail 🌸");
        }
        setCountdown(60); // Đợi 60s để được gửi lại tiếp
      } else {
        toast.error(data.message || "Gửi lại thất bại!");
      }
    } catch (e) {
      toast.error("Lỗi kết nối tới Server! 🏹");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("coffee_token", data.data.access_token);
        localStorage.setItem("coffee_refresh_token", data.data.refresh_token);
        localStorage.setItem(
          "coffee_user",
          JSON.stringify(data.data.user || data.user),
        );
        toast.success("Đăng nhập thành công! Chào mừng Princess 🌸");
        router.push("/");
      } else {
        toast.error(data.message || "Mã OTP không chính xác!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối tới Server! 🏹");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen app-container px-8 flex flex-col justify-center gap-12 font-['Quicksand'] relative">
      {/* Nút quay lại tinh tế */}
      <button
        onClick={() => router.push("/login")}
        className="absolute top-12 left-8 flex items-center gap-1 text-pink-300 font-black text-sm hover:text-pink-500 transition-colors"
      >
        <ChevronLeft size={20} />
        SỬA EMAIL
      </button>

      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto border-4 border-pink-100">
          <ShieldCheck className="text-pink-400 w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-amber-900 tracking-tight">
            Xác thực OTP 🌸
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
            Mã đã được gửi về email:
          </p>
          <span className="text-pink-400 font-black text-sm">
            {email || "princess@example.com"}
          </span>
        </div>
      </div>

      <div className="cute-card p-6 sm:p-10 space-y-12 bg-white/95">
        <div className="flex justify-center gap-1.5 sm:gap-3">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                if (el) inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-10 h-14 sm:w-12 sm:h-16 bg-pink-50/50 border-4 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl text-center text-xl sm:text-2xl font-black text-amber-900 outline-none transition-all shadow-inner"
            />
          ))}
        </div>

        <div className="space-y-4">
          <button
            disabled={otp.join("").length < 6 || loading}
            onClick={handleVerify}
            className="w-full h-18 gradient-pink rounded-[2.5rem] shadow-2xl shadow-pink-200 text-white font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Đang xác minh..." : "Xác nhận & Vào cửa"}
            <ArrowRight size={24} />
          </button>

          <button
            disabled={countdown > 0 || loading}
            onClick={handleResend}
            className="w-full flex items-center justify-center gap-2 text-pink-300 font-bold text-xs uppercase tracking-widest hover:text-pink-400 transition-colors disabled:opacity-50 disabled:grayscale"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {countdown > 0
              ? `Bạn có thể gửi lại sau ${countdown}s`
              : "Tôi chưa nhận được mã? Gửi lại"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-pink-300 font-bold">
          Đang chuẩn bị... 🌸
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
