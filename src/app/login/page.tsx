"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

/* ── Helpers ──────────────────────────────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string): string | null {
  if (!value.trim()) return "Vui lòng nhập email";
  if (!EMAIL_REGEX.test(value))
    return "Email không đúng định dạng (ví dụ: ten@gmail.com)";
  return null; // hợp lệ
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* Validate realtime khi user gõ (chỉ sau lần blur đầu tiên) */
  const [touched, setTouched] = useState(false);

  const handleChange = (val: string) => {
    setEmail(val);
    if (touched) setFieldError(validateEmail(val));
  };

  const handleBlur = () => {
    setTouched(true);
    setFieldError(validateEmail(email));
  };

  const handleLogin = async () => {
    setTouched(true);
    const err = validateEmail(email);
    if (err) {
      setFieldError(err);
      return;
    }
    setFieldError(null);
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        const { access_token, refresh_token, user } = data.data || data;
        Cookies.set("coffee_token", access_token, { expires: 1 });
        Cookies.set("coffee_refresh_token", refresh_token, { expires: 7 });
        Cookies.set("coffee_user", JSON.stringify(user), { expires: 7 });
        toast.success(`🌸 Chào mừng trở về, ${user.name || "Princess"}!`);
        router.push("/");
      } else {
        const apiMsg =
          typeof data.message === "object" ? data.message?.email : data.message;

        if (res.status === 400) {
          // Email đúng format nhưng chưa có trong hệ thống
          toast.error(
            "Email này chưa được đăng ký! Bạn cần tạo tài khoản trước nhé 🌸",
            {
              action: {
                label: "Đăng ký ngay",
                onClick: () => router.push("/register"),
              },
              duration: 6000,
            },
          );
        } else {
          toast.error(apiMsg || "Đăng nhập thất bại, thử lại nhé!");
        }
      }
    } catch {
      toast.error("Lỗi kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const hasError = touched && !!fieldError;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ color: "var(--brown)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-10 space-y-5"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.06, 1], rotate: [0, 4, -4, 0] }}
            transition={{ repeat: Infinity, duration: 4.5 }}
            className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl"
            style={{
              background: "rgba(255,209,220,0.45)",
              border: "3px solid rgba(255,255,255,0.75)",
              boxShadow:
                "0 8px 30px rgba(245,167,186,0.30), inset 0 1px 1px rgba(255,255,255,0.7)",
            }}
          >
            ☕
          </motion.div>
        </div>

        <div>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "var(--brown)" }}
          >
            Coffee <span style={{ color: "var(--peach-deep)" }}>Sweetie</span>
          </h1>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.3em] mt-1"
            style={{ color: "var(--brown-muted)" }}
          >
            Tracker ✨ theo dõi
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="clay-card w-full max-w-sm p-8 space-y-6"
      >
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold" style={{ color: "var(--brown)" }}>
            Đăng nhập 🌸
          </h2>
          <p className="text-sm" style={{ color: "var(--brown-muted)" }}>
            Nhập email để vào cửa ngay nhé!
          </p>
        </div>

        {/* ── Email field ────────────────────────────────────── */}
        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="text-[10px] font-bold uppercase tracking-widest ml-3"
            style={{ color: "var(--brown-muted)" }}
          >
            Địa chỉ Email
          </label>

          <div className="relative">
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: hasError ? "#F06292" : "var(--peach-deep)" }}
            >
              <Mail size={18} strokeWidth={1.8} />
            </div>
            <input
              id="login-email"
              type="text"
              inputMode="email"
              placeholder="ten-cua-ban@gmail.com"
              value={email}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className={`soft-input ${hasError ? "error" : ""}`}
              style={{ paddingLeft: "3rem" }}
              aria-describedby={hasError ? "email-error" : undefined}
              aria-invalid={hasError}
            />
          </div>

          {/* Inline error message */}
          <AnimatePresence>
            {hasError && (
              <motion.div
                id="email-error"
                role="alert"
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 ml-3"
              >
                <AlertCircle size={12} color="#F06292" />
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "#F06292" }}
                >
                  {fieldError}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Submit ─────────────────────────────────────────── */}
        <button
          id="login-btn"
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary"
        >
          <span>{loading ? "Đang mở cửa…" : "Đăng nhập ngay"}</span>
          <ArrowRight size={20} />
        </button>

        <p
          className="text-center text-sm"
          style={{ color: "var(--brown-muted)" }}
        >
          Bạn là người mới?{" "}
          <button
            onClick={() => router.push("/register")}
            className="font-bold underline underline-offset-4 transition-colors"
            style={{ color: "var(--peach-deep)" }}
          >
            Đăng ký ngay 🌸
          </button>
        </p>
      </motion.div>

      <p
        className="mt-8 text-[10px] text-center uppercase tracking-widest"
        style={{ color: "var(--brown-muted)" }}
      >
        Hệ thống theo dõi sức khỏe với tình yêu của Mr.Híu 💕
      </p>
    </main>
  );
}
