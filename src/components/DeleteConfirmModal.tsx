"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa?",
  message = "Dữ liệu này sẽ bị biến mất vĩnh viễn đó nha! 🌸",
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[rgba(109,76,65,0.4)] backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm clay-card p-8 text-center space-y-6 shadow-2xl"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-4xl shadow-inner">
            <AlertTriangle className="text-rose-500" size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--brown)]">{title}</h3>
            <p className="text-sm text-[var(--brown-muted)] font-medium">
              {message}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={onClose} className="btn-ghost">
              Hủy bỏ
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="btn-primary"
              style={{
                background: "linear-gradient(135deg, #fda4af 0%, #fb7185 100%)",
                boxShadow: "0 8px 20px rgba(251, 113, 133, 0.4)",
              }}
            >
              Xóa ngay!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
