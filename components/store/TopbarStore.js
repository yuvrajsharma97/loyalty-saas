"use client";
import { Menu, Bell, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function TopbarStore({ title, onMenuToggle }) {
  return (
    <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-700 h-16">
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
            {title || "Store Dashboard"}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Logout">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
