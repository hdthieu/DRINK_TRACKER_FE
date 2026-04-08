"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Settings,
  Mail,
  User as UserIcon,
  Save,
  Camera,
  Scale,
  Zap,
  Coffee,
  Clock,
  BellRing,
} from "lucide-react";
import { UserProfile } from "@/lib/types";
import { toast } from "sonner";
import api from "@/lib/api";

interface ProfileDrawerProps {
  user: UserProfile;
  onClose: () => void;
  onSaved: () => void;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileDrawer({
  user,
  onClose,
  onSaved,
  uploading,
  fileInputRef,
  onFileChange,
}: ProfileDrawerProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    weight: user.weight,
    age: user.age || 20,
    exerciseTimeMinutes: user.exerciseTimeMinutes || 0,
    isHighTemperature: user.isHighTemperature || false,
    dailyCaffeineLimit: user.dailyCaffeineLimit,
    dailySugarLimit: user.dailySugarLimit,
    reminderStartTime: user.reminderStartTime || "08:00",
    reminderEndTime: user.reminderEndTime || "22:00",
    reminderInterval: user.reminderInterval || 120,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/user/update", form);
      toast.success("✨ Hồ sơ đã được lưu!");
      setIsEdit(false);
      onSaved();
    } catch {
      toast.error("Lỗi khi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const profileRows = [
    { label: "Cân nặng", val: `${user.weight} kg`, emoji: "⚖️", icon: Scale },
    {
      label: "Tuổi",
      val: `${user.age || 20} tuổi`,
      emoji: "🎂",
      icon: UserIcon,
    },
    {
      label: "Vận động",
      val: `${user.exerciseTimeMinutes || 0} phút`,
      emoji: "🏃",
      icon: Zap,
    },
    {
      label: "Giới hạn Caffeine",
      val: `${user.dailyCaffeineLimit} mg`,
      emoji: "⚡",
      icon: Coffee,
    },
    {
      label: "Giờ bắt đầu",
      val: user.reminderStartTime || "08:00",
      emoji: "🌅",
      icon: Clock,
    },
    {
      label: "Giờ kết thúc",
      val: user.reminderEndTime || "22:00",
      emoji: "🌙",
      icon: Clock,
    },
    {
      label: "Tần suất nhắc",
      val: `${user.reminderInterval || 120} phút`,
      emoji: "🔔",
      icon: BellRing,
    },
  ];

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-[rgba(255,251,245,0.95)] backdrop-blur-xl z-[150] shadow-2xl border-l border-white/50 flex flex-col"
    >
      <div className="p-6 flex items-center justify-between border-b border-[var(--latte)]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">
            👑
          </div>
          <h2 className="text-xl font-bold text-[var(--brown)]">
            Profile Setting
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-white transition-colors text-[var(--brown-muted)]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-white relative bg-white">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-rose-50">
                  <UserIcon size={48} className="text-rose-200" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[var(--peach-deep)] text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
            >
              <Camera size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={onFileChange}
            />
          </div>

          <div>
            <h3 className="text-2xl font-black text-[var(--brown)] tracking-tight">
              {user.name}
            </h3>
            <div className="flex items-center justify-center gap-1.5 text-[var(--brown-muted)] font-medium text-sm mt-1">
              <Mail size={12} /> {user.email}
            </div>
          </div>
        </div>

        {isEdit ? (
          <div className="clay-card p-6 space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brown-muted)] ml-1">
                  Nickname 🌸
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brown-muted)]"
                    size={18}
                  />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-12 bg-white rounded-2xl border-none shadow-inner pl-12 pr-4 font-bold text-[var(--brown)] focus:ring-2 focus:ring-[var(--peach-deep)] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brown-muted)] ml-1">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: +e.target.value })
                    }
                    className="w-full h-12 bg-white rounded-2xl border-none shadow-inner px-4 font-bold text-[var(--brown)] focus:ring-2 focus:ring-[var(--peach-deep)] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brown-muted)] ml-1">
                    Tuổi
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: +e.target.value })}
                    className="w-full h-12 bg-white rounded-2xl border-none shadow-inner px-4 font-bold text-[var(--brown)] focus:ring-2 focus:ring-[var(--peach-deep)] transition-all"
                  />
                </div>
              </div>

              {/* --- ROYAL HYDRATION WINDOW --- ✨🥂 */}
              <div className="pt-2">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--peach-deep)] mb-3 flex items-center gap-2">
                  <Clock size={12} /> Setting thời gian nhắc nhở
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brown-muted)] ml-1">
                      Giờ thức dậy 🌅
                    </label>
                    <input
                      type="time"
                      value={form.reminderStartTime}
                      onChange={(e) =>
                        setForm({ ...form, reminderStartTime: e.target.value })
                      }
                      className="w-full h-12 bg-white rounded-2xl border-none shadow-inner px-4 font-bold text-[var(--brown)] focus:ring-2 focus:ring-[var(--peach-deep)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brown-muted)] ml-1">
                      Giờ đi ngủ 🌙
                    </label>
                    <input
                      type="time"
                      value={form.reminderEndTime}
                      onChange={(e) =>
                        setForm({ ...form, reminderEndTime: e.target.value })
                      }
                      className="w-full h-12 bg-white rounded-2xl border-none shadow-inner px-4 font-bold text-[var(--brown)] focus:ring-2 focus:ring-[var(--peach-deep)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 mt-4">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brown-muted)] ml-1">
                    Tần suất nhắc nhở (phút) 🔔
                  </label>
                  <input
                    type="number"
                    step="15"
                    value={form.reminderInterval}
                    onChange={(e) =>
                      setForm({ ...form, reminderInterval: +e.target.value })
                    }
                    className="w-full h-12 bg-white rounded-2xl border-none shadow-inner px-4 font-bold text-[var(--brown)] focus:ring-2 focus:ring-[var(--peach-deep)] transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full h-14 group"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} /> Lưu thay đổi
                </>
              )}
            </button>
            <button
              onClick={() => setIsEdit(false)}
              className="w-full py-2 text-sm font-bold text-[var(--brown-muted)] hover:text-[var(--brown)] transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3">
              {profileRows.map((row, i) => (
                <div
                  key={i}
                  className="clay-card-sm p-4 flex items-center justify-between hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-lg">
                      {row.emoji}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--brown-muted)]">
                        {row.label}
                      </p>
                      <p className="text-sm font-bold text-[var(--brown)]">
                        {row.val}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsEdit(true)}
              className="btn-secondary w-full h-12"
            >
              <Settings size={18} /> Chỉnh sửa hồ sơ
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
