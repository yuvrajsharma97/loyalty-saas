"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = "md",
  className = ""
}) {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true">
      {}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}></div>

      {}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full ${sizes[size]} ${className}`}>
          {}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
            <h3
              className="text-lg font-semibold text-gray-900 dark:text-white"
              id="modal-title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
          </div>

          {}
          <div className="p-6">{children}</div>

          {}
          {actions &&
          <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-zinc-700">
              {actions}
            </div>
          }
        </div>
      </div>
    </div>);

}