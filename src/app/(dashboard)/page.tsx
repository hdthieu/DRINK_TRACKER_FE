"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Coffee, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { UserProfile, DrinkLog, UserRoadmap, InventoryItem } from "@/lib/types";
import { useUser } from "@/hooks/useUser";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import DrinkLogModal from "@/components/DrinkLogModal";
import {
  Bell,
  BellRing,
  Smartphone,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import {
  Utensils,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { LowStockFloatingAlert } from "@/components/LowStockFloatingAlert";

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
  if (age < 0.5) return 0;
  if (age < 1) return 100;
  if (age < 4) return 1100;
  if (age < 9) return 1350;
  if (age < 14) return 1750;
  if (age >= 60) return 1750;
  let goalLiters = weight * 0.03;
  if (user.exerciseTimeMinutes > 0) {
    goalLiters += (user.exerciseTimeMinutes / 30) * 0.36;
  }
  let goalMl = goalLiters * 1000;
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

export default function DashboardPage() {
  const { user } = useUser();
  const [todayLogs, setTodayLogs] = useState<DrinkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDrinkOpen, setIsAddDrinkOpen] = useState(false);
  const { isSupported, permission, subscribe, testNotification } =
    usePushNotifications();
  const [upcomingMeals, setUpcomingMeals] = useState<UserRoadmap[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const [logRes, roadmapRes, inventoryRes] = await Promise.all([
        api.get("/drink-log/today"),
        api.get(`/roadmap/my-roadmap?date=${today}`),
        api.get("/food-inventory"),
      ]);

      setTodayLogs(logRes.data.data || []);

      // Filter upcoming meals that haven't been completed
      const meals = (roadmapRes.data.data || roadmapRes.data || [])
        .filter((r: UserRoadmap) => r.activityType === "MEAL" && !r.isCompleted)
        .sort((a: any, b: any) => a.time.localeCompare(b.time));
      setUpcomingMeals(meals);

      // Filter low stock items
      const lowStock = (
        inventoryRes.data.data ||
        inventoryRes.data ||
        []
      ).filter(
        (i: InventoryItem) =>
          i.quantityInBaseUnit === 0 ||
          (i.lowStockThreshold && i.quantityInBaseUnit <= i.lowStockThreshold),
      );
      setLowStockItems(lowStock); // Keep full list for floating alert
    } catch {
      toast.error("Không thể tải thông tin");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const handleRefresh = () => fetchData();
    window.addEventListener("refreshLogs", handleRefresh);
    return () => window.removeEventListener("refreshLogs", handleRefresh);
  }, [fetchData]);

  const totalCaffeine = todayLogs.reduce((s, l) => s + (l.caffeineMg || 0), 0);
  const totalSugar = todayLogs.reduce((s, l) => s + (l.sugarG || 0), 0);
  const totalWater = todayLogs.reduce((s, l) => s + (l.volumeMl || 0), 0);
  const waterGoal = user ? calculateWaterGoal(user) : 2000;

  const hour = new Date().getHours();
  const greeting =
    hour < 11
      ? "Chào buổi sáng"
      : hour < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";

  if (loading && !user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
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
    <div className="px-6 lg:px-4 pb-10">
      <header className="py-10 flex items-center justify-between">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--brown-muted)" }}
          >
            {greeting} ✨
          </p>
          <h1
            className="text-3xl font-black leading-tight tracking-tight"
            style={{ color: "var(--brown)" }}
          >
            {user?.name ?? "Princess"}
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <SectionTitle>Giới hạn hôm nay 💪</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
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

          {upcomingMeals.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Bữa ăn sắp tới 🥘</SectionTitle>
                <Link
                  href="/roadmap"
                  className="text-[10px] font-bold text-[var(--peach-deep)] flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-white shadow-sm"
                >
                  Xem lộ trình <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingMeals.slice(0, 2).map((meal) => (
                  <motion.div
                    key={meal.id}
                    whileHover={{ scale: 1.02 }}
                    className="clay-card-sm p-5 border-l-4 border-orange-400 bg-white/40 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-xl shrink-0">
                      🍱
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">
                        <Clock size={10} /> {meal.time}
                      </div>
                      <h4 className="font-black text-[var(--brown)] text-sm leading-tight">
                        {meal.activityName}
                      </h4>
                      {meal.mealPlan && (
                        <p className="text-[10px] text-[var(--brown-muted)] font-medium mt-1 italic">
                          Thực đơn: {meal.mealPlan.mealName}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Nhật ký hôm nay 📖</SectionTitle>
              <button className="text-[11px] font-bold uppercase tracking-widest text-[var(--peach-deep)]">
                Xem tất cả
              </button>
            </div>
            <div className="space-y-4">
              {todayLogs.length > 0 ? (
                todayLogs.map((log) => <DrinkCard key={log.id} log={log} />)
              ) : (
                <EmptyLog onAdd={() => setIsAddDrinkOpen(true)} />
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          {lowStockItems.length > 0 && (
            <div className="clay-card p-6 border-l-4 border-rose-400 bg-rose-50/30 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-rose-600">
                <AlertTriangle size={18} /> Cảnh báo kho 🛒
              </h3>
              <div className="space-y-3">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs font-bold p-2.5 bg-white/60 rounded-2xl border border-white"
                  >
                    <span className="text-[var(--brown)]">{item.itemName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-lg ${item.quantityInBaseUnit === 0 ? "bg-rose-100 text-rose-600" : "bg-orange-100 text-orange-600"}`}
                    >
                      {item.quantityInBaseUnit === 0
                        ? "Đã hết!"
                        : `Còn ${item.quantityInBaseUnit} ${item.baseUnitSymbol}`}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/inventory"
                className="w-full btn-secondary !py-3 !text-[11px] !rounded-[1.5rem]"
              >
                Đi mua sắm ngay 🌸
              </Link>
            </div>
          )}

          <div className="clay-card p-6 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--peach-deep)]" /> Thêm
              nhanh
            </h3>
            <p className="text-sm text-[var(--brown-muted)]">
              Chọn đồ uống yêu thích:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["☕ Espresso", "🧋 Trà sữa", "🍵 Matcha", "🥛 Latte"].map(
                (d) => (
                  <button
                    key={d}
                    className="clay-card-sm text-[10px] font-bold py-3 px-2 text-center hover:scale-105 transition-transform bg-white/60"
                    onClick={() => toast.info(`${d} – Sắp ra mắt ạ!`)}
                  >
                    {d}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="clay-card p-6 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>📊</span> Tổng hôm nay
            </h3>
            <div className="space-y-3">
              {[
                {
                  emoji: "☕",
                  label: "Số lần uống",
                  val: `${todayLogs.length} lần`,
                },
                { emoji: "⚡", label: "Caffeine", val: `${totalCaffeine} mg` },
                { emoji: "🍬", label: "Đường", val: `${totalSugar} g` },
                {
                  emoji: "⚖️",
                  label: "Cân nặng",
                  val: `${user?.weight ?? "--"} kg`,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 text-[var(--brown-light)]">
                    <span>{r.emoji}</span> {r.label}
                  </div>
                  <span className="font-bold text-[var(--brown)]">{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="clay-card p-6 bg-[rgba(255,209,220,0.2)] space-y-3">
            <p className="font-bold">🌸 Lời nhắc từ Híu</p>
            <p className="text-sm italic leading-relaxed text-[var(--brown-muted)]">
              Đừng đợi khát mới uống, hãy chia nhỏ lượng nước mỗi 1-2 giờ nhé.
              💧
            </p>
          </div>

          {isSupported && (
            <div className="clay-card p-6 border-l-4 border-[var(--peach-deep)] bg-white space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${permission === "granted" ? "bg-green-50 text-green-500" : "bg-rose-50 text-rose-500"}`}
                >
                  {permission === "granted" ? (
                    <BellRing size={20} />
                  ) : (
                    <Bell size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-sm text-[var(--brown)]">
                    Thông báo màn hình chờ 📲
                  </h3>
                  <p className="text-[10px] font-bold text-[var(--brown-muted)]">
                    Báo động khi sắp hết lương thực
                  </p>
                </div>
              </div>

              {permission !== "granted" ? (
                <button
                  onClick={subscribe}
                  className="w-full btn-primary !h-12 !text-[11px] !rounded-2xl flex items-center justify-center gap-2 group/btn"
                >
                  Bật ngay cho Princess 🌸
                  <ChevronRight
                    size={14}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50/50 rounded-xl border border-green-100 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-500" />
                    <p className="text-[10px] font-black text-green-700">
                      Đã kích hoạt bảo vệ 24/7 ✨
                    </p>
                  </div>
                  <button
                    onClick={testNotification}
                    className="w-full h-11 rounded-2xl bg-white border border-[var(--latte)] text-[var(--brown-muted)] text-[10px] font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone size={14} /> Thử nghiệm thông báo
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      <DrinkLogModal
        isOpen={isAddDrinkOpen}
        onClose={() => setIsAddDrinkOpen(false)}
        onSuccess={fetchData}
      />

      <LowStockFloatingAlert items={lowStockItems} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brown-muted)]">
      {children}
    </h2>
  );
}
