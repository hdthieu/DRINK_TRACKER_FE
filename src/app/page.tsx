"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  User as UserIcon,
  Droplets,
  Zap,
  LogOut,
  X,
  Scale,
  Settings,
  Mail,
  Coffee,
  Camera,
  Save,
  Edit2,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  ChevronRight,
  Star,
  Map as LucideMap,
} from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import DrinkLogModal from "@/components/DrinkLogModal";

/* ─── Types ──────────────────────────────────────────────── */
interface UserProfile {
  id: string;
  email: string;
  name: string;
  dailyCaffeineLimit: number;
  dailySugarLimit: number;
  weight: number;
  age?: number;
  exerciseTimeMinutes: number;
  isHighTemperature: boolean;
  imageUrl?: string;
}
interface DrinkLog {
  id: string;
  drinkName: string;
  caffeineMg: number;
  sugarG: number;
  calories: number;
  volumeMl: number;
  price: number;
  rating: number;
  size?: string;
  temperature?: string;
  createdAt: string;
}

/* ─── SVG Ring Progress ──────────────────────────────────── */
function RingProgress({
  value,
  max,
  color,
  emoji,
  label,
  unit,
}: {
  value: number;
  max: number;
  color: string;
  emoji: string;
  label: string;
  unit: string;
}) {
  const R = 44;
  const circ = 2 * Math.PI * R;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ * (1 - pct);
  return (
    <div className="clay-card p-5 flex flex-col items-center gap-3 cursor-pointer group">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={R} className="progress-ring-track" />
          <circle
            cx="50"
            cy="50"
            r={R}
            className="progress-ring-fill"
            stroke={color}
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl">{emoji}</span>
          <span
            className="text-xs font-bold mt-0.5"
            style={{ color: "var(--brown-light)" }}
          >
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>
      <div className="text-center space-y-0.5">
        <p
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "var(--brown-muted)" }}
        >
          {label}
        </p>
        <p className="text-base font-bold" style={{ color: "var(--brown)" }}>
          {value}
          <span
            className="text-xs ml-1"
            style={{ color: "var(--brown-light)" }}
          >
            / {max} {unit}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ─── Polaroid Drink Card ────────────────────────────────── */
function DrinkCard({ log }: { log: DrinkLog }) {
  const t = new Date(log.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="clay-card-sm p-4 flex items-center justify-between gap-4 group"
    >
      <div
        className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-200"
        style={{
          background: "rgba(255,209,220,0.30)",
          border: "3px solid rgba(255,255,255,0.8)",
        }}
      >
        <Coffee
          size={22}
          strokeWidth={1.8}
          style={{ color: "var(--peach-deep)" }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className="font-bold text-base leading-tight truncate"
          style={{ color: "var(--brown)" }}
        >
          {log.drinkName}
        </h4>
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <p
            className="text-[11px] font-medium"
            style={{ color: "var(--brown-muted)" }}
          >
            🕐 {t}
          </p>
          {(log.size || log.temperature) && (
            <div className="flex gap-1">
              {log.size && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-[var(--latte)] text-[var(--brown-muted)]">
                  {log.size}
                </span>
              )}
              {log.temperature && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                    log.temperature === "Hot"
                      ? "bg-orange-50 border-orange-100 text-orange-500"
                      : "bg-blue-50 border-blue-100 text-blue-500"
                  }`}
                >
                  {log.temperature === "Hot" ? "Hot" : "Cold"}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={8}
                fill={s <= (log.rating || 0) ? "var(--peach-deep)" : "none"}
                stroke={
                  s <= (log.rating || 0)
                    ? "var(--peach-deep)"
                    : "var(--latte-deep)"
                }
                strokeWidth={2}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p
          className="font-bold text-base"
          style={{ color: "var(--peach-deep)" }}
        >
          +{log.caffeineMg}
          <span className="text-[10px] ml-0.5">mg</span>
        </p>
        <p className="text-[10px]" style={{ color: "var(--brown-muted)" }}>
          🍬 {log.sugarG}g
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */
function calculateWaterGoal(user: UserProfile): number {
  const age = user.age || 20;
  const weight = user.weight || 60;

  // 1. Children (theo độ tuổi)
  if (age < 0.5) return 0;
  if (age < 1) return 100; // 60 - 120ml
  if (age < 4) return 1100; // 1 - 1.2L
  if (age < 9) return 1350; // 1.2 - 1.5L
  if (age < 14) return 1750; // 1.5 - 2L

  // 2. Elderly (Người cao tuổi)
  if (age >= 60) return 1750; // 1.5 - 2L

  // 3. Adults (Nhóm chính)
  // Lượng nước cơ bản: Weight * 0.03 (liters)
  let goalLiters = weight * 0.03;

  // Thêm vận động: ~360ml cho mỗi 30 phút
  if (user.exerciseTimeMinutes > 0) {
    goalLiters += (user.exerciseTimeMinutes / 30) * 0.36;
  }

  // Chuyển sang ml
  let goalMl = goalLiters * 1000;

  // 4. Special cases
  if (user.isHighTemperature) goalMl += 600;

  return Math.round(goalMl);
}

/* ─── Empty State ────────────────────────────────────────── */
function EmptyLog({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      className="p-12 text-center rounded-[2rem] border-2 border-dashed space-y-4"
      style={{
        borderColor: "var(--latte)",
        background: "rgba(255,245,225,0.6)",
      }}
    >
      <div
        className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto pulse-gentle"
        style={{ background: "rgba(255,209,220,0.25)" }}
      >
        <Coffee
          size={36}
          strokeWidth={1.2}
          style={{ color: "var(--peach-deep)" }}
        />
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <p
            className="font-bold text-base"
            style={{ color: "var(--brown-light)" }}
          >
            Chưa có gì hôm nay~ ☕
          </p>
          <p className="text-xs" style={{ color: "var(--brown-muted)" }}>
            Thêm đồ uống đầu tiên của bạn nhé!
          </p>
        </div>
        <button
          className="btn-secondary"
          style={{
            width: "auto",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
          onClick={onAdd}
        >
          Thêm ngay!
        </button>
      </div>
    </div>
  );
}

/* ─── PC Sidebar ─────────────────────────────────────────── */
function Sidebar({
  user,
  onProfile,
  onLogout,
  onAddDrink,
}: {
  user: UserProfile | null;
  onProfile: () => void;
  onLogout: () => void;
  onAddDrink: () => void;
}) {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true, href: "/" },
    { icon: LucideMap, label: "Lộ trình", active: false, href: "/roadmap" },
    { icon: BookOpen, label: "Nhật ký", active: false, href: "/diary" },
  ];

  return (
    <aside className="sidebar">
      <div className="flex items-center gap-3 px-2 mb-6">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm"
          style={{ background: "rgba(255,209,220,0.50)" }}
        >
          ☕
        </div>
        <div>
          <p
            className="font-bold text-sm leading-tight"
            style={{ color: "var(--brown)" }}
          >
            Coffee Sweetie
          </p>
          <p className="text-[10px]" style={{ color: "var(--brown-muted)" }}>
            Tracker 🌸
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((n) => (
          <button
            key={n.label}
            onClick={() => n.href && (window.location.href = n.href)}
            className={`sidebar-item ${n.active ? "active" : ""}`}
          >
            <n.icon size={18} strokeWidth={1.8} />
            {n.label}
          </button>
        ))}
      </nav>

      <button
        className="btn-primary mt-auto"
        style={{ height: "3rem" }}
        onClick={onAddDrink}
      >
        <Plus size={18} /> Thêm đồ uống
      </button>

      {/* User chip */}
      <button
        onClick={onProfile}
        className="mt-4 flex items-center gap-3 w-full clay-card-sm px-3 py-2.5 hover:opacity-80 transition-opacity"
      >
        <div
          className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,209,220,0.45)" }}
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          ) : (
            <UserIcon size={18} style={{ color: "var(--peach-deep)" }} />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p
            className="font-bold text-sm truncate leading-tight"
            style={{ color: "var(--brown)" }}
          >
            {user?.name ?? "..."}
          </p>
          <p
            className="text-[10px] truncate"
            style={{ color: "var(--brown-muted)" }}
          >
            {user?.email}
          </p>
        </div>
        <ChevronRight size={14} style={{ color: "var(--brown-muted)" }} />
      </button>

      <button
        onClick={onLogout}
        className="btn-ghost mt-2 text-xs"
        style={{ height: "2.5rem" }}
      >
        <LogOut size={14} /> Đăng xuất
      </button>
    </aside>
  );
}

function ProfileDrawer({
  user,
  onClose,
  onSaved,
  fileInputRef,
  onFileChange,
  uploading,
  notifPermission,
  onRequestNotif,
}: {
  user: UserProfile;
  onClose: () => void;
  onSaved: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  notifPermission: NotificationPermission;
  onRequestNotif: () => void;
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
        toast.error("Kiểm tra lại thông tin nhé! 🌸");
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
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(109,76,65,0.25)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[22rem] z-50 overflow-y-auto"
        style={{
          background: "rgba(255,245,225,0.96)",
          backdropFilter: "blur(24px)",
          borderLeft: "1.5px solid rgba(215,204,200,0.6)",
          boxShadow: "-8px 0 40px rgba(109,76,65,0.12)",
        }}
      >
        <div className="p-7 pt-16 relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-2xl flex items-center justify-center transition-colors"
            style={{
              background: "rgba(255,209,220,0.35)",
              color: "var(--brown-light)",
            }}
          >
            <X size={18} />
          </button>

          {/* Avatar */}
          <div
            className="relative w-28 h-28 mx-auto mb-6 group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              className="w-full h-full rounded-[2.2rem] overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
              style={{
                background: "rgba(255,209,220,0.35)",
                border: "4px solid rgba(255,255,255,0.8)",
                boxShadow: "0 6px 20px rgba(109,76,65,0.12)",
              }}
            >
              {uploading ? (
                <Settings
                  size={32}
                  className="animate-spin"
                  style={{ color: "var(--peach-deep)" }}
                />
              ) : user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <UserIcon size={40} style={{ color: "var(--peach-deep)" }} />
              )}
            </div>
            <div
              className="absolute inset-0 rounded-[2.2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              style={{ background: "rgba(255,209,220,0.55)" }}
            >
              <Camera size={22} style={{ color: "var(--brown)" }} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Name & email */}
          {!isEdit && (
            <div className="text-center mb-6 space-y-1">
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--brown)" }}
              >
                {user.name}
              </h2>
              <div
                className="flex items-center justify-center gap-1.5 text-xs font-medium"
                style={{ color: "var(--brown-muted)" }}
              >
                <Mail size={11} /> {user.email}
              </div>
            </div>
          )}

          {isEdit ? (
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest ml-3"
                  style={{ color: "var(--brown-muted)" }}
                >
                  Tên của bạn 🌸
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass("name")}
                  placeholder="Princess..."
                />
                {fieldErrors.name && (
                  <p className="text-[10px] text-rose-500 ml-3">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest ml-3"
                  style={{ color: "var(--brown-muted)" }}
                >
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
                {fieldErrors.weight && (
                  <p className="text-[10px] text-rose-500 ml-3">
                    {fieldErrors.weight}
                  </p>
                )}
              </div>

              {/* Age & Exercise */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    className="text-[10px] font-bold uppercase tracking-widest ml-3"
                    style={{ color: "var(--brown-muted)" }}
                  >
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
                  <label
                    className="text-[10px] font-bold uppercase tracking-widest ml-3"
                    style={{ color: "var(--brown-muted)" }}
                  >
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

              {/* Special Conditions */}
              <div className="space-y-2">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest ml-3"
                  style={{ color: "var(--brown-muted)" }}
                >
                  Tình trạng sức khỏe 🏥
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      key: "isHighTemperature",
                      label: "Làm việc ngoài trời/Nóng ☀️",
                    },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          [item.key]: !form[item.key as keyof typeof form],
                        })
                      }
                      className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border-2 transition-all ${
                        form[item.key as keyof typeof form]
                          ? "border-[var(--peach-deep)] bg-rose-50 text-[var(--peach-deep)]"
                          : "border-gray-100 bg-white text-[var(--brown-light)] hover:border-[var(--latte-deep)]"
                      }`}
                    >
                      <span className="text-sm font-bold">{item.label}</span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          form[item.key as keyof typeof form]
                            ? "bg-[var(--peach-deep)] border-[var(--peach-deep)]"
                            : "border-gray-300"
                        }`}
                      >
                        {form[item.key as keyof typeof form] && (
                          <Plus size={12} className="text-white rotate-45" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    className="text-[10px] font-bold uppercase ml-2"
                    style={{ color: "var(--brown-muted)" }}
                  >
                    Caffeine ⚡
                  </label>
                  <input
                    inputMode="numeric"
                    value={form.dailyCaffeineLimit}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setForm({
                        ...form,
                        dailyCaffeineLimit: v === "" ? 0 : Number(v),
                      });
                    }}
                    className={inputClass("dailyCaffeineLimit")}
                    style={{ borderRadius: "1rem", paddingLeft: "1rem" }}
                  />
                  {fieldErrors.dailyCaffeineLimit && (
                    <p className="text-[9px] text-rose-500">
                      {fieldErrors.dailyCaffeineLimit}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    className="text-[10px] font-bold uppercase ml-2"
                    style={{ color: "var(--brown-muted)" }}
                  >
                    Đường 🍬
                  </label>
                  <input
                    inputMode="numeric"
                    value={form.dailySugarLimit}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setForm({
                        ...form,
                        dailySugarLimit: v === "" ? 0 : Number(v),
                      });
                    }}
                    className={inputClass("dailySugarLimit")}
                    style={{ borderRadius: "1rem", paddingLeft: "1rem" }}
                  />
                  {fieldErrors.dailySugarLimit && (
                    <p className="text-[9px] text-rose-500">
                      {fieldErrors.dailySugarLimit}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary mt-2"
              >
                <Save size={16} />
                {saving ? "Đang lưu..." : "Lưu thay đổi ✨"}
              </button>
              <button onClick={() => setIsEdit(false)} className="btn-ghost">
                Hủy bỏ
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                {
                  icon: Scale,
                  label: "Cân nặng",
                  val: `${user.weight} kg`,
                  emoji: "⚖️",
                },
                {
                  icon: BookOpen,
                  label: "Tuổi",
                  val: `${user.age || "—"} tuổi`,
                  emoji: "🎂",
                },
                {
                  icon: Zap,
                  label: "Tập luyện / ngày",
                  val: `${user.exerciseTimeMinutes || 0} phút`,
                  emoji: "⚡",
                },
                {
                  icon: Sparkles,
                  label: "Tình trạng",
                  val: user.isHighTemperature
                    ? "Làm việc nắng nóng"
                    : "Bình thường",
                  emoji: "🏥",
                },
                {
                  icon: Zap,
                  label: "Caffeine / ngày",
                  val: `${user.dailyCaffeineLimit} mg`,
                  emoji: "☕",
                },
                {
                  icon: Droplets,
                  label: "Đường / ngày",
                  val: `${user.dailySugarLimit} g`,
                  emoji: "🍬",
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="clay-card-sm flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{row.emoji}</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--brown-light)" }}
                    >
                      {row.label}
                    </span>
                  </div>
                  <span
                    className="font-bold text-sm text-right max-w-[120px] truncate"
                    style={{ color: "var(--brown)" }}
                  >
                    {row.val}
                  </span>
                </div>
              ))}

              <button
                onClick={onRequestNotif}
                className="clay-card-sm flex items-center justify-between px-4 py-3.5 w-full mt-2"
                style={{
                  background:
                    notifPermission === "granted"
                      ? "rgba(255,209,220,0.3)"
                      : undefined,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🔔</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--brown-light)" }}
                  >
                    Thông báo nhắc nhở
                  </span>
                </div>
                <span
                  className="font-bold text-sm"
                  style={{
                    color:
                      notifPermission === "granted"
                        ? "var(--peach-deep)"
                        : "var(--brown-muted)",
                  }}
                >
                  {notifPermission === "granted" ? "Đã bật ✨" : "Nhấn để bật"}
                </span>
              </button>

              <button
                onClick={() => setIsEdit(true)}
                className="btn-secondary mt-2"
              >
                <Edit2 size={15} /> Chỉnh sửa hồ sơ
              </button>

              <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                  💡 Thời điểm vàng
                </p>
                <ul className="text-[11px] text-amber-800 space-y-1">
                  <li>• Ngay sau khi thức dậy</li>
                  <li>• 15-45 phút trước bữa ăn</li>
                  <li>• 30-40 phút sau bữa ăn</li>
                  <li>• Đầu giờ chiều & trước tập</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [todayLogs, setTodayLogs] = useState<DrinkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddDrinkOpen, setIsAddDrinkOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    if (res === "granted") {
      new Notification("🌸 Drink Tracker", {
        body: "Thông báo đã được bật! Em sẽ nhắc chị uống nước nhé~",
        icon: "/icons/icon-192x192.png",
      });
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [userRes, logsRes] = await Promise.all([
        api.get("/user/my-profile"),
        api.get("/drinklog/today"),
      ]);

      if (userRes.status === 200 || userRes.status === 201) {
        setUser(userRes.data.data || userRes.data);
      }

      if (logsRes.status === 200 || logsRes.status === 201) {
        setTodayLogs(logsRes.data.data || logsRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Reminder Logic ─── */
  useEffect(() => {
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "granted" ||
      !user
    )
      return;

    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const lastDrink = todayLogs[0]; // Most recent is first
      const waterGoalValue = calculateWaterGoal(user);
      const totalWaterValue = todayLogs.reduce(
        (s, l) => s + (l.volumeMl || 0),
        0,
      );

      if (totalWaterValue >= waterGoalValue) return;

      // 1. Golden times check
      const goldenTimes = [
        {
          h: 7,
          m: 30,
          msg: "Chào buổi sáng Princess! Uống một cốc nước ấm ngay sau khi thức dậy để thanh lọc cơ thể nhé~ 🌸",
        },
        {
          h: 11,
          m: 30,
          msg: "Sắp đến giờ cơm trưa rồi, chị uống một chút nước trước ăn 30 phút để tiêu hoá tốt hơn nha! ✨",
        },
        {
          h: 13,
          m: 30,
          msg: "Đầu giờ chiều rồi, uống 200ml nước để duy trì tỉnh táo và làm việc hiệu quả nè! 💕",
        },
        {
          h: 16,
          m: 0,
          msg: "Giờ trà chiều rồi! Thay vì trà sữa, chị hãy uống một ly nước lọc để da dẻ luôn mịn màng nhé~ 💧",
        },
        {
          h: 20,
          m: 0,
          msg: "Buổi tối thư giãn, đừng quên bù thêm nước cho cơ thể trước khi đi ngủ nhé Princess! 🌙",
        },
      ];

      const matchTime = goldenTimes.find(
        (t) => t.h === currentHour && Math.abs(t.m - currentMinute) < 2,
      );
      if (matchTime) {
        new Notification("🌸 Thời điểm vàng", {
          body: matchTime.msg,
          icon: "/icons/icon-192x192.png",
        });
        return;
      }

      // 2. Interval check (mỗi 1.5 giờ nếu chưa uống)
      if (lastDrink) {
        const lastTime = new Date(lastDrink.createdAt).getTime();
        const diffHours = (now.getTime() - lastTime) / (1000 * 60 * 60);

        if (diffHours >= 1.5) {
          const remaining = waterGoalValue - totalWaterValue;
          new Notification("🌸 Híu nhắc chị nè", {
            body: `Đã hơn 1.5 tiếng chị chưa uống nước rồi đó! Chị còn thiếu ${remaining}ml nữa, uống ngay 200ml nha~`,
            icon: "/icons/icon-192x192.png",
          });
        }
      } else if (currentHour >= 8) {
        // Nếu chưa uống gì cả ngày mà đã qua 8h sáng
        new Notification("🌸 Bắt đầu ngày mới", {
          body: "Chị ơi, hôm nay chưa thấy chị ghi nhật ký uống nước. Khởi đầu ngày mới với một ly nước lọc nhé! ✨",
          icon: "/icons/icon-192x192.png",
        });
      }
    };

    const interval = setInterval(checkReminders, 1000 * 60 * 5); // Kiểm tra mỗi 5 phút
    checkReminders(); // Chạy ngay khi mount

    return () => clearInterval(interval);
  }, [todayLogs, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      await api.post("/user/upload-avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("🌸 Avatar đã được tải lên!");
      await fetchData();
    } catch {
      toast.error("Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("coffee_token");
    Cookies.remove("coffee_refresh_token");
    Cookies.remove("coffee_user");
    toast.success("💕 Hẹn gặp lại Princess nhé!");
    router.push("/login");
  };

  /* computed totals */
  const totalCaffeine = todayLogs.reduce((s, l) => s + (l.caffeineMg || 0), 0);
  const totalSugar = todayLogs.reduce((s, l) => s + (l.sugarG || 0), 0);
  const totalWater = todayLogs.reduce((s, l) => s + (l.volumeMl || 0), 0);

  // Goal calculation based on new knowledge
  const waterGoal = user ? calculateWaterGoal(user) : 2000;

  /* greeting */
  const hour = new Date().getHours();
  const greeting =
    hour < 11
      ? "Chào buổi sáng"
      : hour < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";

  /* ── Loading ─── */
  if (loading && !user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--vanilla)" }}
      >
        <div
          className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl pulse-gentle"
          style={{ background: "rgba(255,209,220,0.40)" }}
        >
          ☕
        </div>
        <p
          className="font-bold text-sm"
          style={{ color: "var(--brown-muted)" }}
        >
          Đang pha cà phê… ✨
        </p>
      </div>
    );
  }

  return (
    <>
      <Sidebar
        user={user}
        onProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        onAddDrink={() => setIsAddDrinkOpen(true)}
      />

      {/* ─── Main Scroll Area ────────────────────────────────── */}
      <main
        className="min-h-screen pb-28 lg:pb-10 lg:pl-64"
        style={{ color: "var(--brown)" }}
      >
        {/* ── Header ───────────────────────────────────────────*/}
        <header className="px-6 lg:px-10 pt-10 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar chip */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-14 h-14 rounded-[1.4rem] overflow-hidden flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95"
              style={{
                background: "rgba(255,209,220,0.35)",
                border: "3px solid rgba(255,255,255,0.8)",
                boxShadow: "0 4px 14px rgba(109,76,65,0.10)",
              }}
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              ) : (
                <UserIcon size={26} style={{ color: "var(--peach-deep)" }} />
              )}
            </button>

            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--brown-muted)" }}
              >
                {greeting} ✨
              </p>
              <h1
                className="text-2xl font-bold leading-tight"
                style={{ color: "var(--brown)" }}
              >
                {user?.name ?? "Princess"}
              </h1>
            </div>
          </div>

          {/* Mobile logout (hidden on lg) */}
          <button
            onClick={handleLogout}
            className="lg:hidden w-11 h-11 rounded-2xl flex items-center justify-center transition-colors"
            style={{
              background: "rgba(255,209,220,0.30)",
              color: "var(--brown-light)",
            }}
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* ── Content grid ─────────────────────────────────────*/}
        <div className="px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT + CENTER  (lg: span-2) ───────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress rings */}
            <section>
              <SectionTitle>Giới hạn hôm nay 💪</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                <RingProgress
                  value={totalWater}
                  max={waterGoal}
                  color="var(--peach-deep)"
                  emoji="💧"
                  label="Nước lọc"
                  unit="ml"
                />
                <RingProgress
                  value={totalCaffeine}
                  max={user?.dailyCaffeineLimit ?? 400}
                  color="var(--brown-light)"
                  emoji="⚡"
                  label="Caffeine"
                  unit="mg"
                />
                <RingProgress
                  value={totalSugar}
                  max={user?.dailySugarLimit ?? 30}
                  color="var(--mint-deep)"
                  emoji="🍬"
                  label="Đường"
                  unit="g"
                />
              </div>
            </section>

            {/* Drink log */}
            <section>
              <div className="flex items-center justify-between mt-2 mb-3">
                <SectionTitle>Nhật ký hôm nay 📖</SectionTitle>
                <button
                  onClick={() => setIsAddDrinkOpen(true)}
                  className="text-[11px] font-bold uppercase tracking-widest transition-colors"
                  style={{ color: "var(--peach-deep)" }}
                >
                  Xem tất cả
                </button>
              </div>
              <div className="space-y-3">
                {todayLogs.length > 0 ? (
                  todayLogs.map((log) => <DrinkCard key={log.id} log={log} />)
                ) : (
                  <EmptyLog onAdd={() => setIsAddDrinkOpen(true)} />
                )}
              </div>
            </section>
          </div>

          {/* ── RIGHT – Widget column (lg only) ───────────── */}
          <div className="hidden lg:flex flex-col gap-5">
            {/* Quick Add widget */}
            <div className="clay-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">➕</span>
                <h3
                  className="font-bold text-base"
                  style={{ color: "var(--brown)" }}
                >
                  Quick Add
                </h3>
              </div>
              <p className="text-sm" style={{ color: "var(--brown-muted)" }}>
                Chọn đồ uống nhanh yêu thích:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["☕ Espresso", "🧋 Bubble Tea", "🍵 Matcha", "🥛 Latte"].map(
                  (d) => (
                    <button
                      key={d}
                      className="clay-card-sm text-xs font-bold py-2.5 px-3 text-center hover:opacity-80 transition-opacity"
                      style={{ color: "var(--brown)" }}
                      onClick={() => toast.info(`${d} – coming soon!`)}
                    >
                      {d}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Daily summary widget */}
            <div className="clay-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3
                  className="font-bold text-base"
                  style={{ color: "var(--brown)" }}
                >
                  Tổng hôm nay
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    emoji: "☕",
                    label: "Số lần uống",
                    val: `${todayLogs.length} lần`,
                  },
                  {
                    emoji: "⚡",
                    label: "Caffeine",
                    val: `${totalCaffeine} mg`,
                  },
                  { emoji: "🍬", label: "Đường", val: `${totalSugar} g` },
                  {
                    emoji: "⚖️",
                    label: "Cân nặng",
                    val: `${user?.weight ?? "—"} kg`,
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between"
                  >
                    <div
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--brown-light)" }}
                    >
                      <span>{r.emoji}</span> {r.label}
                    </div>
                    <span
                      className="font-bold text-sm"
                      style={{ color: "var(--brown)" }}
                    >
                      {r.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Journal / tip card */}
            <div
              className="clay-card p-6 space-y-3"
              style={{ background: "rgba(255,209,220,0.25)" }}
            >
              <p className="text-lg">🌸 Lời nhắc từ Híu</p>
              <p
                className="text-sm leading-relaxed italic"
                style={{ color: "var(--brown-light)" }}
              >
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 9)
                    return "Uống nước ngay sau khi thức dậy để bù nước sau đêm dài nhé! 🌅";
                  if (hour < 12)
                    return "Uống nước trước bữa ăn 30 phút giúp hỗ trợ tiêu hóa tốt hơn nè. 🍽️";
                  if (hour < 15)
                    return "Đầu giờ chiều là thời điểm vàng để uống nước giúp duy trì tỉnh táo đó! ⚡";
                  if (hour < 18)
                    return "Đừng đợi khát mới uống, hãy chia nhỏ lượng nước mỗi 1-2 giờ nha. 💧";
                  return "Nếu tập luyện, đừng quên bù thêm 360ml cho mỗi 30 phút vận động Princess nhé! 🏃‍♀️";
                })()}
              </p>
              <p
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "var(--brown-muted)" }}
              >
                Lời khuyên chuyên gia ✨
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ────────────────────────────────*/}
      <nav className="bottom-nav">
        {[
          { icon: LayoutDashboard, label: "Trang chủ", href: "/" },
          { icon: BookOpen, label: "Nhật ký", href: "/diary" },
          { icon: "fab", label: "" }, // spacer for FAB
          { icon: LucideMap, label: "Lộ trình", href: "/roadmap" },
          {
            icon: UserIcon,
            label: "Hồ sơ",
            onClick: () => setIsProfileOpen(true),
          },
        ].map((item, i) => {
          if (item.icon === "fab") return <div key={i} className="w-16" />;
          const Icon = item.icon as React.ElementType;
          const isActive = item.href === "/";
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

      {/* ─── FAB ─────────────────────────────────────────────*/}
      <button
        className="fab"
        onClick={() => setIsAddDrinkOpen(true)}
        aria-label="Thêm đồ uống"
      >
        <Plus size={30} strokeWidth={2.5} />
      </button>

      {/* ─── Profile Drawer ───────────────────────────────────*/}
      <AnimatePresence>
        {isProfileOpen && user && (
          <ProfileDrawer
            user={user}
            uploading={uploading}
            fileInputRef={fileInputRef}
            onClose={() => setIsProfileOpen(false)}
            onSaved={fetchData}
            onFileChange={handleFileUpload}
            notifPermission={notifPermission}
            onRequestNotif={requestPermission}
          />
        )}
      </AnimatePresence>

      <DrinkLogModal
        isOpen={isAddDrinkOpen}
        onClose={() => setIsAddDrinkOpen(false)}
        onSuccess={fetchData}
      />
    </>
  );
}

/* ─── Small helper component ─────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-[0.15em]"
      style={{ color: "var(--brown-muted)" }}
    >
      {children}
    </h2>
  );
}
