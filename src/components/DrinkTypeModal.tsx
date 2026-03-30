"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Coffee,
  Camera,
  Layers,
  FileText,
  Zap,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface DrinkTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newType: any) => void;
}

export default function DrinkTypeModal({
  isOpen,
  onClose,
  onSuccess,
}: DrinkTypeModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    defaultSize: "M",
    defaultTemperature: "Hot",
    caffeineMg: 0,
    sugarG: 0,
    calories: 0,
    acidity: 0,
    bitterness: 0,
    body: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim())
      return toast.error("Tên loại đồ uống không được để trống");
    if (form.caffeineMg < 0) return toast.error("Caffeine không được âm");
    if (form.sugarG < 0) return toast.error("Lượng đường không được âm");
    if (form.calories < 0) return toast.error("Calories không được âm");

    setLoading(true);
    try {
      const res = await api.post("/drink-type", form);
      if (res.status === 201 || res.status === 200) {
        toast.success("Đã thêm loại đồ uống mới!");
        onSuccess(res.data.data || res.data);
        onClose();
        // Reset form
        setForm({
          name: "",
          description: "",
          imageUrl: "",
          defaultSize: "M",
          defaultTemperature: "Hot",
          caffeineMg: 0,
          sugarG: 0,
          calories: 0,
          acidity: 0,
          bitterness: 0,
          body: 0,
        });
        setPreviewUrl(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Rất tiếc, đã có lỗi khi tạo loại đồ uống");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await api.post("/drink-type/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = res.data?.data?.imageUrl || res.data?.imageUrl;
      if (imageUrl) {
        updateField("imageUrl", imageUrl);
        toast.success("Đã tải ảnh lên! 📸");
      }
    } catch (err) {
      toast.error("Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const labelClass =
    "text-[11px] font-bold uppercase tracking-widest ml-3 flex items-center gap-1.5 text-[var(--brown-muted)]";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
            className="relative w-full max-w-2xl bg-[var(--vanilla)] sm:clay-card shadow-2xl overflow-hidden rounded-t-[3rem] sm:rounded-[3rem] border-t-4 border-white sm:border-t-0 flex flex-col max-h-[90vh]"
          >
            <div className="w-12 h-1.5 bg-[var(--latte)]/40 rounded-full mx-auto my-4 sm:hidden" />

            {/* Header */}
            <div className="p-6 pb-2 flex items-center justify-between px-6 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-50 shadow-inner border border-white">
                  <Layers size={24} className="text-[var(--brown)]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--brown)] tracking-tight">
                    Danh mục đồ uống mới
                  </h2>
                  <p className="text-[10px] font-bold text-[var(--brown-muted)] uppercase tracking-widest">
                    Thiết lập thông số mặc định ✨
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl border border-white bg-white/50 text-[var(--brown-light)] hover:text-rose-500 transition-colors shadow-sm flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 pt-2 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-left px-6 sm:px-8 pb-10"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Photo area */}
                <div className="w-full md:w-[180px] space-y-3 shrink-0">
                  <label className={labelClass}>🖼️ Hình ảnh</label>
                  <div
                    className="aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:bg-rose-50"
                    style={{
                      borderColor: "var(--latte)",
                      background: previewUrl
                        ? "white"
                        : "rgba(255,255,255,0.4)",
                    }}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera
                          size={24}
                          className="text-[var(--peach-deep)] group-hover:scale-110 transition-transform"
                        />
                        <span className="text-[9px] font-black text-[var(--brown-muted)] uppercase tracking-tighter text-center px-4">
                          Tải ảnh minh họa
                        </span>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="w-6 h-6 border-3 border-[var(--peach-deep)] border-t-transparent animate-spin rounded-full" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-5">
                  <div className="space-y-2">
                    <label className={labelClass}>
                      <Coffee size={12} /> Tên danh mục
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="soft-input h-14 font-black"
                      placeholder="VD: Espresso, Trà Đào..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      <FileText size={12} /> Mô tả ngắn
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      className="soft-input h-20 pt-4 resize-none text-sm font-medium !rounded-[1.5rem]"
                      placeholder="Mô tả công thức hoặc đặc điểm của loại này..."
                    />
                  </div>
                </div>
              </div>

              {/* Default Settings Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                <div className="space-y-5">
                  <div className="flex items-center gap-2 px-3">
                    <Zap size={14} className="text-orange-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--brown-muted)]">
                      Chỉ số mặc định
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <NumInput
                      label="Caffeine"
                      unit="mg"
                      value={form.caffeineMg}
                      onChange={(v) => updateField("caffeineMg", v)}
                    />
                    <NumInput
                      label="Đường"
                      unit="g"
                      value={form.sugarG}
                      onChange={(v) => updateField("sugarG", v)}
                    />
                    <NumInput
                      label="Calories"
                      unit="kcal"
                      value={form.calories}
                      onChange={(v) => updateField("calories", v)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3">
                    <Star size={14} className="text-yellow-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--brown-muted)]">
                      Hương vị gốc
                    </h3>
                  </div>
                  <div className="space-y-3 bg-white/40 p-5 rounded-[2.5rem] border border-white/60">
                    <Slider
                      label="Độ chua"
                      value={form.acidity}
                      onChange={(v) => updateField("acidity", v)}
                    />
                    <Slider
                      label="Độ đắng"
                      value={form.bitterness}
                      onChange={(v) => updateField("bitterness", v)}
                    />
                    <Slider
                      label="Thể chất"
                      value={form.body}
                      onChange={(v) => updateField("body", v)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="btn-primary w-full h-16 shadow-xl"
                >
                  {loading ? "Đang xử lý... ✨" : "Xác nhận tạo danh mục 🥂"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center py-2 text-sm font-bold text-[var(--brown-muted)]"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function NumInput({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[8px] font-black uppercase text-[var(--brown-muted)] ml-1 tracking-widest leading-none">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="soft-input h-11 px-2 text-xs text-center font-black"
          placeholder="0"
        />
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-[var(--brown-light)] uppercase tracking-tighter w-full text-center">
          {unit}
        </span>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest px-1">
        <span className="text-[var(--brown-muted)]">{label}</span>
        <span className="text-[var(--peach-deep)] bg-white px-1.5 rounded-full shadow-sm">
          {value}/10
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[var(--peach-deep)] transition-all bg-[var(--latte)]/30"
        style={{
          background: `linear-gradient(to right, var(--peach-deep) ${value * 10}%, rgba(215,204,200,0.3) ${value * 10}%)`,
        }}
      />
    </div>
  );
}
