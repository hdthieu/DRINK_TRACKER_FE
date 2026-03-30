"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Package,
  Search,
  AlertCircle,
  Edit2,
  Trash2,
  Filter,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { InventoryItem, InventoryUnit } from "@/lib/types";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { CustomSelect } from "@/components/CustomSelect";
import { Settings, Hash } from "lucide-react";
import { UnitManagementModal } from "@/components/UnitManagementModal";

// This will now be fetched from the backend

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<InventoryItem>>({
    itemName: "",
    quantityInBaseUnit: 0,
    baseUnitSymbol: "g",
    lowStockThreshold: 50,
  });

  useEffect(() => {
    fetchItems();
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const { data } = await api.get("/inventory-unit");
      setUnits(data.data || data || []);
    } catch {
      toast.error("Không thể tải đơn vị");
    }
  };

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/food-inventory");
      setItems(data.data || []);
    } catch (err) {
      toast.error("Không thể tải dữ liệu kho");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      itemName: "",
      quantityInBaseUnit: 0,
      baseUnitSymbol: "g",
      lowStockThreshold: 50,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      itemName: item.itemName,
      quantityInBaseUnit: item.quantityInBaseUnit,
      baseUnitSymbol: item.baseUnitSymbol,
      lowStockThreshold: item.lowStockThreshold || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = Number(form.quantityInBaseUnit);
    const threshold = Number(form.lowStockThreshold);

    if (isNaN(qty) || qty < 0) {
      return toast.error("Số lượng không được âm nhé Princess!");
    }
    if (isNaN(threshold) || threshold < 0) {
      return toast.error("Ngưỡng báo sắp hết không được âm nhé!");
    }

    try {
      const payload = {
        ...form,
        quantityInBaseUnit: qty,
        lowStockThreshold: threshold,
      };

      if (editingItem) {
        await api.patch(`/food-inventory/${editingItem.id}`, payload);
        toast.success("Đã cập nhật nguyên liệu! ✨");
      } else {
        await api.post("/food-inventory", payload);
        toast.success("Đã thêm nguyên liệu mới! 🥗");
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (typeof msg === "object") {
        Object.values(msg).forEach((m: any) => toast.error(m));
      } else {
        toast.error(msg || "Lỗi khi lưu dữ liệu");
      }
    }
  };

  const handleRemove = (id: string) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await api.delete(`/food-inventory/${idToDelete}`);
      toast.success("Đã xóa nguyên liệu!");
      fetchItems();
    } catch {
      toast.error("Không thể xóa nguyên liệu");
    } finally {
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const aOut = a.quantityInBaseUnit <= 0;
    const bOut = b.quantityInBaseUnit <= 0;
    if (aOut && !bOut) return -1;
    if (!aOut && bOut) return 1;

    const aLow =
      a.lowStockThreshold != null &&
      a.quantityInBaseUnit <= a.lowStockThreshold;
    const bLow =
      b.lowStockThreshold != null &&
      b.quantityInBaseUnit <= b.lowStockThreshold;
    if (aLow && !bLow) return -1;
    if (!aLow && bLow) return 1;

    return a.itemName.localeCompare(b.itemName);
  });

  const filteredItems = sortedItems.filter((i) =>
    i.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const lowStockCount = items.filter(
    (i) =>
      i.lowStockThreshold != null &&
      i.quantityInBaseUnit <= i.lowStockThreshold,
  ).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 sm:py-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[1.5rem] bg-rose-100 flex items-center justify-center shadow-lg shadow-rose-100 shrink-0">
            <Package className="text-rose-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--brown)] tracking-tight">
              Kho Lương Thực
            </h1>
            <p className="text-[var(--brown-muted)] text-sm font-medium">
              Quản lý thực phẩm của Princess ✨
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsUnitsModalOpen(true)}
            className="w-full sm:w-auto px-6 h-14 rounded-3xl bg-white border border-[var(--latte)] text-[var(--brown-muted)] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[var(--peach)]/10 transition-all shadow-sm"
          >
            <Hash size={16} /> Quản lý đơn vị
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd}
            className="btn-primary sm:w-auto px-8"
          >
            <Plus size={20} /> Thêm nguyên liệu
          </motion.button>
        </div>
      </header>

      {/* Stats & Search */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay-card p-5 flex flex-col gap-3 shadow-sm"
        >
          <div className="w-10 h-10 bg-rose-50 rounded-xl text-rose-500 flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--brown-muted)]">
              Tổng loại
            </p>
            <p className="text-xl font-black text-[var(--brown)]">
              {items.length}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="clay-card p-5 flex flex-col gap-3 shadow-sm"
        >
          <div
            className={`w-10 h-10 rounded-xl transition-all duration-500 flex items-center justify-center shrink-0 ${lowStockCount > 0 ? "bg-orange-100 text-orange-500" : "bg-green-50 text-green-500"}`}
          >
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--brown-muted)]">
              Sắp hết
            </p>
            <p
              className={`text-xl font-black ${lowStockCount > 0 ? "text-orange-500" : "text-[var(--brown)]"}`}
            >
              {lowStockCount}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="clay-card p-5 flex flex-col gap-3 shadow-sm border-rose-100"
        >
          <div
            className={`w-10 h-10 rounded-xl transition-all duration-500 flex items-center justify-center shrink-0 ${items.filter((i) => i.quantityInBaseUnit <= 0).length > 0 ? "bg-rose-100 text-rose-500" : "bg-green-50 text-green-500"}`}
          >
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--brown-muted)]">
              Đã hết
            </p>
            <p
              className={`text-xl font-black ${items.filter((i) => i.quantityInBaseUnit <= 0).length > 0 ? "text-rose-500" : "text-[var(--brown)]"}`}
            >
              {items.filter((i) => i.quantityInBaseUnit <= 0).length}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="clay-card p-5 flex flex-col gap-3 shadow-sm group focus-within:ring-2 focus-within:ring-[var(--peach)]/40 col-span-2 md:col-span-1"
        >
          <div className="w-10 h-10 bg-white shadow-inner rounded-xl flex items-center justify-center text-[var(--brown-muted)]">
            <Search size={18} />
          </div>
          <input
            placeholder="Tìm món..."
            className="bg-transparent border-none outline-none w-full text-xs font-bold text-[var(--brown)] placeholder:text-[var(--brown-muted)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[var(--peach)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-[var(--brown-muted)]">
            Đang kiểm kho... 🌸
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const isOut = item.quantityInBaseUnit <= 0;
              const isLow =
                !isOut &&
                item.lowStockThreshold != null &&
                item.quantityInBaseUnit <= item.lowStockThreshold;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className={`clay-card group relative p-6 space-y-4 overflow-hidden hover:scale-[1.03] transition-all ${isOut ? "grayscale-[0.5] opacity-80" : ""}`}
                >
                  {(isLow || isOut) && (
                    <div className="absolute top-0 right-0 p-0">
                      <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`text-white text-[9px] font-black px-3 py-1.5 rounded-bl-[1.2rem] uppercase tracking-widest shadow-lg flex items-center gap-1.5 ${isOut ? "bg-rose-500" : "bg-orange-500"}`}
                      >
                        <AlertCircle size={10} strokeWidth={3} />
                        {isOut ? "Đã hết!" : "Sắp hết!"}
                      </motion.span>
                    </div>
                  )}
                  <h3
                    className={`text-lg font-black tracking-tight truncate pr-10 ${isOut ? "text-rose-600" : "text-[var(--brown)]"}`}
                  >
                    {item.itemName}
                  </h3>

                  <div className="flex items-end justify-between border-b border-[var(--latte)]/20 pb-5">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-[var(--brown-muted)] uppercase tracking-[0.15em]">
                        Hiện có
                      </p>
                      <p
                        className={`text-2xl font-black ${isOut ? "text-rose-500 drop-shadow-sm" : "text-[var(--brown)]"}`}
                      >
                        {item.quantityInBaseUnit}{" "}
                        <span className="text-xs font-bold text-[var(--brown-light)] opacity-60">
                          {item.baseUnitSymbol}
                        </span>
                      </p>
                    </div>
                    <div className="text-right space-y-0.5 opacity-80">
                      <p className="text-[10px] font-bold text-[var(--brown-muted)] uppercase tracking-wider">
                        Mức thấp
                      </p>
                      <p className="font-bold text-sm text-[var(--brown-muted)]">
                        {item.lowStockThreshold} {item.baseUnitSymbol}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    {isOut ? (
                      <button
                        onClick={() =>
                          toast.success(
                            "Dạ Princess! Hieu đã ghi lại món này để nhắc chị mua thêm cho tươi mới rồi ạ! 🛒✨",
                          )
                        }
                        className="flex-1 h-12 !rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest shadow-[0_8px_25px_rgba(244,63,94,0.4)] hover:scale-[1.05] transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <ShoppingBag size={14} /> Cần mua gấp!
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="btn-secondary flex-1 h-12 !rounded-2xl shadow-sm border border-black/5 flex items-center justify-center gap-2 group-hover:bg-white transition-all hover:scale-[1.02] active:scale-95"
                      >
                        <Edit2 size={14} className="opacity-60" />
                        <span className="font-bold">Sửa</span>
                      </button>
                    )}
                    <div className="flex gap-2">
                      {isOut && (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-[var(--brown-muted)] hover:bg-white/80 transition-all shadow-sm border border-white"
                          title="Chỉnh sửa số lượng"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 group-hover:shadow-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {filteredItems.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="clay-card p-12 sm:p-20 text-center space-y-6 max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl">
            📦
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--brown)]">
              Kho đang trống không kìa Princess! 🌸
            </h3>
            <p className="text-sm text-[var(--brown-muted)] mt-1 font-medium">
              Nạp thêm nguyên liệu để bắt đầu lên thực đơn thôi nào~
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="btn-primary mx-auto w-auto px-8"
          >
            Thêm ngay!
          </button>
        </motion.div>
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
              className="relative w-full max-w-md bg-[var(--vanilla)] sm:clay-card p-6 sm:p-8 space-y-6 shadow-2xl rounded-t-[3rem] sm:rounded-[3rem] border-t-4 border-white sm:border-t-0 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="w-12 h-1.5 bg-[var(--latte)]/40 rounded-full mx-auto mb-6 sm:hidden" />
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-[var(--brown)] tracking-tight">
                  {editingItem ? "Sửa nguyên liệu" : "Thêm nguyên liệu"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 rounded-2xl bg-[var(--vanilla)] border-2 border-white text-[var(--brown-muted)] hover:text-rose-500 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                    Tên nguyên liệu 🥗
                  </label>
                  <input
                    required
                    value={form.itemName}
                    onChange={(e) =>
                      setForm({ ...form, itemName: e.target.value })
                    }
                    placeholder="Thịt bò, Trứng, Cải thìa..."
                    className="soft-input font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                      Số lượng ⚖️
                    </label>
                    <input
                      inputMode="decimal"
                      required
                      value={
                        form.quantityInBaseUnit === 0
                          ? ""
                          : form.quantityInBaseUnit
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        setForm({ ...form, quantityInBaseUnit: val as any });
                      }}
                      className="soft-input font-bold"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)] flex items-center gap-2">
                      <Filter size={12} /> Đơn vị 📏
                    </label>
                    <CustomSelect
                      options={units.map((u) => ({
                        val: u.symbol,
                        label: u.label,
                      }))}
                      value={form.baseUnitSymbol || "g"}
                      onChange={(val) =>
                        setForm({ ...form, baseUnitSymbol: val })
                      }
                      placeholder="Chọn đơn vị"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                    Ngưỡng báo sắp hết ⚠️
                  </label>
                  <input
                    inputMode="decimal"
                    value={
                      form.lowStockThreshold === 0 ? "" : form.lowStockThreshold
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setForm({ ...form, lowStockThreshold: val as any });
                    }}
                    className="soft-input font-bold text-orange-500 border-orange-100"
                    placeholder="50"
                  />
                  <p className="text-[10px] text-[var(--brown-muted)] italic ml-3 font-medium">
                    Hệ thống sẽ báo "Sắp hết" khi dưới mức này.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="btn-primary w-full h-16 shadow-xl"
                  >
                    {editingItem ? "Lưu thay đổi ✨" : "Thêm vào kho 🛍️"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full text-center py-2 text-sm font-bold text-[var(--brown-muted)] hover:text-[var(--brown)]"
                  >
                    Hủy bỏ
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
        title="Xóa nguyên liệu"
        message="Dữ liệu này sẽ biến mất vĩnh viễn khỏi pantry của Princess đó! Chị chắc chưa ạ?"
      />

      <UnitManagementModal
        isOpen={isUnitsModalOpen}
        onClose={() => setIsUnitsModalOpen(false)}
        onUpdate={fetchUnits}
      />
    </div>
  );
}
