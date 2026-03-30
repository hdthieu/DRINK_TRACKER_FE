"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ProfileDrawer } from "./ProfileDrawer";
import { AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { Plus } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onAddActionButton?: () => void;
  actionIcon?: React.ElementType;
  showAddDrinkButton?: boolean;
  onAddDrink?: () => void;
}

export function DashboardLayout({
  children,
  onAddActionButton,
  actionIcon = Plus,
  showAddDrinkButton = false,
  onAddDrink,
}: DashboardLayoutProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, uploading, fileInputRef, handleFileUpload, fetchUser } =
    useUser();

  return (
    <div className="dashboard-container">
      <Sidebar
        user={user}
        onProfile={() => setIsProfileOpen(true)}
        onAddDrink={showAddDrinkButton ? onAddDrink : undefined}
      />

      <main className="dashboard-content">
        <div className="max-w-[1400px] mx-auto w-full">{children}</div>
      </main>

      <MobileNav
        onProfile={() => setIsProfileOpen(true)}
        onAddActionButton={onAddActionButton}
        actionIcon={actionIcon}
      />

      <AnimatePresence>
        {isProfileOpen && user && (
          <ProfileDrawer
            user={user}
            onClose={() => setIsProfileOpen(false)}
            onSaved={fetchUser}
            uploading={uploading}
            fileInputRef={fileInputRef}
            onFileChange={handleFileUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
