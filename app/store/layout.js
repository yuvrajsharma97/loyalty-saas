"use client";
import { useState } from "react";
import SidebarStore from "@/components/store/SidebarStore";
import TopbarStore from "@/components/store/TopbarStore";

export default function StoreLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="flex h-screen">
        {}
        <SidebarStore isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <TopbarStore onMenuToggle={toggleSidebar} />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>);

}