"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map as LucideMap,
  Package,
  Utensils,
  BookOpen,
  Plus,
  User as UserIcon,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { UserProfile } from "@/lib/types";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface SidebarProps {
  user: UserProfile | null;
  onProfile: () => void;
  onAddDrink?: () => void;
}

export function Sidebar({ user, onProfile, onAddDrink }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: LucideMap, label: "Roadmap", href: "/roadmap" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Utensils, label: "Meal Plan", href: "/meal-plans" },
  ];

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    toast.success("Hẹn gặp lại Princess nhé! 🌸");
    router.replace("/login");
  };

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
        {navItems.map((n) => {
          const isActive = pathname === n.href;
          return (
            <button
              key={n.label}
              onClick={() => router.push(n.href)}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <n.icon size={18} strokeWidth={1.8} />
              {n.label}
            </button>
          );
        })}
      </nav>

      {onAddDrink && (
        <button
          className="btn-primary mt-auto"
          style={{ height: "3rem" }}
          onClick={onAddDrink}
        >
          <Plus size={18} /> Thêm đồ uống
        </button>
      )}

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
        onClick={handleLogout}
        className="btn-ghost mt-2 text-xs"
        style={{ height: "2.5rem" }}
      >
        <LogOut size={14} /> Đăng xuất
      </button>
    </aside>
  );
}
