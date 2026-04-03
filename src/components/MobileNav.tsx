"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map as LucideMap,
  Package,
  Utensils,
  BookOpen,
  User as UserIcon,
  Plus,
} from "lucide-react";

interface MobileNavProps {
  onProfile: () => void;
  onAddActionButton?: () => void;
  actionIcon?: React.ElementType;
}

export function MobileNav({
  onProfile,
  onAddActionButton,
  actionIcon: ActionIcon = Plus,
}: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: LucideMap, label: "Roadmap", href: "/roadmap" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Utensils, label: "Meal Plan", href: "/meal-plans" },
  ];

  return (
    <>
      {/* FAB Mobile - Only show if onAddActionButton is provided */}
      {onAddActionButton && (
        <button onClick={onAddActionButton} className="fab" aria-label="Action">
          <ActionIcon size={32} />
        </button>
      )}

      <nav className="bottom-nav">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <button
              key={i}
              onClick={() => router.push(item.href)}
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

        {/* Spacer for FAB if needed, or just the Profile button */}
        <div className="w-12 h-1" />

        <button
          onClick={onProfile}
          className="flex flex-col items-center gap-1 px-3 py-1 transition-opacity"
          style={{ color: "var(--brown-muted)" }}
        >
          <UserIcon size={20} strokeWidth={1.8} />
          <span className="text-[9px] font-bold">Hồ sơ</span>
        </button>
      </nav>
    </>
  );
}
