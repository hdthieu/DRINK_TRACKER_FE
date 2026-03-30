"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, Zap, Droplets, Flame, Star, StarHalf } from "lucide-react";

interface DrinkTypeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  drinkType: any;
}

export default function DrinkTypeDetailModal({
  isOpen,
  onClose,
  drinkType,
}: DrinkTypeDetailProps) {
  if (!drinkType) return null;

  const labelClass =
    "text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-[var(--brown-muted)] ml-2";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[190] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(109,76,65,0.5)] backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 1 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-[var(--vanilla)] sm:clay-card shadow-2xl overflow-hidden rounded-t-[3rem] sm:rounded-[3rem] border-t-4 border-white sm:border-t-0 flex flex-col max-h-[90vh]"
          >
            <div className="w-12 h-1.5 bg-[var(--latte)]/40 rounded-full mx-auto my-4 sm:hidden" />

            {/* Header Image Section */}
            <div className="relative h-72 w-full shrink-0">
              {drinkType.imageUrl ? (
                <img
                  src={drinkType.imageUrl}
                  alt={drinkType.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-rose-50 flex items-center justify-center shadow-inner">
                  <Coffee
                    size={100}
                    className="text-[var(--peach-deep)] opacity-10"
                  />
                </div>
              )}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--vanilla)] via-transparent to-black/20" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg border border-white flex items-center justify-center text-[var(--brown)] hover:text-rose-500 transition-all hover:scale-110"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-6 left-8 right-8">
                <h2 className="text-3xl font-black text-[var(--brown)] tracking-tight drop-shadow-sm">
                  {drinkType.name}
                </h2>
                <div className="flex gap-1 mt-2">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <StarHalf
                    size={12}
                    className="text-yellow-500 fill-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar pt-4">
              <div className="space-y-3">
                <p className="text-sm text-[var(--brown-muted)] leading-relaxed font-bold italic bg-white/50 p-4 rounded-3xl border border-white/80 shadow-inner">
                  {drinkType.description ||
                    "Một sự lựa chọn tuyệt vời cho ngày mới đầy năng lượng của Princess ✨"}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  icon={<Zap size={16} />}
                  label="Caffeine"
                  value={`${drinkType.caffeineMg}`}
                  unit="mg"
                />
                <StatCard
                  icon={<Droplets size={16} />}
                  label="Đường"
                  value={`${drinkType.sugarG}`}
                  unit="g"
                />
                <StatCard
                  icon={<Flame size={16} />}
                  label="Calories"
                  value={`${drinkType.calories}`}
                  unit="kcal"
                />
              </div>

              {/* Flavor Profile */}
              <div className="space-y-4 pt-2">
                <h3 className={labelClass}>
                  <Star size={14} className="text-[var(--peach-deep)]" />{" "}
                  Profile hương vị
                </h3>
                <div className="space-y-4 bg-white/40 p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
                  <FlavorSlider
                    label="🍬 Độ chua"
                    value={drinkType.acidity || 0}
                  />
                  <FlavorSlider
                    label="☕ Độ đắng"
                    value={drinkType.bitterness || 0}
                  />
                  <FlavorSlider
                    label="🥛 Thể chất"
                    value={drinkType.body || 0}
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="btn-primary w-full h-16 shadow-xl text-lg"
                >
                  Xác nhận thông tin ✨
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-center py-2 text-sm font-black text-[var(--brown-muted)] uppercase tracking-widest"
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: any;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="clay-card-sm p-4 flex flex-col items-center justify-center text-center shadow-sm hover:scale-105 transition-transform border-white">
      <div className="text-[var(--peach-deep)] mb-1.5 drop-shadow-sm">
        {icon}
      </div>
      <span className="text-[9px] font-black text-[var(--brown-muted)] uppercase tracking-tighter leading-none mb-1">
        {label}
      </span>
      <span className="text-sm font-black text-[var(--brown)]">
        {value}{" "}
        <span className="text-[8px] font-bold text-[var(--brown-muted)]">
          {unit}
        </span>
      </span>
    </div>
  );
}

function FlavorSlider({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black px-1 uppercase tracking-widest">
        <span className="text-[var(--brown)]">{label}</span>
        <span className="text-[var(--peach-deep)] bg-white px-2 rounded-full shadow-sm">
          {value}/10
        </span>
      </div>
      <div className="h-2 w-full bg-[var(--latte)]/30 rounded-full overflow-hidden border border-white">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          className="h-full bg-[var(--peach-deep)] shadow-[0_0_10px_rgba(245,167,186,0.5)]"
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
