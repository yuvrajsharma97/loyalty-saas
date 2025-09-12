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
  // Size mapping for DaisyUI modal
  const sizeMap = {
    xs: "modal-box-xs",
    sm: "modal-box-sm",
    md: "", // default
    lg: "modal-box-lg",
    xl: "modal-box-xl",
    full: "modal-box-full",
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
    <div className="modal modal-open">
      <div className={`modal-box border border-[#D0D8C3]/30 shadow-2xl ${sizeMap[size]} ${className}`} {...props}>
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#D0D8C3]/20">
            {title && <h3 className="font-bold text-lg text-[#014421]">{title}</h3>}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                square
                onClick={onClose}
                className="btn-sm btn-circle absolute right-2 top-2 hover:bg-[#D0D8C3]/20 text-[#014421]">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="py-4 text-gray-700">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="modal-action pt-4 border-t border-[#D0D8C3]/20">
            {actions}
          </div>
        )}
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop bg-[#014421]/20" onClick={onClose}>
        <button>close</button>
      </div>
    </div>
  );
}
