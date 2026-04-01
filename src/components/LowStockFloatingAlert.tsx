"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { InventoryItem } from "@/lib/types";

interface LowStockFloatingAlertProps {
  items: InventoryItem[];
}

export function LowStockFloatingAlert({ items }: LowStockFloatingAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show if there are items and not dismissed in this session
    const dismissed = sessionStorage.getItem("low-stock-dismissed");
    if (items.length > 0 && !dismissed) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [items]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem("low-stock-dismissed", "true");
  };

  if (items.length === 0 || isDismissed) return null;

  const criticalCount = items.filter((i) => i.quantityInBaseUnit === 0).length;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:w-80"
        >
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-rose-100 shadow-[0_20px_50px_rgba(225,29,72,0.15)] rounded-[2rem] p-5">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-100/50 rounded-full blur-2xl" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200 animate-pulse">
                <AlertTriangle size={20} />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <h4 className="font-black text-[var(--brown)] text-sm">
                  Princess ơi! 🚨
                </h4>
                <p className="text-[11px] text-[var(--brown-muted)] font-medium mt-0.5 leading-relaxed">
                  Có{" "}
                  <span className="text-rose-500 font-bold">
                    {items.length} món
                  </span>{" "}
                  trong kho sắp hết, trong đó có {criticalCount} món đã cạn sạch
                  rồi ạ!
                </p>
              </div>

              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-rose-50 text-[var(--brown-muted)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href="/inventory"
                onClick={handleDismiss}
                className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-100"
              >
                <ShoppingCart size={14} /> Đi chợ ngay 🌸
              </Link>
              <button
                onClick={handleDismiss}
                className="px-4 h-11 bg-white border border-[var(--latte)] text-[var(--brown-muted)] rounded-xl text-[10px] font-bold hover:bg-gray-50 transition-all"
              >
                Để sau ạ
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
