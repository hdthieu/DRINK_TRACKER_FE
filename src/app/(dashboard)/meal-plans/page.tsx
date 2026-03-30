"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Utensils,
  Trash2,
  Calendar,
  Coffee,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { MealPlan, InventoryItem } from "@/lib/types";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { CustomSelect } from "@/components/CustomSelect";

const MEAL_TYPES = [
  {
    val: "BREAKFAST",
    label: "Bữa sáng 🌅",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    val: "LUNCH",
    label: "Bữa trưa ☀️",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    val: "DINNER",
    label: "Bữa tối 🌙",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  {
    val: "SNACK",
    label: "Bữa phụ 🍎",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
];

const DAYS = [
  { val: 1, label: "Thứ Hai" },
  { val: 2, label: "Thứ Ba" },
  { val: 3, label: "Thứ Tư" },
  { val: 4, label: "Thứ Năm" },
  { val: 5, label: "Thứ Sáu" },
  { val: 6, label: "Thứ Bảy" },
  { val: 7, label: "Chủ Nhật" },
];

export default function MealPlansPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [form, setForm] = useState({
    dayOfWeek: 1,
    mealType: "BREAKFAST",
    mealName: "",
    description: "",
    ingredients: [] as {
      inventoryItemId: string;
      amountInBaseUnit: number;
      unitSymbol: string;
    }[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, iRes] = await Promise.all([
        api.get("/meal-plan"),
        api.get("/food-inventory"),
      ]);
      setPlans(pRes.data.data || []);
      setInventory(iRes.data.data || []);
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    setForm({
      ...form,
      ingredients: [
        ...form.ingredients,
        { inventoryItemId: "", amountInBaseUnit: 0, unitSymbol: "" },
      ],
    });
  };

  const removeIngredient = (idx: number) => {
    setForm({
      ...form,
      ingredients: form.ingredients.filter((_, i) => i !== idx),
    });
  };

  const updateIngredient = (idx: number, field: string, val: any) => {
    const newIngs = [...form.ingredients];
    newIngs[idx] = { ...newIngs[idx], [field]: val };
    if (field === "inventoryItemId") {
      const item = inventory.find((i) => i.id === val);
      if (item) newIngs[idx].unitSymbol = item.baseUnitSymbol;
    }
    setForm({ ...form, ingredients: newIngs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.ingredients.length === 0)
      return toast.warning("Phải có nguyên liệu chứ Princess! 🌸");
    if (!form.mealName)
      return toast.warning("Princess đặt tên món ăn đi ạ! 🥘");

    try {
      const payload = {
        ...form,
        ingredients: form.ingredients.map((ing) => ({
          ...ing,
          amountInBaseUnit: Number(ing.amountInBaseUnit),
        })),
      };
      await api.post("/meal-plan", payload);
      toast.success("Đã lưu thực đơn mới! 🥘");
      setIsModalOpen(false);
      fetchData();
      setForm({
        dayOfWeek: 1,
        mealType: "BREAKFAST",
        mealName: "",
        description: "",
        ingredients: [],
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message;
      if (Array.isArray(errorMsg)) {
        errorMsg.forEach((m: string) => toast.error(m));
      } else {
        toast.error(errorMsg || "Lỗi khi lưu thực đơn");
      }
    }
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await api.delete(`/meal-plan/${idToDelete}`);
      toast.success("Đã xóa thực đơn! 🗑️");
      fetchData();
    } catch {
      toast.error("Không thể xóa thực đơn");
    } finally {
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 sm:py-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[1.5rem] bg-orange-100 flex items-center justify-center shadow-lg shadow-orange-100 shrink-0">
            <Utensils className="text-orange-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--brown)] tracking-tight">
              Kế Hoạch Ăn Uống
            </h1>
            <p className="text-[var(--brown-muted)] text-sm font-medium">
              Bữa ăn ngon lành cho Princess ✨
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="btn-primary sm:w-auto px-8"
        >
          <Plus size={20} /> Lên thực đơn mới
        </motion.button>
      </header>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[var(--peach)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-[var(--brown-muted)]">
            Đang soạn thực đơn... 🌸
          </p>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:gap-12">
          {DAYS.map((day) => {
            const dayPlans = plans.filter((p) => p.dayOfWeek === day.val);
            if (dayPlans.length === 0) return null;
            return (
              <div key={day.val} className="space-y-6">
                <h2 className="text-lg font-black uppercase tracking-[0.2em] text-[var(--brown-muted)] flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-xs">
                    📅
                  </span>
                  {day.label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dayPlans.map((plan) => (
                    <motion.div
                      layout
                      key={plan.id}
                      className="clay-card p-6 space-y-4 relative group hover:scale-[1.02] transition-transform"
                    >
                      <button
                        onClick={() => {
                          setIdToDelete(plan.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="absolute top-4 right-4 p-2 rounded-xl text-rose-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="space-y-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${MEAL_TYPES.find((t) => t.val === plan.mealType)?.color}`}
                        >
                          {
                            MEAL_TYPES.find((t) => t.val === plan.mealType)
                              ?.label
                          }
                        </span>
                        <h3 className="text-xl font-bold text-[var(--brown)]">
                          {plan.mealName}
                        </h3>
                        {plan.description && (
                          <p className="text-xs text-[var(--brown-muted)] italic leading-relaxed">
                            {plan.description}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 bg-[rgba(255,255,255,0.4)] p-4 rounded-3xl border border-white/50 shadow-inner">
                        <p className="text-[10px] font-black text-[var(--brown-muted)] uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Coffee size={10} /> Thành phần 🥗
                        </p>
                        {plan.ingredients.map((ing) => (
                          <div
                            key={ing.id}
                            className="flex items-center justify-between text-xs font-bold text-[var(--brown)] py-1.5 last:border-none border-b border-[var(--latte)]/10"
                          >
                            <span>• {ing.inventoryItem.itemName}</span>
                            <span className="text-[var(--peach-deep)] bg-white/50 px-2 py-0.5 rounded-lg shadow-sm">
                              {ing.amountInBaseUnit} {ing.unitSymbol}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="clay-card p-12 sm:p-20 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl">
            🥘
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--brown)]">
              Bếp đang trống Princess ơi! 🌸
            </h3>
            <p className="text-sm text-[var(--brown-muted)]">
              Lên kế hoạch ăn uống để Híu chăm sóc chị tốt hơn nhé~
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary mx-auto w-auto px-8"
          >
            Lên thực đơn ngay!
          </button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[rgba(109,76,65,0.5)] backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%", scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: "100%", scale: 1 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-[var(--vanilla)] sm:clay-card p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[95vh] rounded-t-[3rem] sm:rounded-[3rem] custom-scrollbar border-t-4 border-white sm:border-t-0"
            >
              <div className="w-12 h-1.5 bg-[var(--latte)]/40 rounded-full mx-auto mb-6 sm:hidden" />
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl font-black text-[var(--brown)] tracking-tight">
                  Lên Thực Đơn Mới 🥘
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 rounded-2xl bg-[var(--vanilla)] border-2 border-white text-[var(--brown-muted)] hover:text-rose-500 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)] flex items-center gap-1.5">
                      <Calendar size={12} /> Thứ trong tuần
                    </label>
                    <CustomSelect
                      options={DAYS}
                      value={form.dayOfWeek}
                      onChange={(val) => setForm({ ...form, dayOfWeek: val })}
                      placeholder="Chọn ngày"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)] flex items-center gap-1.5">
                      <Utensils size={12} /> Bữa ăn
                    </label>
                    <CustomSelect
                      options={MEAL_TYPES}
                      value={form.mealType}
                      onChange={(val) => setForm({ ...form, mealType: val })}
                      placeholder="Chọn bữa ăn"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                    Tên món ăn 🥘
                  </label>
                  <input
                    required
                    className="soft-input font-bold"
                    value={form.mealName}
                    onChange={(e) =>
                      setForm({ ...form, mealName: e.target.value })
                    }
                    placeholder="VD: Salad ức gà & Ngô ngọt..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-3">
                    <p className="text-[11px] font-black uppercase text-[var(--brown-muted)] tracking-widest">
                      Thành phần nguyên liệu
                    </p>
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="text-[11px] font-black text-rose-500 hover:scale-110 transition-transform flex items-center gap-1 py-1 px-3 bg-rose-50 rounded-full border border-rose-100"
                    >
                      <Plus size={14} /> Thêm
                    </button>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {form.ingredients.map((ing, idx) => {
                        const selectedItem = inventory.find(
                          (it) => it.id === ing.inventoryItemId,
                        );
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className="flex flex-col sm:flex-row gap-3 p-4 bg-white/40 rounded-[2rem] border border-white relative shadow-sm"
                          >
                            <CustomSelect
                              className="flex-[2]"
                              options={inventory.map((it) => ({
                                val: it.id,
                                label: `${it.itemName} (Kho: ${it.quantityInBaseUnit} ${it.baseUnitSymbol})`,
                              }))}
                              value={ing.inventoryItemId}
                              onChange={(val) =>
                                updateIngredient(idx, "inventoryItemId", val)
                              }
                              placeholder="Chọn nguyên liệu..."
                            />
                            {selectedItem && (
                              <p className="absolute -top-3 left-4 px-2 bg-white rounded-full text-[9px] font-black text-rose-400 border border-rose-100 shadow-sm z-10">
                                Hiện có: {selectedItem.quantityInBaseUnit}{" "}
                                {selectedItem.baseUnitSymbol} 📦
                              </p>
                            )}
                            <div className="flex gap-2 h-14 w-full sm:w-auto">
                              <div className="flex-1 relative">
                                <input
                                  inputMode="decimal"
                                  required
                                  className="w-full soft-input !h-full text-center font-bold text-xs pr-10"
                                  value={ing.amountInBaseUnit || ""}
                                  onChange={(e) =>
                                    updateIngredient(
                                      idx,
                                      "amountInBaseUnit",
                                      e.target.value.replace(/[^0-9.]/g, ""),
                                    )
                                  }
                                  placeholder="Lượng"
                                />
                                {selectedItem && (
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--peach-deep)] bg-white/90 px-1.5 py-0.5 rounded-md shadow-sm border border-[var(--peach)]/20">
                                    {selectedItem.baseUnitSymbol}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeIngredient(idx)}
                                className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {form.ingredients.length === 0 && (
                      <div className="py-4 text-center border-2 border-dashed border-[var(--latte)]/40 rounded-[2rem] text-[var(--brown-muted)] text-sm flex flex-col items-center gap-2">
                        <AlertCircle size={24} />
                        Chị chưa thêm nguyên liệu nào ạ~
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="btn-primary w-full h-16 text-lg shadow-xl"
                  >
                    Lưu thực đơn Princess ơi! ✨🥘
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-4 text-sm font-bold text-[var(--brown-muted)] hover:text-[var(--brown)] transition-colors"
                  >
                    Dạ để sau ạ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIdToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa món"
        message="Món này bếp soạn kĩ lắm rồi, Princess chắc chắn muốn xóa không ạ? 🌸"
      />
    </div>
  );
}
