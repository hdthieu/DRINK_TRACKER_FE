"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Coffee,
  Zap,
  Droplets,
  Flame,
  DollarSign,
  Star,
  Home,
  FileText,
  Camera,
  Thermometer,
  Maximize,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import DrinkTypeModal from "./DrinkTypeModal";
import DrinkTypeDetailModal from "./DrinkTypeDetailModal";

interface DrinkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DrinkLogModal({
  isOpen,
  onClose,
  onSuccess,
}: DrinkLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [drinkTypes, setDrinkTypes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedTypeForDetail, setSelectedTypeForDetail] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    drinkName: "",
    caffeineMg: 0,
    sugarG: 0,
    calories: 0,
    volumeMl: 250,
    price: 0,
    rating: 5,
    acidity: 0,
    bitterness: 0,
    body: 0,
    note: "",
    isHomeMade: false,
    size: "M",
    temperature: "Hot",
    drinkTypeId: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchDrinkTypes();
    } else {
      // Reset preview if closed
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const fetchDrinkTypes = async () => {
    try {
      const res = await api.get("/drink-type");
      if (res.data) {
        setDrinkTypes(res.data.data || res.data);
      }
    } catch (err) {
      console.error("Failed to fetch drink types", err);
    }
  };

  const handleTypeSelect = (type: any) => {
    setForm((prev) => ({
      ...prev,
      drinkTypeId: type.id,
      drinkName: prev.drinkName || type.name,
      caffeineMg: type.caffeineMg || prev.caffeineMg,
      sugarG: type.sugarG || prev.sugarG,
      calories: type.calories || prev.calories,
      volumeMl: type.volumeMl || prev.volumeMl || 250,
      acidity: type.acidity ?? prev.acidity,
      bitterness: type.bitterness ?? prev.bitterness,
      body: type.body ?? prev.body,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await api.post("/drinklog/upload-image", fd, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.drinkName.trim())
      return toast.error("Tên đồ uống không được để trống");
    if (form.caffeineMg < 0) return toast.error("Caffeine không được âm");
    if (form.sugarG < 0) return toast.error("Lượng đường không được âm");
    if (form.calories < 0) return toast.error("Calories không được âm");
    if (form.price < 0) return toast.error("Giá tiền không được âm");

    setLoading(true);
    try {
      const res = await api.post("/drinklog", form);
      if (res.status === 201 || res.status === 200) {
        toast.success("Đã thêm đồ uống thành công!");
        onSuccess();
        onClose();
        setForm({
          drinkName: "",
          caffeineMg: 0,
          sugarG: 0,
          calories: 0,
          volumeMl: 250,
          price: 0,
          rating: 5,
          acidity: 0,
          bitterness: 0,
          body: 0,
          note: "",
          isHomeMade: false,
          size: "M",
          temperature: "Hot",
          drinkTypeId: "",
          imageUrl: "",
        });
        setPreviewUrl(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Rất tiếc, đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const labelClass =
    "text-[11px] font-bold uppercase tracking-widest ml-3 flex items-center gap-1.5 text-[var(--brown-muted)]";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
            className="relative w-full max-w-2xl bg-[var(--vanilla)] sm:clay-card shadow-2xl overflow-hidden rounded-t-[3rem] sm:rounded-[3rem] border-t-4 border-white sm:border-t-0 flex flex-col max-h-[95vh]"
          >
            <div className="w-12 h-1.5 bg-[var(--latte)]/40 rounded-full mx-auto my-4 sm:hidden" />

            {/* Header */}
            <div className="p-6 pb-4 flex items-center justify-between px-6 sm:px-8">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white"
                  style={{ background: "rgba(255,209,220,0.6)" }}
                >
                  <Coffee size={28} className="text-[var(--brown)]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--brown)] tracking-tight">
                    Thêm đồ uống mới
                  </h2>
                  <p className="text-xs font-bold text-[var(--brown-muted)]">
                    Ghi lại trải nghiệm ngọt ngào của bạn ✨
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/50 border border-white text-[var(--brown-muted)] hover:text-rose-500 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 pt-2 space-y-8 custom-scrollbar text-left px-6 sm:px-8"
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* Photo area */}
                <div className="w-full md:w-[220px] lg:w-[240px] space-y-3 shrink-0">
                  <label className={labelClass}>📸 Ảnh chụp lấp lánh</label>
                  <div
                    className="aspect-square rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:bg-rose-50/50"
                    style={{
                      borderColor: "var(--latte)",
                      background: previewUrl
                        ? "white"
                        : "rgba(255,255,255,0.4)",
                    }}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera className="text-white" size={32} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-[var(--peach-deep)] group-hover:scale-110 transition-transform">
                          <Camera size={24} />
                        </div>
                        <span className="text-[10px] font-black text-[var(--brown-muted)] uppercase tracking-widest text-center px-6">
                          Bấm để tải ảnh 📸
                        </span>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-3 border-[var(--peach-deep)] border-t-transparent animate-spin" />
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
                      <Coffee size={12} /> Tên đồ uống
                    </label>
                    <input
                      value={form.drinkName}
                      onChange={(e) => updateField("drinkName", e.target.value)}
                      className="soft-input h-14 font-black text-lg text-[var(--brown)]"
                      placeholder="VD: Cà phê muối, Trà sữa..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={labelClass}>
                        <Maximize size={12} /> Kích cỡ
                      </label>
                      <div className="flex gap-1 p-1 bg-white/50 border border-white rounded-2xl h-14 shadow-inner">
                        {["S", "M", "L"].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => updateField("size", sz)}
                            className={`flex-1 rounded-xl text-xs font-black transition-all ${
                              form.size === sz
                                ? "bg-[var(--peach)] text-[var(--brown)] shadow-md"
                                : "text-[var(--brown-muted)] hover:bg-white/50"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>
                        <DollarSign size={12} /> Giá tiền
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={form.price || ""}
                          onChange={(e) =>
                            updateField("price", Number(e.target.value))
                          }
                          className="soft-input h-14 font-bold"
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--brown-muted)]">
                          VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className={labelClass}>
                  <ArrowRight size={12} /> Chọn loại đồ uống có sẵn
                </label>
                <div className="flex gap-4 overflow-x-auto pb-6 snap-x no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setIsTypeModalOpen(true)}
                    className="flex-shrink-0 w-24 h-32 rounded-[2.5rem] border-2 border-dashed border-[var(--latte)] flex flex-col items-center justify-center gap-3 group hover:bg-rose-50 transition-all snap-start shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[var(--peach-deep)] group-hover:scale-110 transition-transform">
                      <Plus size={20} />
                    </div>
                    <span className="text-[10px] font-black text-[var(--brown-muted)] uppercase tracking-tighter">
                      Tạo mới
                    </span>
                  </button>

                  {drinkTypes.map((t) => (
                    <div
                      key={t.id}
                      className="relative snap-start h-32 w-24 flex-shrink-0"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (form.drinkTypeId === t.id) {
                            setSelectedTypeForDetail(t);
                          } else {
                            handleTypeSelect(t);
                          }
                        }}
                        className={`w-full h-full rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group border ${
                          form.drinkTypeId === t.id
                            ? "bg-white border-[var(--peach-deep)] shadow-lg ring-2 ring-[var(--peach)]/20"
                            : "bg-white/40 border-white hover:bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-rose-50/50 flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner">
                          {t.imageUrl ? (
                            <img
                              src={t.imageUrl}
                              alt={t.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Coffee
                              size={24}
                              className="text-[var(--brown-light)] opacity-30"
                            />
                          )}
                        </div>
                        <span
                          className={`text-[9px] font-black px-2 text-center line-clamp-2 uppercase leading-tight ${
                            form.drinkTypeId === t.id
                              ? "text-[var(--peach-deep)]"
                              : "text-[var(--brown)]"
                          }`}
                        >
                          {t.name}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTypeForDetail(t);
                        }}
                        className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md border border-rose-50 flex items-center justify-center text-[var(--peach-deep)] z-10 hover:bg-rose-50 transition-all hover:scale-110"
                      >
                        <Info size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className={labelClass}>📊 Phân tích hương vị</h3>
                  <div className="space-y-5 bg-white/40 p-6 rounded-[2.5rem] border border-white/60">
                    <CharacteristicSlider
                      label="🍭 Độ chua"
                      value={form.acidity}
                      onChange={(v) => updateField("acidity", v)}
                    />
                    <CharacteristicSlider
                      label="☕ Độ đắng"
                      value={form.bitterness}
                      onChange={(v) => updateField("bitterness", v)}
                    />
                    <CharacteristicSlider
                      label="🥛 Thể chất"
                      value={form.body}
                      onChange={(v) => updateField("body", v)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={labelClass}>
                        <Thermometer size={12} /> Nhiệt độ
                      </label>
                      <div className="flex gap-1 p-1 bg-white/50 border border-white rounded-2xl h-14 shadow-inner">
                        {["Hot", "Cold"].map((tp) => (
                          <button
                            key={tp}
                            type="button"
                            onClick={() => updateField("temperature", tp)}
                            className={`flex-1 rounded-xl text-[10px] font-black transition-all ${form.temperature === tp ? (tp === "Hot" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600") : "text-[var(--brown-muted)]"}`}
                          >
                            {tp === "Hot" ? "🔥 Nóng" : "❄️ Lạnh"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>
                        <Home size={12} /> Chế biến
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateField("isHomeMade", !form.isHomeMade)
                        }
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all font-black text-[10px] uppercase tracking-tighter ${form.isHomeMade ? "bg-rose-50 border-[var(--peach-deep)] text-[var(--peach-deep)]" : "bg-white/40 border-white text-[var(--brown-muted)]"}`}
                      >
                        <Home size={16} /> Tự pha chế
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className={labelClass}>
                      ✨ Chấm điểm Princess thích
                    </label>
                    <div className="flex gap-3 bg-white/40 p-5 rounded-[2.5rem] justify-center border border-white/60">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateField("rating", s)}
                          className="hover:scale-125 transition-transform duration-300"
                        >
                          <Star
                            size={32}
                            fill={
                              s <= form.rating ? "var(--peach-deep)" : "none"
                            }
                            color={
                              s <= form.rating
                                ? "var(--peach-deep)"
                                : "var(--latte-deep)"
                            }
                            strokeWidth={s <= form.rating ? 2 : 1}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <NutrientInput
                      icon={<Zap size={12} />}
                      label="Caffeine"
                      unit="mg"
                      value={form.caffeineMg}
                      onChange={(v) => updateField("caffeineMg", v)}
                    />
                    <NutrientInput
                      icon={<Droplets size={12} />}
                      label="Đường"
                      unit="g"
                      value={form.sugarG}
                      onChange={(v) => updateField("sugarG", v)}
                    />
                    <NutrientInput
                      icon={<Flame size={12} />}
                      label="Calories"
                      unit="kcal"
                      value={form.calories}
                      onChange={(v) => updateField("calories", v)}
                    />
                    <NutrientInput
                      icon={<Maximize size={12} />}
                      label="Nước"
                      unit="ml"
                      value={form.volumeMl}
                      onChange={(v) => updateField("volumeMl", v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>
                      <FileText size={12} /> Nhật ký hương vị
                    </label>
                    <textarea
                      value={form.note}
                      onChange={(e) => updateField("note", e.target.value)}
                      className="soft-input h-24 py-4 resize-none text-sm font-medium !rounded-[2rem]"
                      placeholder="Hương vị hôm nay có gì đặc biệt không Princess?..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="btn-primary w-full h-16 text-lg shadow-xl"
                >
                  {loading
                    ? "Đang ghi lại... ✨"
                    : "Lưu vào nhật ký Princess! ☕🌸"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-4 text-sm font-bold text-[var(--brown-muted)]"
                >
                  Để sau nhé Híu~
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <DrinkTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSuccess={(newType) => {
          setDrinkTypes((prev) => [...prev, newType]);
          handleTypeSelect(newType);
        }}
      />

      <DrinkTypeDetailModal
        isOpen={!!selectedTypeForDetail}
        onClose={() => setSelectedTypeForDetail(null)}
        drinkType={selectedTypeForDetail}
      />
    </AnimatePresence>
  );
}

function CharacteristicSlider({
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
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-1">
        <span className="text-[var(--brown)]">{label}</span>
        <span className="text-[var(--peach-deep)] bg-white px-2 rounded-full shadow-sm">
          {value}/10
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--peach-deep)] transition-all bg-[var(--latte)]/30"
        style={{
          background: `linear-gradient(to right, var(--peach-deep) ${value * 10}%, rgba(215,204,200,0.3) ${value * 10}%)`,
        }}
      />
    </div>
  );
}

function NutrientInput({
  icon,
  label,
  unit,
  value,
  onChange,
}: {
  icon: any;
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[9px] font-black uppercase text-[var(--brown-muted)] flex items-center gap-1 leading-none ml-2 tracking-widest">
        {icon} {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="soft-input h-11 px-3 text-sm font-black border-white bg-white/60"
          placeholder="0"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-[var(--brown-muted)] uppercase">
          {unit}
        </span>
      </div>
    </div>
  );
}
