"use client";
import { useState } from "react";

export default function Tabs({
  tabs,
  defaultTab = 0,
  onChange,
  className = "",
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-zinc-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                index === activeTab
                  ? "border-[#014421] text-[#014421] dark:border-[#D0D8C3] dark:text-[#D0D8C3]"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-600"
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{tabs[activeTab]?.content}</div>
    </div>
  );
}
