"use client";
import { useState } from "react";

export default function Toggle({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  className = ""
}) {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#014421]/50 focus:ring-offset-2 ${
        checked ? "bg-[#014421]" : "bg-gray-300"} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-1"}`
          } />
        
      </button>
      {(label || description) &&
      <div className="flex flex-col">
          {label &&
        <label className="text-sm font-medium text-[#014421]">
              {label}
            </label>
        }
          {description &&
        <p className="text-sm text-gray-600">
              {description}
            </p>
        }
        </div>
      }
    </div>);

}