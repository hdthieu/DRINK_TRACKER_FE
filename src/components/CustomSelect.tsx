"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  val: string | number;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (val: any) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.val === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`soft-input flex items-center justify-between px-5 transition-all duration-300 ${
          isOpen
            ? "border-[var(--peach-deep)] ring-2 ring-[var(--peach)]/20"
            : ""
        }`}
      >
        <span
          className={`truncate ${!selectedOption ? "text-[var(--brown-muted)]" : "text-[var(--brown)] font-bold"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "backOut" }}
          className="text-[var(--brown-muted)]"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 right-0 z-[200] clay-card p-2 shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto"
          >
            <div className="flex flex-col gap-1">
              {options.map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    onChange(opt.val);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                    opt.val === value
                      ? "bg-[var(--peach)] text-[var(--brown)]"
                      : "hover:bg-[var(--vanilla-soft)] text-[var(--brown-light)] hover:text-[var(--brown)]"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.val === value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[var(--brown)]"
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
