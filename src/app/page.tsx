"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Heart,
  Plus,
  Droplets,
  Zap,
  User,
  BarChart2,
  Settings,
} from "lucide-react";

export default function Home() {
  const [caffeine, setCaffeine] = useState(120);
  const limit = 400;
  const percentage = Math.min((caffeine / limit) * 100, 100);

  const recentLogs = [
    {
      id: 1,
      name: "White Coffee",
      time: "08:30 AM",
      caffeine: 80,
      sugar: 12,
      kcal: 150,
      rating: 5,
      icon: "☕",
    },
    {
      id: 2,
      name: "Latte Art",
      time: "10:15 AM",
      caffeine: 40,
      sugar: 5,
      kcal: 120,
      rating: 4,
      icon: "🎨",
    },
  ];

  return (
    <main className="min-h-screen pb-24 font-['Quicksand'] bg-transparent">
      {/* Header Area */}
      <header className="px-6 pt-12 pb-8 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-pink-400 font-bold text-xs uppercase tracking-widest bg-white/40 px-3 py-1 rounded-full w-fit backdrop-blur-sm">
            Chào buổi sáng
          </h2>
          <h1 className="text-3xl font-black text-amber-900 flex items-center gap-2 mt-2">
            {/* Hello, Princess!{" "} */}
            <Heart className="fill-pink-500 text-pink-500 w-6 h-6 animate-pulse" />
          </h1>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-pink-400 border-2 border-pink-50">
          <User size={28} />
        </div>
      </header>

      <div className="app-container px-6 space-y-10 mt-4">
        {/* Caffeine Tracker Card - ULTRA CONTRAST */}
        <section className="flex flex-col items-center">
          <div className="cute-card w-full p-10 flex flex-col items-center">
            <div className="relative w-60 h-60 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="120"
                  cy="120"
                  r="105"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className="text-pink-50/50"
                />
                <motion.circle
                  cx="120"
                  cy="120"
                  r="105"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeDasharray={2 * Math.PI * 105}
                  initial={{ strokeDashoffset: 2 * Math.PI * 105 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 105 * (1 - percentage / 100),
                  }}
                  fill="transparent"
                  strokeLinecap="round"
                  className="text-pink-400"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-7xl font-black text-amber-900 tracking-tighter drop-shadow-sm">
                  {caffeine}
                </span>
                <span className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em] mt-1">
                  mg Caffeine
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-12 w-full">
              <div className="flex flex-col items-center gap-2">
                <div className="p-4 bg-blue-50/50 text-blue-500 rounded-3xl shadow-sm">
                  <Droplets size={24} />
                </div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                  17g Sugar
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-4 bg-orange-50/50 text-orange-500 rounded-3xl shadow-sm">
                  <Zap size={24} />
                </div>
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">
                  270 Kcal
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-4 bg-rose-50/50 text-rose-500 rounded-3xl shadow-sm">
                  <Heart size={24} />
                </div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
                  98 BPM
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Add Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-amber-900 uppercase tracking-tight">
              Đồ uống ưa thích
            </h3>
            <div className="h-1 flex-1 mx-4 bg-pink-100/50 rounded-full" />
            <button className="bg-white text-pink-400 p-2.5 rounded-2xl shadow-lg border-2 border-pink-50 active:scale-90 transition-transform">
              <Plus size={24} />
            </button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-8 pt-2 scrollbar-hide px-2">
            {[
              { name: "Cappuccino", icon: "☕", c: 65, color: "bg-orange-50" },
              { name: "Matcha", icon: "🍵", c: 35, color: "bg-emerald-50" },
              { name: "Iced Tea", icon: "🥤", c: 25, color: "bg-blue-50" },
              { name: "Latte", icon: "🥛", c: 45, color: "bg-rose-50" },
            ].map((drink) => (
              <motion.button
                key={drink.name}
                whileHover={{ scale: 1.08, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-36 h-48 bg-white shadow-xl rounded-[3rem] flex flex-col items-center justify-between p-6 border-4 border-white hover:border-pink-100 transition-all font-sans"
                onClick={() => setCaffeine((prev) => prev + drink.c)}
              >
                <div
                  className={`w-20 h-20 ${drink.color} rounded-3xl flex items-center justify-center text-4xl shadow-inner`}
                >
                  {drink.icon}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-black text-amber-900 uppercase tracking-tight">
                    {drink.name}
                  </span>
                  <span className="text-[9px] font-bold text-pink-300 mt-1">
                    +{drink.c}mg
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recent History */}
        <section className="space-y-6 pb-20">
          <h3 className="text-2xl font-black text-amber-900 pl-2">
            Khoảnh khắc Cà phê
          </h3>
          <div className="space-y-6">
            {recentLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="cute-card p-6 flex items-center gap-6 border-l-[14px] border-l-pink-400 shadow-2xl shadow-pink-100/50"
              >
                <div className="text-4xl bg-stone-50 w-22 h-22 rounded-[2rem] flex items-center justify-center shadow-inner border-2 border-white">
                  {log.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black text-amber-900 tracking-tight">
                    {log.name}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-1">
                    {log.time} • {log.caffeine}mg Caffeine
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 bg-pink-50/50 p-3 rounded-3xl border-2 border-white shadow-sm">
                  <span className="text-sm font-black text-pink-500">
                    {log.rating}.0
                  </span>
                  <Heart className="fill-pink-500 text-pink-500" size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Navigation Bar - PREMIUM FLOATING */}
      <nav className="fixed bottom-8 left-8 right-8 h-22 bg-white/95 backdrop-blur-2xl border-4 border-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex items-center justify-around px-6 z-50">
        <button className="p-4 text-pink-400 hover:bg-pink-50 rounded-3xl transition-all active:scale-90">
          <BarChart2 size={30} />
        </button>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 bg-pink-400 text-white rounded-[2rem] shadow-2xl shadow-pink-300 -mt-16 border-8 border-white flex items-center justify-center transition-all"
          >
            <Plus size={40} strokeWidth={3} />
          </motion.button>
        </div>
        <button className="p-4 text-gray-300 hover:bg-gray-50 rounded-3xl transition-all active:scale-90">
          <Settings size={30} />
        </button>
      </nav>
    </main>
  );
}
