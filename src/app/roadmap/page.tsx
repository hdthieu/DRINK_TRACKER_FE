"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Map as LucideMap,
  X,
  User as UserIcon,
  LogOut,
  Settings,
  Camera,
  Mail,
  Save,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ActivityType, UserRoadmap, CreateRoadmapDto } from "@/lib/types";

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
            : "bg-white border-2 border-[var(--latte)] hover:border-[var(--peach)]"
        }`}
      >
        {item.isCompleted ? (
          <CheckCircle2 size={16} className="text-white" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-[var(--latte)]" />
        )}
      </button>

      <div
        className={`clay-card-sm p-4 transition-all duration-300 ${item.isCompleted ? "opacity-60 grayscale-[0.3]" : ""}`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--vanilla)] text-[var(--brown-light)] border border-[var(--latte)] flex items-center gap-1">
                <Clock size={10} /> {item.time}
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  item.activityType === ActivityType.MEAL
                    ? "bg-orange-100 text-orange-600"
                    : item.activityType === ActivityType.EXERCISE
                      ? "bg-blue-100 text-blue-600"
                      : item.activityType === ActivityType.WATER
                        ? "bg-cyan-100 text-cyan-600"
                        : "bg-purple-100 text-purple-600"
                }`}
              >
                {item.activityType}
              </span>
            </div>
            <h4
              className={`font-bold text-base leading-tight ${item.isCompleted ? "line-through text-[var(--brown-muted)]" : "text-[var(--brown)]"}`}
            >
              {item.activityName}
            </h4>
            {item.description && (
              <p className="text-xs mt-1 text-[var(--brown-muted)] leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-xl hover:bg-[var(--vanilla)] text-[var(--brown-muted)] hover:text-[var(--peach-deep)] transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-xl hover:bg-rose-50 text-[var(--brown-muted)] hover:text-rose-500 transition-colors"
            >
              <Trash2 size={14} />
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
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CreateRoadmapDto>) => void;
  initialData?: UserRoadmap | null;
  selectedDate: string;
}) {
  const [form, setForm] = useState({
    time: initialData?.time || "08:00",
    activityName: initialData?.activityName || "",
    description: initialData?.description || "",
    activityType: initialData?.activityType || ActivityType.GENERAL,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        time: initialData.time,
        activityName: initialData.activityName,
        description: initialData.description || "",
        activityType: initialData.activityType,
      });
    } else {
      setForm({
        time: "08:00",
        activityName: "",
        description: "",
        activityType: ActivityType.GENERAL,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative w-full max-w-md clay-card p-6 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[var(--brown)] flex items-center gap-2">
              <Sparkles className="text-[var(--peach-deep)]" />
              {initialData ? "Sửa hoạt động" : "Thêm hoạt động mới"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-[var(--vanilla)] text-[var(--brown-muted)]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                  Giờ 🕐
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="soft-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                  Loại 🏷️
                </label>
                <select
                  value={form.activityType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      activityType: e.target.value as ActivityType,
                    })
                  }
                  className="soft-input px-4 appearance-none"
                >
                  {Object.values(ActivityType).map((t) => (
                    <option key={t} value={t}>
                      {t === ActivityType.MEAL
                        ? "Ăn uống 🍽️"
                        : t === ActivityType.EXERCISE
                          ? "Tập luyện ⚡"
                          : t === ActivityType.WATER
                            ? "Uống nước 💧"
                            : "Chung ✨"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                Tên hoạt động ✨
              </label>
              <input
                value={form.activityName}
                onChange={(e) =>
                  setForm({ ...form, activityName: e.target.value })
                }
                className="soft-input"
                placeholder="VD: Uống nước, Ăn sáng..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                Ghi chú (tùy chọn) 📝
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="soft-input h-24 py-3 resize-none"
                placeholder="Thêm chi tiết..."
              />
            </div>

            <button
              onClick={() => onSave({ ...form, date: selectedDate })}
              disabled={!form.activityName}
              className="btn-primary"
            >
              <Plus size={18} />
              {initialData ? "Lưu thay đổi" : "Thêm vào lộ trình"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─── Profile Drawer ───────────────────────────────────*/
function ProfileDrawer({
  user,
  onClose,
  onSaved,
  fileInputRef,
  onFileChange,
  uploading,
}: {
  user: any;
  onClose: () => void;
  onSaved: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}) {
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    weight: user.weight,
    age: user.age || 20,
    exerciseTimeMinutes: user.exerciseTimeMinutes || 0,
    isHighTemperature: user.isHighTemperature || false,
    dailyCaffeineLimit: user.dailyCaffeineLimit,
    dailySugarLimit: user.dailySugarLimit,
  });
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      await api.patch("/user/update", form);
      toast.success("✨ Hồ sơ đã được lưu!");
      setIsEdit(false);
      onSaved();
    } catch (e: any) {
      if (e.response?.status === 400) {
        setFieldErrors(e.response.data.message || {});
        toast.error("Kiểm tra lại thông tin nhé!");
      } else {
        toast.error("Không thể lưu thay đổi");
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field: string) =>
    `soft-input ${fieldErrors[field] ? "error" : ""}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[110] bg-[rgba(109,76,65,0.25)] backdrop-blur-[6px]"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[22rem] z-[120] overflow-y-auto bg-[rgba(255,245,225,0.96)] backdrop-blur-[24px] border-l-[1.5px] border-[rgba(215,204,200,0.6)] shadow-[-8px_0_40px_rgba(109,76,65,0.12)]"
      >
        <div className="p-7 pt-16 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-2xl flex items-center justify-center bg-[rgba(255,209,220,0.35)] text-[var(--brown-light)] hover:opacity-80"
          >
            <X size={18} />
          </button>

          <div
            className="relative w-28 h-28 mx-auto mb-6 group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-full h-full rounded-[2.2rem] overflow-hidden flex items-center justify-center bg-[rgba(255,209,220,0.35)] border-[4px] border-white shadow-[0_6px_20px_rgba(109,76,65,0.12)] transition-transform hover:scale-105">
              {uploading ? (
                <Settings
                  size={32}
                  className="animate-spin text-[var(--peach-deep)]"
                />
              ) : user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <UserIcon size={40} className="text-[var(--peach-deep)]" />
              )}
            </div>
            <div className="absolute inset-0 rounded-[2.2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center bg-[rgba(255,209,220,0.55)] transition-opacity">
              <Camera size={22} className="text-[var(--brown)]" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {!isEdit && (
            <div className="text-center mb-6 space-y-1">
              <h2 className="text-xl font-bold text-[var(--brown)]">
                {user.name}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--brown-muted)]">
                <Mail size={11} /> {user.email}
              </div>
            </div>
          )}

          {isEdit ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                  Tên của bạn 🌸
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass("name")}
                  placeholder="Princess..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                  Cân nặng (kg) ⚖️
                </label>
                <input
                  inputMode="decimal"
                  value={form.weight}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, "");
                    setForm({ ...form, weight: v === "" ? 0 : Number(v) });
                  }}
                  className={inputClass("weight")}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                    Tuổi 🎂
                  </label>
                  <input
                    inputMode="numeric"
                    value={form.age}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setForm({ ...form, age: v === "" ? 0 : Number(v) });
                    }}
                    className={inputClass("age")}
                    style={{ borderRadius: "1.2rem" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest ml-3 text-[var(--brown-muted)]">
                    Tập luyện (phút) ⚡
                  </label>
                  <input
                    inputMode="numeric"
                    value={form.exerciseTimeMinutes}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setForm({
                        ...form,
                        exerciseTimeMinutes: v === "" ? 0 : Number(v),
                      });
                    }}
                    className={inputClass("exerciseTimeMinutes")}
                    style={{ borderRadius: "1.2rem" }}
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary mt-2"
              >
                <Save size={16} /> {saving ? "Đang lưu..." : "Lưu thay đổi ✨"}
              </button>
              <button onClick={() => setIsEdit(false)} className="btn-ghost">
                Hủy bỏ
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Cân nặng", val: `${user.weight} kg`, emoji: "⚖️" },
                { label: "Tuổi", val: `${user.age || "—"} tuổi`, emoji: "🎂" },
                {
                  label: "Tập luyện / ngày",
                  val: `${user.exerciseTimeMinutes || 0} phút`,
                  emoji: "⚡",
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="clay-card-sm flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{row.emoji}</span>
                    <span className="text-sm font-medium text-[var(--brown-light)]">
                      {row.label}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-[var(--brown)]">
                    {row.val}
                  </span>
                </div>
              ))}
              <button
                onClick={() => setIsEdit(true)}
                className="btn-secondary mt-2"
              >
                <Edit2 size={15} /> Chỉnh sửa hồ sơ
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
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
            <h3 className="text-xl font-bold text-[var(--brown)]">
              Xóa hoạt động này?
            </h3>
            <p className="text-sm text-[var(--brown-muted)] font-medium">
              Hoạt động này sẽ bị biến mất vĩnh viễn đó nha! 🌸
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={onClose} className="btn-ghost">
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
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

export default function RoadmapPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<UserRoadmap[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserRoadmap | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const res = await Notification.requestPermission();
    setNotifPermission(res);
  };

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/user/my-profile");
      const userData = res.data.data || res.data;
      setUser(userData);
    } catch (error) {
      console.error("Profile fetch error:", error);
      router.push("/login");
    }
  }, [router]);

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
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchRoadmaps(selectedDate);
  }, [selectedDate, fetchRoadmaps]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post("/user/upload-avatar", formData);
      toast.success("Thay đổi ảnh đại diện thành công! ✨");
      fetchUser();
    } catch (err) {
      toast.error("Không thể tải lên ảnh");
    } finally {
      setUploading(false);
    }
  };

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

  const onLogout = () => {
    Cookies.remove("coffee_token");
    Cookies.remove("coffee_refresh_token");
    Cookies.remove("coffee_user");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-[var(--vanilla)]">
      {/* Sidebar (Desktop) */}
      <aside className="sidebar">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm bg-[rgba(255,209,220,0.50)]">
            ☕
          </div>
          <div>
            <p className="font-bold text-sm leading-tight text-[var(--brown)]">
              Coffee Sweetie
            </p>
            <p className="text-[10px] text-[var(--brown-muted)]">Tracker 🌸</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <a href="/" className="sidebar-item">
            <LayoutDashboard size={18} strokeWidth={1.8} />
            Dashboard
          </a>
          <a href="/roadmap" className="sidebar-item active">
            <LucideMap size={18} strokeWidth={1.8} />
            Lộ trình
          </a>
        </nav>

        <button
          className="btn-primary mt-auto"
          style={{ height: "3rem" }}
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> Hoạt động
        </button>

        <button
          onClick={() => setIsProfileOpen(true)}
          className="mt-4 flex items-center gap-3 w-full clay-card-sm px-3 py-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-[rgba(255,209,220,0.45)]">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                className="w-full h-full object-cover"
                alt="avatar"
              />
            ) : (
              <UserIcon size={18} className="text-[var(--peach-deep)]" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-bold text-sm truncate leading-tight text-[var(--brown)]">
              {user?.name || "..."}
            </p>
            <p className="text-[10px] truncate text-[var(--brown-muted)]">
              {user?.email}
            </p>
          </div>
        </button>

        <button
          onClick={onLogout}
          className="btn-ghost mt-2 text-xs"
          style={{ height: "2.5rem" }}
        >
          <LogOut size={14} /> Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-10 pb-32 lg:pb-10 overflow-x-hidden">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[1.5rem] bg-[var(--peach)] flex items-center justify-center shadow-lg shadow-pink-100 shrink-0">
                <LucideMap className="text-[var(--brown)]" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--brown)]">
                  Lộ trình của tôi
                </h1>
                <p className="text-[var(--brown-muted)] text-xs md:text-sm font-medium">
                  Lên kế hoạch và theo dõi ngày của bạn ✨
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/50 p-1.5 rounded-3xl border border-[var(--latte)] backdrop-blur-sm self-start shadow-sm">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 rounded-2xl hover:bg-[var(--vanilla)] text-[var(--brown)] transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2 px-3 font-bold text-sm md:text-base text-[var(--brown)] min-w-[140px] justify-center">
                <Calendar size={16} className="text-[var(--peach-deep)]" />
                <span>
                  {new Date(selectedDate).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-2 rounded-2xl hover:bg-[var(--vanilla)] text-[var(--brown)] transition-colors"
                aria-label="Next day"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </header>

          {/* Timeline Container */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-[var(--peach)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[var(--brown-muted)] font-bold">
                  Đang tải...
                </p>
              </div>
            ) : roadmaps.length > 0 ? (
              <div className="py-2">
                {roadmaps.map((item) => (
                  <RoadmapItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggleCompletion}
                    onDelete={handleDelete}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 md:py-16 clay-card border-dashed border-2 bg-white/30 space-y-4 px-4 mx-2">
                <div className="w-20 h-20 bg-[var(--vanilla)] rounded-[2rem] flex items-center justify-center mx-auto text-4xl pulse-gentle shadow-inner">
                  🌸
                </div>
                <div>
                  <p className="font-bold text-[var(--brown-light)]">
                    Chưa có kế hoạch nào cho ngày này~
                  </p>
                  <p className="text-xs text-[var(--brown-muted)]">
                    Hãy tạo lộ trình của bạn hoặc sử dụng mẫu!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary sm:w-auto px-8"
                  >
                    <Plus size={18} /> Thêm hoạt động
                  </button>
                  <button
                    onClick={handleSeedTemplate}
                    className="btn-secondary sm:w-auto px-8"
                  >
                    <Sparkles size={18} /> Dùng mẫu gợi ý
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FAB Mobile */}
      <button
        onClick={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        className="fab"
        aria-label="Thêm hoạt động"
      >
        <Plus size={32} />
      </button>

      {/* Bottom Nav Mobile */}
      <nav className="bottom-nav">
        {[
          { icon: LayoutDashboard, label: "Trang chủ", href: "/" },
          { icon: BookOpen, label: "Nhật ký", href: "/diary" },
          { icon: "fab", label: "" }, // spacer
          { icon: LucideMap, label: "Lộ trình", href: "/roadmap" },
          {
            icon: UserIcon,
            label: "Hồ sơ",
            onClick: () => setIsProfileOpen(true),
          },
        ].map((item, i) => {
          if (item.icon === "fab") return <div key={i} className="w-16" />;
          const Icon = item.icon as React.ElementType;
          const isActive = item.href === "/roadmap";
          return (
            <button
              key={i}
              onClick={
                item.href
                  ? () => (window.location.href = item.href)
                  : item.onClick
              }
              className="flex flex-col items-center gap-1 px-3 py-1 transition-opacity"
              style={{
                color: isActive ? "var(--peach-deep)" : "var(--brown-muted)",
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <RoadmapModal
        isOpen={isModalOpen}
        selectedDate={selectedDate}
        initialData={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
      />

      <AnimatePresence>
        {isProfileOpen && user && (
          <ProfileDrawer
            user={user}
            uploading={uploading}
            fileInputRef={fileInputRef}
            onClose={() => setIsProfileOpen(false)}
            onSaved={fetchUser}
            onFileChange={handleFileUpload}
          />
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIdToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
