"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, RefreshCw, ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

function VerifyContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = [...otp];
    text.split("").forEach((ch, i) => {
      if (i < 6) next[i] = ch;
    });
    setOtp(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
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
          toast.success(`[DEV] Mã mới: ${data.data.devOtp}`, {
            duration: 10000,
          });
        } else {
          toast.success("🌸 Mã OTP mới đã gửi về Gmail!");
        }
        setCountdown(60);
      } else {
        toast.error(data.message || "Gửi lại thất bại!");
      }
    } catch {
      toast.error("Lỗi kết nối tới Server!");
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
        Cookies.set("coffee_token", data.data.access_token, { expires: 1 });
        Cookies.set("coffee_refresh_token", data.data.refresh_token, {
          expires: 7,
        });
        Cookies.set(
          "coffee_user",
          JSON.stringify(data.data.user || data.user),
          { expires: 7 },
        );
        toast.success("🌸 Đăng nhập thành công! Chào mừng Princess!");
        router.push("/");
      } else {
        toast.error(data.message || "Mã OTP không chính xác!");
      }
    } catch {
      toast.error("Lỗi kết nối tới Server!");
    } finally {
      setLoading(false);
    }
  };

  const filled = otp.join("").length;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ color: "var(--brown)" }}
    >
      {/* Back btn */}
      <button
        onClick={() => router.push("/login")}
        className="absolute top-8 left-6 flex items-center gap-1.5 text-xs font-bold transition-colors py-2 px-3 rounded-2xl"
        style={{
          color: "var(--brown-light)",
          background: "rgba(215,204,200,0.30)",
        }}
      >
        <ChevronLeft size={15} /> Sửa Email
      </button>

      {/* ── Hero ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 space-y-5"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-24 h-24 rounded-[2rem] flex items-center justify-center"
            style={{
              background: "rgba(224,242,241,0.55)",
              border: "3px solid rgba(255,255,255,0.75)",
              boxShadow:
                "0 8px 30px rgba(178,223,219,0.35), inset 0 1px 1px rgba(255,255,255,0.7)",
            }}
          >
            <ShieldCheck
              size={44}
              strokeWidth={1.5}
              style={{ color: "#80CBC4" }}
            />
          </motion.div>
        </div>

        <div>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "var(--brown)" }}
          >
            Xác thực <span style={{ color: "var(--peach-deep)" }}>OTP</span> ✨
          </h1>
          <p
            className="text-xs font-medium mt-1"
            style={{ color: "var(--brown-muted)" }}
          >
            Mã đã gửi về
          </p>
          <span
            className="inline-block mt-1 px-4 py-1.5 text-sm font-bold rounded-2xl"
            style={{
              background: "rgba(255,209,220,0.30)",
              color: "var(--brown)",
              border: "1px solid rgba(245,167,186,0.35)",
            }}
          >
            {email || "user@example.com"}
          </span>
        </div>
      </motion.div>

      {/* ── OTP Card ─────────────────────────────────────────*/}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="clay-card w-full max-w-sm p-8 space-y-8"
      >
        {/* OTP inputs */}
        <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                if (el) inputRefs.current[i] = el;
              }}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="text-center text-2xl font-bold transition-all outline-none"
              style={{
                width: "3rem",
                height: "4rem",
                borderRadius: "1rem",
                background: digit
                  ? "rgba(255,209,220,0.35)"
                  : "rgba(255,245,225,0.80)",
                border: digit
                  ? "2px solid rgba(245,167,186,0.60)"
                  : "1.5px solid var(--latte)",
                color: "var(--brown)",
                boxShadow: "inset 0 2px 5px rgba(109,76,65,0.06)",
              }}
            />
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {otp.map((d, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: d ? "var(--peach-deep)" : "var(--latte)",
                transform: d ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            id="verify-btn"
            disabled={filled < 6 || loading}
            onClick={handleVerify}
            className="btn-primary"
          >
            <span>{loading ? "Đang xác minh…" : "Vào cửa ngay"}</span>
            <ArrowRight size={20} />
          </button>

          <button
            disabled={countdown > 0 || loading}
            onClick={handleResend}
            className="btn-ghost gap-2"
            style={{ fontSize: "0.8rem" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {countdown > 0
              ? `Gửi lại sau ${countdown}s`
              : "Chưa nhận mã? Gửi lại"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--vanilla)" }}
        >
          <div
            className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-3xl pulse-gentle"
            style={{ background: "rgba(255,209,220,0.35)" }}
          >
            ✨
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
