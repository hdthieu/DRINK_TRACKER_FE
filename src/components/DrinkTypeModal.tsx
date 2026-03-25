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
  Maximize,
  Thermometer,
  Zap,
  Droplets,
  Flame,
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
    "text-[10px] font-bold uppercase tracking-widest ml-3 flex items-center gap-1 text-[var(--brown-muted)]";

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
              className="w-full max-w-2xl pointer-events-auto clay-card flex flex-col overflow-hidden"
              style={{
                background: "rgba(255,245,225,1)",
                border: "2px solid white",
              }}
            >
              {/* Header */}
              <div className="p-6 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-100/50">
                    <Layers size={20} className="text-[var(--brown)]" />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--brown)]">
                    Thông số loại đồ uống mặc định
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-[var(--brown-light)] hover:text-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 pt-2 space-y-6 overflow-y-auto custom-scrollbar max-h-[80vh] text-left"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Photo area */}
                  <div className="w-full md:w-1/3 space-y-2">
                    <div
                      className="aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:bg-rose-50"
                      style={{
                        borderColor: "var(--latte)",
                        background: previewUrl
                          ? "white"
                          : "rgba(255,245,225,0.5)",
                      }}
                      onClick={() =>
                        !uploading && fileInputRef.current?.click()
                      }
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <Camera
                            size={24}
                            className="text-[var(--brown-light)]"
                          />
                          <span className="text-[10px] font-bold text-[var(--brown-muted)]">
                            Tải ảnh loại
                          </span>
                        </>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
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

                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        <Coffee size={10} /> Tên danh mục
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="soft-input h-14 font-bold"
                        placeholder="VD: Espresso, Trà Đào..."
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        <FileText size={10} /> Mô tả
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          updateField("description", e.target.value)
                        }
                        className="soft-input h-14 pt-3 resize-none text-sm"
                        placeholder="Mô tả ngắn gọn về loại này"
                      />
                    </div>
                  </div>
                </div>

                {/* Default Settings Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-6">
                    <h3 className={labelClass}>
                      <Zap size={10} /> Chỉ số mặc định
                    </h3>
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
                    <h3 className={labelClass}>
                      <Star size={10} /> Hương vị
                    </h3>
                    <Slider
                      label="Độ chua (Acidity)"
                      value={form.acidity}
                      onChange={(v) => updateField("acidity", v)}
                    />
                    <Slider
                      label="Độ đắng (Bitterness)"
                      value={form.bitterness}
                      onChange={(v) => updateField("bitterness", v)}
                    />
                    <Slider
                      label="Thể chất (Body)"
                      value={form.body}
                      onChange={(v) => updateField("body", v)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? "Đang lưu..." : "Xác nhận tạo loại mới"}
                </button>
              </form>
            </motion.div>
          </div>
        </>
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
    <div className="space-y-1">
      <label className="text-[9px] font-bold uppercase text-[var(--brown-muted)] ml-1">
        {label} ({unit})
      </label>
      <input
        type="number"
        min="0"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="soft-input h-10 px-2 text-xs text-center"
        placeholder="0"
      />
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
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold pb-1">
        <span className="text-[var(--brown-muted)] uppercase tracking-tighter">
          {label}
        </span>
        <span className="text-[var(--peach-deep)]">{value}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[var(--peach-deep)] transition-all"
        style={{
          background: `linear-gradient(to right, var(--peach-deep) ${value * 10}%, var(--latte) ${value * 10}%)`,
        }}
      />
    </div>
  );
}
