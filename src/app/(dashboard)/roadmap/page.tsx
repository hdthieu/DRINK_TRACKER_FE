"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Map as LucideMap,
  X,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  ActivityType,
  UserRoadmap,
  CreateRoadmapDto,
  MealPlan,
} from "@/lib/types";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { CustomSelect } from "@/components/CustomSelect";
import { CustomTimePicker } from "@/components/CustomTimePicker";

/* ─── Components ─────────────────────────────────────────── */

function RoadmapItem({
  item,
  onToggle,
  onDelete,
  onEdit,
}: {
  item: UserRoadmap;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (item: UserRoadmap) => void;
}) {
  const typeIcons = {
    [ActivityType.GENERAL]: Sparkles,
    [ActivityType.MEAL]: BookOpen,
    [ActivityType.EXERCISE]: Sparkles,
    [ActivityType.WATER]: BookOpen,
  };

  const Icon = typeIcons[item.activityType] || Sparkles;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative pl-10 pb-8 last:pb-0"
    >
      {/* Timeline Line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-[var(--latte)] opacity-50" />

      {/* Timeline Dot */}
      <button
        onClick={() => onToggle(item.id, !item.isCompleted)}
        className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
          item.isCompleted
            ? "bg-[var(--peach-deep)] shadow-[0_0_12px_rgba(245,167,186,0.6)]"
            : "bg-white border-2 border-[var(--latte)] hover:border-[var(--peach)] hover:scale-110 shadow-sm"
        }`}
      >
        {item.isCompleted ? (
          <CheckCircle2 size={16} className="text-white" />
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--latte)]" />
        )}
      </button>

      <div
        className={`clay-card-sm p-5 transition-all duration-300 ${item.isCompleted ? "opacity-60 grayscale-[0.3]" : "hover:shadow-lg translate-x-2"}`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/60 text-[var(--brown-light)] border border-white shadow-sm flex items-center gap-1">
                <Clock size={12} /> {item.time}
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider border ${
                  item.activityType === ActivityType.MEAL
                    ? "bg-orange-50 text-orange-600 border-orange-100"
                    : item.activityType === ActivityType.EXERCISE
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : item.activityType === ActivityType.WATER
                        ? "bg-cyan-50 text-cyan-600 border-cyan-100"
                        : "bg-purple-50 text-purple-600 border-purple-100"
                }`}
              >
                {item.activityType}
              </span>
            </div>
            <h4
              className={`font-black text-lg leading-tight ${item.isCompleted ? "line-through text-[var(--brown-muted)]" : "text-[var(--brown)]"}`}
            >
              {item.activityName}
            </h4>
            {item.mealPlan && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-50/50 w-fit px-2 py-1 rounded-lg border border-orange-100">
                <BookOpen size={12} />
                Thực đơn: {item.mealPlan.mealName}
              </div>
            )}
            {item.description && (
              <p className="text-xs mt-1.5 text-[var(--brown-muted)] leading-relaxed font-bold italic">
                {item.description}
              </p>
            )}

            {!item.isCompleted && (
              <div className="mt-4 pt-4 border-t border-[var(--latte)]/10">
                <button
                  onClick={() => onToggle(item.id, true)}
                  className="w-full btn-primary !h-12 !text-[11px] !rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <CheckCircle2
                    size={16}
                    className="group-hover/btn:rotate-12 transition-transform"
                  />
                  Hoàn thành ngay 🌸
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(item)}
              className="p-2.5 rounded-xl hover:bg-white text-[var(--brown-muted)] hover:text-[var(--peach-deep)] transition-all shadow-none hover:shadow-sm"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2.5 rounded-xl hover:bg-rose-50 text-[var(--brown-muted)] hover:text-rose-500 transition-all shadow-none hover:shadow-sm"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
function RoadmapModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  selectedDate,
  mealPlans,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CreateRoadmapDto>) => void;
  initialData?: UserRoadmap | null;
  selectedDate: string;
  mealPlans: MealPlan[];
}) {
  const [form, setForm] = useState({
    time: initialData?.time || "08:00",
    activityName: initialData?.activityName || "",
    description: initialData?.description || "",
    activityType: initialData?.activityType || ActivityType.GENERAL,
    mealPlanId: (initialData?.mealPlan as any)?.id || "",
  });

  const activityOptions = [
    { val: ActivityType.MEAL, label: "Ăn uống 🍽️" },
    { val: ActivityType.EXERCISE, label: "Tập luyện ⚡" },
    { val: ActivityType.WATER, label: "Uống nước 💧" },
    { val: ActivityType.GENERAL, label: "Chung ✨" },
  ];

  useEffect(() => {
    if (initialData) {
      setForm({
        time: initialData.time,
        activityName: initialData.activityName,
        description: initialData.description || "",
        activityType: initialData.activityType,
        mealPlanId: (initialData.mealPlan as any)?.id || "",
      });
    } else {
      setForm({
        time: "08:00",
        activityName: "",
        description: "",
        activityType: ActivityType.GENERAL,
        mealPlanId: "",
      });
    }
  }, [initialData, isOpen]);

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
            className="relative w-full max-w-md bg-[var(--vanilla)] sm:clay-card p-6 sm:p-8 space-y-6 shadow-2xl rounded-t-[3rem] sm:rounded-[3rem] border-t-4 border-white sm:border-t-0"
          >
            <div className="w-12 h-1.5 bg-[var(--latte)]/40 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xl font-black text-[var(--brown)] flex items-center gap-2">
                <Sparkles className="text-[var(--peach-deep)]" />
                {initialData ? "Sửa hoạt động" : "Hoạt động mới"}
              </h3>
              <button
                onClick={onClose}
                className="p-3 rounded-2xl bg-[var(--vanilla)] border-2 border-white text-[var(--brown-muted)] hover:text-rose-500 transition-colors shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)] flex items-center gap-1.5">
                    <Clock size={12} /> Giờ 🕐
                  </label>
                  <CustomTimePicker
                    value={form.time}
                    onChange={(val) => setForm({ ...form, time: val })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)] flex items-center gap-1.5">
                    <Type size={12} /> Loại 🏷️
                  </label>
                  <CustomSelect
                    options={activityOptions}
                    value={form.activityType}
                    onChange={(val) => setForm({ ...form, activityType: val })}
                    placeholder="Chọn loại"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                  Tên hoạt động ✨
                </label>
                <input
                  value={form.activityName}
                  onChange={(e) =>
                    setForm({ ...form, activityName: e.target.value })
                  }
                  className="soft-input font-bold"
                  placeholder="VD: Uống nước, Ăn sáng..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                  Ghi chú 📝
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="soft-input h-24 py-4 resize-none !rounded-[2rem] font-medium"
                  placeholder="Thêm chi tiết cho Princess nè..."
                />
              </div>

              {form.activityType === ActivityType.MEAL && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 border-t border-[var(--latte)]/20 pt-4"
                >
                  <label className="text-[11px] font-bold uppercase tracking-widest ml-3 text-orange-500 flex items-center gap-1.5">
                    <BookOpen size={12} /> Liên kết thực đơn 🥘
                  </label>
                  <CustomSelect
                    options={[
                      { val: "", label: "Chọn thực đơn (không bắt buộc)" },
                      ...mealPlans.map((m) => ({
                        val: m.id,
                        label: `[${m.mealType}] ${m.mealName}`,
                      })),
                    ]}
                    value={form.mealPlanId}
                    onChange={(val) => setForm({ ...form, mealPlanId: val })}
                    placeholder="Chọn thực đơn..."
                  />
                  <p className="text-[10px] text-[var(--brown-muted)] italic px-3 font-medium">
                    Khi hoàn thành hoạt động này, Híu sẽ tự động trừ nguyên liệu
                    trong kho cho chị ạ! ✨
                  </p>
                </motion.div>
              )}

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={() => onSave({ ...form, date: selectedDate })}
                  disabled={!form.activityName}
                  className="btn-primary w-full h-16 shadow-xl"
                >
                  <Plus size={18} />
                  {initialData ? "Lưu thay đổi ✨" : "Thêm hành trình 🌸"}
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-center py-2 text-sm font-bold text-[var(--brown-muted)]"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<UserRoadmap[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserRoadmap | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  const fetchRoadmaps = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/roadmap/my-roadmap?date=${date}`);
      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setRoadmaps(
          data.sort((a: UserRoadmap, b: UserRoadmap) =>
            a.time.localeCompare(b.time),
          ),
        );
      } else {
        setRoadmaps([]);
      }
    } catch (error) {
      toast.error("Không thể tải lộ trình");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoadmaps(selectedDate);
    // Fetch meal plans for the modal
    api.get("/meal-plan").then((res) => {
      setMealPlans(res.data.data || res.data || []);
    });
  }, [selectedDate, fetchRoadmaps]);

  const handleToggleCompletion = async (id: string, completed: boolean) => {
    try {
      await api.patch(`/roadmap/${id}`, { isCompleted: completed });
      setRoadmaps((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isCompleted: completed } : item,
        ),
      );
      toast.success(completed ? "Đã hoàn thành! 🌟" : "Đã cập nhật");
    } catch (error) {
      toast.error("Lỗi cập nhật");
    }
  };

  const handleDelete = (id: string) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await api.delete(`/roadmap/${idToDelete}`);
      setRoadmaps((prev) => prev.filter((item) => item.id !== idToDelete));
      toast.success("Đã xóa hoạt động! ✨");
    } catch (error) {
      toast.error("Lỗi khi xóa");
    } finally {
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
    }
  };

  const handleSave = async (data: Partial<CreateRoadmapDto>) => {
    try {
      if (editingItem) {
        await api.patch(`/roadmap/${editingItem.id}`, data);
        toast.success("Đã cập nhật hoạt động");
      } else {
        await api.post("/roadmap", data);
        toast.success("Đã thêm hoạt động");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchRoadmaps(selectedDate);
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleSeedTemplate = async () => {
    try {
      await api.post("/roadmap/seed-template");
      toast.success("Đã tạo lộ trình mẫu cho hôm nay! 🌸");
      fetchRoadmaps(selectedDate);
    } catch (error) {
      toast.error("Không thể tạo mẫu");
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 sm:py-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[1.5rem] bg-[var(--peach)] flex items-center justify-center shadow-lg shadow-pink-100 shrink-0">
            <LucideMap className="text-[var(--brown)]" size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--brown)] tracking-tight">
              Lộ trình của tôi
            </h1>
            <p className="text-[var(--brown-muted)] text-sm font-medium">
              Lên kế hoạch và theo dõi ngày của bạn ✨
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/60 p-1.5 rounded-3xl border border-white backdrop-blur-sm self-start shadow-sm focus-within:ring-2 focus-within:ring-[var(--peach)]/30">
          <button
            onClick={() => changeDate(-1)}
            className="p-2.5 rounded-2xl hover:bg-[var(--peach)]/20 text-[var(--brown)] transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-3 font-bold text-sm min-w-[140px] justify-center">
            <Calendar size={16} className="text-[var(--peach-deep)]" />
            <span className="truncate">
              {new Date(selectedDate).toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2.5 rounded-2xl hover:bg-[var(--peach)]/20 text-[var(--brown)] transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[var(--peach)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-[var(--brown-muted)]">
            Đang tìm hành trình... 🌸
          </p>
        </div>
      ) : roadmaps.length > 0 ? (
        <div className="space-y-2">
          {roadmaps.map((item) => (
            <RoadmapItem
              key={item.id}
              item={item}
              onToggle={handleToggleCompletion}
              onDelete={handleDelete}
              onEdit={(it) => {
                setEditingItem(it);
                setIsModalOpen(true);
              }}
            />
          ))}
          <div className="pt-10 flex flex-col gap-4">
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="btn-primary w-full shadow-lg"
            >
              <Plus size={20} /> Thêm hoạt động mới
            </button>
            <button
              onClick={handleSeedTemplate}
              className="w-full py-4 rounded-3xl bg-white/60 border border-white text-sm font-bold text-[var(--brown-muted)] flex items-center justify-center gap-2 hover:bg-[var(--peach)]/10 transition-all"
            >
              <Sparkles size={16} className="text-[var(--peach-deep)]" /> Tạo kế
              hoạch mẫu từ Híu
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 sm:py-20 px-6 clay-card space-y-6 max-w-lg mx-auto shadow-sm"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-4xl shadow-inner border border-white">
            🗺️
          </div>
          <div className="space-y-2 px-4">
            <h3 className="text-xl font-bold text-[var(--brown)]">
              Chưa có kế hoạch nào kìa Princess!
            </h3>
            <p className="text-sm text-[var(--brown-muted)] leading-relaxed font-medium">
              Hãy lên kế hoạch cho ngày hôm nay để Híu giúp chị theo dõi sức
              khỏe tốt nhất nhé! ✨
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 px-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary sm:w-auto px-8"
            >
              <Plus size={18} /> Thêm hoạt động
            </button>
            <button
              onClick={handleSeedTemplate}
              className="btn-secondary sm:w-auto px-8 !rounded-3xl"
            >
              <Sparkles size={18} /> Dùng mẫu gợi ý
            </button>
          </div>
        </motion.div>
      )}

      <RoadmapModal
        isOpen={isModalOpen}
        selectedDate={selectedDate}
        initialData={editingItem}
        mealPlans={mealPlans}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIdToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message="Hoạt động này biến mất xong là chị sẽ lỡ một phần hành trình đấy ạ, Princess chắc chắn muốn xóa không? 🌸"
      />
    </div>
  );
}
