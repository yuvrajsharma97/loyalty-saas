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
  className = "",
  ...props
}) {
  // Custom size styling
  const getSizeClasses = (size) => {
    switch(size) {
      case "xs":
        return "max-w-xs";
      case "sm":
        return "max-w-sm";
      case "md":
        return "max-w-md";
      case "lg":
        return "max-w-lg";
      case "xl":
        return "max-w-xl";
      case "full":
        return "max-w-full h-full";
      default:
        return "max-w-md";
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#014421]/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 w-full mx-4 ${getSizeClasses(size)} ${className}`} {...props}>
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between p-6 pb-4 border-b border-[#D0D8C3]/20">
            {title && <h3 className="font-bold text-lg text-[#014421]">{title}</h3>}
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 text-[#014421] hover:bg-[#D0D8C3]/20 focus:outline-none focus:ring-2 focus:ring-[#014421]/20">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 text-gray-700">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#D0D8C3]/20">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
