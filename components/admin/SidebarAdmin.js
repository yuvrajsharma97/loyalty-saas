"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  BarChart3,
  Menu,
  X,
  ChevronLeft } from
"lucide-react";

export default function SidebarAdmin({ isOpen, onToggle }) {
  const pathname = usePathname();

  const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Stores", href: "/admin/stores", icon: Store },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Usage", href: "/admin/usage", icon: BarChart3 }];


  const isActive = (href) =>
  pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {}
      {isOpen &&
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onToggle} />

      }

      {}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 shadow-lg transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"}`
        }>
        {}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-zinc-700">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#014421] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              LoyaltyOS
            </span>
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active ?
                  "bg-[#014421] text-white" :
                  "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"}`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}>
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>);

            })}
          </div>
        </nav>

        {}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-zinc-700">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Site
          </Link>
        </div>
      </div>
    </>);

}