import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState } from "react";

export default function Alert({
  children,
  variant = "info",
  dismissible = false,
  onDismiss,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  // Map to custom theme alert classes
  const getAlertClasses = (variant) => {
    switch(variant) {
      case "info":
        return "bg-[#D0D8C3]/20 border border-[#D0D8C3] text-[#014421]";
      case "success":
        return "bg-green-50 border border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border border-red-200 text-red-800";
      default:
        return "bg-[#D0D8C3]/20 border border-[#D0D8C3] text-[#014421]";
    }
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const Icon = icons[variant];

  const iconColorClass = variant === "info" ? "text-[#014421]" : 
                        variant === "success" ? "text-green-600" :
                        variant === "warning" ? "text-yellow-600" : "text-red-600";

  return (
    <div className={`alert flex items-center gap-3 p-4 rounded-lg ${getAlertClasses(variant)} ${className}`} role="alert">
      <Icon className={`w-6 h-6 ${iconColorClass}`} />
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="btn btn-sm btn-ghost btn-circle hover:bg-[#014421]/10">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
