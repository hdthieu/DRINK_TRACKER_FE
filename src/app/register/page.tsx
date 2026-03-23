"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !name) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/auth/request-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.data?.devOtp) {
          toast.success(`[DEV] Mã OTP của bạn: ${data.data.devOtp}`, {
            duration: 10000,
          });
        } else {
          toast.success("🌸 Mã OTP đã gửi! Chào mừng Princess!");
        }
        router.push(`/verify?email=${encodeURIComponent(email)}&mode=register`);
      } else {
        toast.error(data.message || "Email này đã được đăng ký rồi!");
      }
    } catch {
      toast.error("Lỗi kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ color: "var(--brown)" }}
    >
      {/* ── Hero ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 space-y-5"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl"
            style={{
              background: "rgba(224,242,241,0.55)",
              border: "3px solid rgba(255,255,255,0.75)",
              boxShadow:
                "0 8px 30px rgba(178,223,219,0.35), inset 0 1px 1px rgba(255,255,255,0.7)",
            }}
          >
            🌸
          </motion.div>
        </div>

        <div>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "var(--brown)" }}
          >
            Tham gia <span style={{ color: "var(--peach-deep)" }}>ngay</span>!
          </h1>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.3em] mt-1"
            style={{ color: "var(--brown-muted)" }}
          >
            Khởi đầu hành trình năng lượng mới ✨
          </p>
        </div>
      </motion.div>

      {/* ── Card ─────────────────────────────────────────────*/}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="clay-card w-full max-w-sm p-8 space-y-5"
      >
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold" style={{ color: "var(--brown)" }}>
            Đăng ký thành viên 🍵
          </h2>
          <p className="text-sm" style={{ color: "var(--brown-muted)" }}>
            Điền thông tin để bắt đầu nhé!
          </p>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            className="text-[10px] font-bold uppercase tracking-widest ml-3"
            style={{ color: "var(--brown-muted)" }}
          >
            Email của bạn
          </label>
          <div className="relative">
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--peach-deep)" }}
            >
              <Mail size={18} strokeWidth={1.8} />
            </div>
            <input
              id="reg-email"
              type="email"
              placeholder="nhap-email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="soft-input"
              style={{ paddingLeft: "3rem" }}
            />
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label
            className="text-[10px] font-bold uppercase tracking-widest ml-3"
            style={{ color: "var(--brown-muted)" }}
          >
            Tên của bạn
          </label>
          <div className="relative">
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--mint-deep, #80CBC4)" }}
            >
              <UserIcon size={18} strokeWidth={1.8} />
            </div>
            <input
              id="reg-name"
              type="text"
              placeholder="Princess ✨"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              className="soft-input"
              style={{ paddingLeft: "3rem" }}
            />
          </div>
        </div>

        <button
          id="reg-btn"
          onClick={handleRegister}
          disabled={loading || !email || !name}
          className="btn-primary"
        >
          <span>{loading ? "Đang chuẩn bị…" : "Đăng ký thành viên"}</span>
          <ArrowRight size={20} />
        </button>

        <p
          className="text-center text-sm"
          style={{ color: "var(--brown-muted)" }}
        >
          Đã có tài khoản?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-bold underline underline-offset-4"
            style={{ color: "var(--peach-deep)" }}
          >
            Đăng nhập ngay
          </button>
        </p>
      </motion.div>
    </main>
  );
}
