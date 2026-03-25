"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, Zap, Droplets, Flame, Info, Star } from "lucide-react";

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
    "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-[var(--brown-muted)]";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] backdrop-blur-md"
            style={{ background: "rgba(109,76,65,0.4)" }}
          />

          <div className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-md pointer-events-auto clay-card overflow-hidden flex flex-col"
              style={{
                background: "rgba(255,245,225,1)",
                border: "2px solid white",
              }}
            >
              {/* Header Image Section */}
              <div className="relative h-64 w-full">
                {drinkType.imageUrl ? (
                  <img
                    src={drinkType.imageUrl}
                    alt={drinkType.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-rose-50/50 flex items-center justify-center">
                    <Coffee
                      size={80}
                      className="text-[var(--peach-deep)] opacity-20"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(255,245,225,1)] to-transparent" />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-[var(--brown-light)] hover:text-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 -mt-12 relative z-10 space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-[var(--brown)] tracking-tight">
                    {drinkType.name}
                  </h2>
                  <p className="text-sm text-[var(--brown-muted)] mt-1 italic">
                    {drinkType.description ||
                      "Một sự lựa chọn tuyệt vời cho ngày mới ✨"}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    icon={<Zap size={14} />}
                    label="Caffeine"
                    value={`${drinkType.caffeineMg}mg`}
                  />
                  <StatCard
                    icon={<Droplets size={14} />}
                    label="Đường"
                    value={`${drinkType.sugarG}g`}
                  />
                  <StatCard
                    icon={<Flame size={14} />}
                    label="Calories"
                    value={`${drinkType.calories}kcal`}
                  />
                </div>

                {/* Flavor Profile */}
                <div className="space-y-4 pt-2">
                  <h3 className={labelClass}>
                    <Star size={10} /> Đặc trưng hương vị
                  </h3>
                  <div className="space-y-3">
                    <FlavorSlider
                      label="Độ chua (Acidity)"
                      value={drinkType.acidity || 0}
                    />
                    <FlavorSlider
                      label="Độ đắng (Bitterness)"
                      value={drinkType.bitterness || 0}
                    />
                    <FlavorSlider
                      label="Thể chất (Body)"
                      value={drinkType.body || 0}
                    />
                  </div>
                </div>

                <button onClick={onClose} className="btn-primary w-full mt-4">
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="clay-card-sm p-3 flex flex-col items-center justify-center text-center">
      <div className="text-[var(--peach-deep)] mb-1">{icon}</div>
      <span className="text-[10px] font-bold text-[var(--brown-muted)] uppercase tracking-tighter">
        {label}
      </span>
      <span className="text-xs font-bold text-[var(--brown)]">{value}</span>
    </div>
  );
}

function FlavorSlider({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold">
        <span className="text-[var(--brown)]">{label}</span>
        <span className="text-[var(--peach-deep)]">{value}/10</span>
      </div>
      <div className="h-2 w-full bg-[var(--latte)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          className="h-full bg-[var(--peach-deep)]"
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
