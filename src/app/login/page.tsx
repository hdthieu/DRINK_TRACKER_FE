"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      console.log("--- ĐANG GỌI API TẠI: ---", apiUrl);
      const res = await fetch(`${apiUrl}/auth/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.data?.devOtp) {
          toast.success(`[DEV MODE] Mã của bạn là: ${data.data.devOtp}`, {
            duration: 10000,
            icon: "🌸",
          });
        } else {
          toast.success("Mã OTP đã được gửi về Gmail của bạn 🌸");
        }
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(data.message || "Gửi mã thất bại!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối tới Server! 🏹");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen app-container px-8 flex flex-col justify-center gap-12 font-['Quicksand']">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto border-4 border-pink-100"
        >
          <Heart className="fill-pink-400 text-pink-400 w-12 h-12" />
        </motion.div>
        <h1 className="text-4xl font-black text-amber-900 tracking-tight">
          🌸 Coffee Diary 🌸
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          Welcome Back
        </p>
      </div>

      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleRequestOtp}
        className="cute-card p-10 space-y-8"
      >
        <div className="space-y-3">
          <label className="text-sm font-black text-amber-900 ml-4 uppercase tracking-tighter">
            Email của bạn
          </label>
          <div className="relative">
            <Mail
              className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-300"
              size={24}
            />
            <input
              type="email"
              placeholder="princess@example.com"
              required
              className="w-full h-18 bg-pink-50/50 border-4 border-transparent focus:border-pink-200 focus:bg-white rounded-[2rem] pl-16 pr-6 outline-none transition-all font-bold text-amber-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full h-18 gradient-pink rounded-[2rem] shadow-2xl shadow-pink-200 text-white font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Đang gửi mã..." : "Gửi mã OTP cho tôi"}
          <ArrowRight size={24} />
        </button>
      </motion.form>

      <p className="text-center text-xs font-bold text-gray-400">
        Bằng cách tiếp tục, bạn đồng ý với các{" "}
        <span className="text-pink-400 underline italic">
          điều khoản đáng yêu
        </span>{" "}
        của chúng tôi
      </p>
    </main>
  );
}
