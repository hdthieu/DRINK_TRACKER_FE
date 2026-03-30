"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import DrinkLogModal from "@/components/DrinkLogModal";

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isAddDrinkOpen, setIsAddDrinkOpen] = React.useState(false);
  const { user, uploading, fileInputRef, handleFileUpload, fetchUser } =
    useUser();

  // Determine if we should show the "Add Drink" button in Sidebar or FAB
  // For simplicity, we'll keep it available everywhere if needed, or pass it via context/props.
  // The pages can still define their own FABs if they want specific actions.

  return (
    <div className="dashboard-container">
      <Sidebar
        user={user}
        onProfile={() => setIsProfileOpen(true)}
        onAddDrink={() => setIsAddDrinkOpen(true)}
      />

      <main className="dashboard-content">
        <div className="max-w-[1400px] mx-auto w-full">{children}</div>
      </main>

      <MobileNav
        onProfile={() => setIsProfileOpen(true)}
        // The default FAB for mobile is "Add Drink" on dashboard.
        // Other pages might want to override this.
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

      <DrinkLogModal
        isOpen={isAddDrinkOpen}
        onClose={() => setIsAddDrinkOpen(false)}
        onSuccess={() => {
          // How to refresh the dashboard?
          // Usually, this should be handled by the page's fetch logic.
          // But if it's a global action, we can use a Refresh event or store.
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("refreshLogs"));
          }
        }}
      />
    </div>
  );
}
