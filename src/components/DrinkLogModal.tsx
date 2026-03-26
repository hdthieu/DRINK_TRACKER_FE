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
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import DrinkTypeModal from "./DrinkTypeModal";
import DrinkTypeDetailModal from "./DrinkTypeDetailModal";
import { Info } from "lucide-react";

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
            className="fixed inset-0 z-[60] backdrop-blur-md"
            style={{ background: "rgba(109,76,65,0.25)" }}
          />

          <div className="fixed inset-0 z-[70] pointer-events-none flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto clay-card flex flex-col"
              style={{
                background: "rgba(255,245,225,0.98)",
                border: "2px solid rgba(255,255,255,0.8)",
              }}
            >
              {/* Header */}
              <div className="p-6 pb-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                    style={{ background: "rgba(255,209,220,0.5)" }}
                  >
                    <Coffee size={24} className="text-[var(--brown)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--brown)]">
                      Thêm đồ uống mới
                    </h2>
                    <p className="text-xs text-[var(--brown-muted)]">
                      Ghi lại trải nghiệm ngọt ngào của bạn
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-rose-100/50 transition-colors"
                  style={{ color: "var(--brown-light)" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 custom-scrollbar text-left"
              >
                {/* Image & Basic Info */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Photo area */}
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className={labelClass}>📸 Ảnh chụp lấp lánh</label>
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
                        <>
                          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-2">
                            <Camera
                              size={20}
                              className="text-[var(--brown-light)]"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[var(--brown-muted)] text-center px-4 uppercase tracking-tighter">
                            Tải ảnh lên
                          </span>
                        </>
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

                  {/* Main Inputs */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        <Coffee size={10} /> Tên đồ uống
                      </label>
                      <input
                        value={form.drinkName}
                        onChange={(e) =>
                          updateField("drinkName", e.target.value)
                        }
                        className="soft-input h-14 font-bold text-[var(--brown)]"
                        placeholder="VD: Cà phê muối, Trà sữa Oolong..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Size */}
                      <div className="space-y-1.5">
                        <label className={labelClass}>
                          <Maximize size={10} /> Kích cỡ
                        </label>
                        <div className="flex gap-1 p-1 bg-[var(--latte)] rounded-xl h-12">
                          {["S", "M", "L"].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => updateField("size", sz)}
                              className={`flex-1 rounded-lg text-xs font-bold transition-all ${
                                form.size === sz
                                  ? "bg-white text-[var(--brown)] shadow-sm"
                                  : "text-[var(--brown-muted)] hover:bg-white/50"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Price */}
                      <div className="space-y-1.5">
                        <label className={labelClass}>
                          <DollarSign size={10} /> Giá (VNĐ)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={form.price || ""}
                          onChange={(e) =>
                            updateField("price", Number(e.target.value))
                          }
                          className="soft-input h-12 px-4 shadow-inner"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <label className={labelClass}>
                    <ArrowRight size={10} /> Loại đồ uống
                  </label>
                  <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setIsTypeModalOpen(true)}
                      className="flex-shrink-0 w-24 h-28 rounded-3xl border-2 border-dashed border-[var(--latte)] flex flex-col items-center justify-center gap-2 group hover:bg-rose-50 transition-all snap-start"
                    >
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--peach-deep)] group-hover:scale-110 transition-transform">
                        <Plus size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--brown-muted)] uppercase">
                        Thêm mới
                      </span>
                    </button>

                    {drinkTypes.map((t) => (
                      <div key={t.id} className="relative snap-start">
                        <button
                          type="button"
                          onClick={() => {
                            if (form.drinkTypeId === t.id) {
                              setSelectedTypeForDetail(t);
                            } else {
                              handleTypeSelect(t);
                            }
                          }}
                          className={`flex-shrink-0 w-24 h-28 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group ${
                            form.drinkTypeId === t.id
                              ? "clay-card-sm ring-2 ring-[var(--peach-deep)] bg-white shadow-lg"
                              : "bg-white/50 border border-white hover:bg-white hover:shadow-md"
                          }`}
                        >
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-rose-50/50 flex items-center justify-center transition-transform group-hover:scale-105">
                            {t.imageUrl ? (
                              <img
                                src={t.imageUrl}
                                alt={t.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error(
                                    "Image failed to load:",
                                    t.imageUrl,
                                  );
                                  // Fallback handled by check above, but this helps debugging
                                }}
                              />
                            ) : (
                              <Coffee
                                size={24}
                                className="text-[var(--brown-light)] opacity-50"
                              />
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 text-center line-clamp-2 uppercase transition-colors ${
                              form.drinkTypeId === t.id
                                ? "text-[var(--peach-deep)]"
                                : "text-[var(--brown)] group-hover:text-[var(--brown-light)]"
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
                          className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md border border-rose-100 flex items-center justify-center text-[var(--peach-deep)] z-10 hover:bg-rose-50 transition-all hover:scale-110"
                          title="Xem chi tiết"
                        >
                          <Info size={14} strokeWidth={3} />
                        </button>

                        {form.drinkTypeId === t.id && (
                          <motion.div
                            layoutId="selected-indicator"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-[var(--peach-deep)]"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Flavor & Extra */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className={labelClass}>
                        <Star size={10} /> Cảm nhận hương vị
                      </h3>
                      <CharacteristicSlider
                        label="Độ chua (Acidity)"
                        value={form.acidity}
                        onChange={(v) => updateField("acidity", v)}
                      />
                      <CharacteristicSlider
                        label="Độ đắng (Bitterness)"
                        value={form.bitterness}
                        onChange={(v) => updateField("bitterness", v)}
                      />
                      <CharacteristicSlider
                        label="Thể chất (Body)"
                        value={form.body}
                        onChange={(v) => updateField("body", v)}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Temperature Toggle */}
                      <div className="flex-1 space-y-2">
                        <label className={labelClass}>
                          <Thermometer size={10} /> Nhiệt độ
                        </label>
                        <div className="flex gap-1 p-1 bg-[var(--latte)] rounded-xl h-12">
                          {["Hot", "Cold"].map((tp) => (
                            <button
                              key={tp}
                              type="button"
                              onClick={() => updateField("temperature", tp)}
                              className={`flex-1 rounded-lg text-xs font-bold transition-all ${
                                form.temperature === tp
                                  ? tp === "Hot"
                                    ? "bg-orange-50 text-orange-600 shadow-sm"
                                    : "bg-blue-50 text-blue-600 shadow-sm"
                                  : "text-[var(--brown-muted)] hover:bg-white/50"
                              }`}
                            >
                              {tp === "Hot" ? "🔥 Nóng" : "❄️ Lạnh"}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* HomeMade */}
                      <div className="flex-1 space-y-2">
                        <label className={labelClass}>
                          <Home size={10} /> Địa điểm
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateField("isHomeMade", !form.isHomeMade)
                          }
                          className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 border-2 transition-all ${
                            form.isHomeMade
                              ? "bg-rose-50 border-[var(--peach-deep)] text-[var(--peach-deep)]"
                              : "bg-white border-[var(--latte)] text-[var(--brown-muted)]"
                          }`}
                        >
                          <Home size={16} />
                          <span className="text-xs font-bold">Tự pha chế</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Nutrients */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className={labelClass}>Bạn chấm mấy điểm?</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => updateField("rating", s)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              size={28}
                              fill={
                                s <= form.rating ? "var(--peach-deep)" : "none"
                              }
                              color={
                                s <= form.rating
                                  ? "var(--peach-deep)"
                                  : "var(--latte-deep)"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <NutrientInput
                        icon={<Zap size={10} />}
                        label="Caffeine"
                        unit="mg"
                        value={form.caffeineMg}
                        onChange={(v) => updateField("caffeineMg", v)}
                      />
                      <NutrientInput
                        icon={<Droplets size={10} />}
                        label="Đường"
                        unit="g"
                        value={form.sugarG}
                        onChange={(v) => updateField("sugarG", v)}
                      />
                      <NutrientInput
                        icon={<Flame size={10} />}
                        label="Calories"
                        unit="kcal"
                        value={form.calories}
                        onChange={(v) => updateField("calories", v)}
                      />
                      <NutrientInput
                        icon={<Maximize size={10} />}
                        label="Nước"
                        unit="ml"
                        value={form.volumeMl}
                        onChange={(v) => updateField("volumeMl", v)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>
                        <FileText size={10} /> Ghi chú thêm
                      </label>
                      <textarea
                        value={form.note}
                        onChange={(e) => updateField("note", e.target.value)}
                        className="soft-input h-20 pt-3 resize-none text-sm"
                        placeholder="Hương vị hôm nay thế nào?..."
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Submit */}
                <div className="sticky bottom-0 bg-[rgba(255,245,225,0.98)] pt-4 pb-2">
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="btn-primary"
                  >
                    {loading ? (
                      "Đang ghi lại... ✨"
                    ) : (
                      <>
                        <Plus size={18} /> Ghi lại uống thôi!
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}

      {/* Type Creation Modal */}
      <DrinkTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSuccess={(newType) => {
          setDrinkTypes((prev) => [...prev, newType]);
          handleTypeSelect(newType);
        }}
      />

      {/* Drink Type Detail Modal */}
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
    <div className="space-y-1 px-2">
      <div className="flex justify-between items-center text-[10px] font-bold">
        <span className="text-[var(--brown)] uppercase tracking-tight">
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
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase text-[var(--brown-muted)] flex items-center gap-1 leading-none ml-1">
        {icon} {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="soft-input h-10 px-2 text-xs font-bold"
          placeholder="0"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-[var(--brown-muted)] uppercase">
          {unit}
        </span>
      </div>
    </div>
  );
}
