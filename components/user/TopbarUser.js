"use client";
import { Menu, Bell, User } from "lucide-react";

export default function TopbarUser({ title, onMenuToggle, children }) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-[#D0D8C3] dark:border-gray-700 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-3"
            aria-label="Toggle sidebar">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title || "Dashboard"}
          </h1>
        </div>

        {/* Center - Store Switcher or other controls */}
        <div className="flex-1 flex justify-center">{children}</div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
