"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Edit2, Check, Hash } from "lucide-react";
import api from "@/lib/api";
import { InventoryUnit } from "@/lib/types";
import { toast } from "sonner";

interface UnitManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function UnitManagementModal({
  isOpen,
  onClose,
  onUpdate,
}: UnitManagementModalProps) {
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newUnit, setNewUnit] = useState({ symbol: "", label: "" });

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/inventory-unit");
      setUnits(data.data || data || []);
    } catch {
      toast.error("Không thể tải danh sách đơn vị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchUnits();
  }, [isOpen]);

  const handleAdd = async () => {
    if (!newUnit.symbol || !newUnit.label) return;
    try {
      await api.post("/inventory-unit", newUnit);
      toast.success("Đã thêm đơn vị mới! ✨");
      setNewUnit({ symbol: "", label: "" });
      fetchUnits();
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm đơn vị");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/inventory-unit/${id}`);
      toast.success("Đã xóa đơn vị");
      fetchUnits();
      onUpdate();
    } catch {
      toast.error("Không thể xóa đơn vị này ạ!");
    }
  };

  const handleUpdate = async (unit: InventoryUnit) => {
    try {
      await api.patch(`/inventory-unit/${unit.id}`, unit);
      toast.success("Đã cập nhật đơn vị! ✨");
      setEditingId(null);
      fetchUnits();
      onUpdate();
    } catch {
      toast.error("Lỗi khi cập nhật");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(109,76,65,0.4)] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[var(--vanilla)] clay-card p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[var(--brown)] flex items-center gap-2">
                <Hash className="text-rose-400" size={20} />
                Quản lý đơn vị 📏
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-rose-50 text-[var(--brown-muted)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Add Section */}
            <div className="p-4 bg-white/40 rounded-3xl border border-white space-y-3 shadow-inner">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brown-muted)] ml-2">
                Thêm đơn vị mới ✨
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  placeholder="Ký hiệu (vd: g, ml)"
                  value={newUnit.symbol}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, symbol: e.target.value })
                  }
                  className="soft-input !h-11 text-xs font-bold"
                />
                <input
                  placeholder="Tên hiển thị (vd: Gam (g))"
                  value={newUnit.label}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, label: e.target.value })
                  }
                  className="soft-input !h-11 text-xs font-bold"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!newUnit.symbol || !newUnit.label}
                className="btn-primary !h-11 !text-xs !rounded-2xl w-full shadow-md"
              >
                <Plus size={14} /> Thêm vào danh sách
              </button>
            </div>

            {/* List Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {loading ? (
                <div className="py-10 text-center text-xs font-bold text-[var(--brown-muted)] animate-pulse">
                  Đang tải đơn vị... 🌸
                </div>
              ) : (
                units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center gap-3 p-3 bg-white/60 rounded-2xl border border-white hover:shadow-sm transition-shadow group"
                  >
                    {editingId === unit.id ? (
                      <>
                        <input
                          className="flex-1 soft-input !h-9 !text-[10px] !p-2 !rounded-xl font-bold"
                          value={unit.label}
                          onChange={(e) =>
                            setUnits(
                              units.map((u) =>
                                u.id === unit.id
                                  ? { ...u, label: e.target.value }
                                  : u,
                              ),
                            )
                          }
                        />
                        <button
                          onClick={() => handleUpdate(unit)}
                          className="p-2 rounded-xl bg-green-500 text-white shadow-sm"
                        >
                          <Check size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[var(--brown)]">
                            {unit.label}
                          </p>
                          <p className="text-[10px] text-[var(--brown-muted)]">
                            Code: {unit.symbol}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingId(unit.id)}
                            className="p-2 rounded-xl hover:bg-white text-[var(--brown-muted)] hover:text-blue-500"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(unit.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 text-[var(--brown-muted)] hover:text-rose-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <p className="text-[10px] text-center text-[var(--brown-muted)] italic">
              Các đơn vị này sẽ hiển thị ở trang Kho và Thực đơn của Princess ạ!
              🌸
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
