"use client";
import { useState } from "react";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function Banner({
  type = "info",
  title,
  message,
  dismissible = true,
  onDismiss,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const variants = {
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      icon: Info,
    },
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      icon: CheckCircle,
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-800 dark:text-yellow-200",
      icon: AlertTriangle,
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      icon: AlertCircle,
    },
  };

  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <div
      className={`rounded-xl border p-4 ${variant.bg} ${variant.border} ${className}`}
      role="alert">
      <div className="flex items-start">
        <Icon className={`w-5 h-5 mt-0.5 mr-3 ${variant.text}`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-medium ${variant.text} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${variant.text}`}>{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`ml-3 ${variant.text} hover:opacity-70`}
            aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
