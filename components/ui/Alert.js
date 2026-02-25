import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState } from "react";

export default function Alert({
  children,
  variant = "info",
  dismissible = false,
  onDismiss,
  className = ""
}) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;


  const getAlertClasses = (variant) => {
    const baseAlertStyles = "flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm transition-all duration-200";

    switch (variant) {
      case "info":
        return `${baseAlertStyles} bg-glass-secondary border-[#D0D8C3]/50 text-text-primary shadow-lg`;
      case "success":
        return `${baseAlertStyles} bg-green-500/10 backdrop-blur-lg border-green-300/50 text-green-800 shadow-lg`;
      case "warning":
        return `${baseAlertStyles} bg-yellow-500/10 backdrop-blur-lg border-yellow-300/50 text-yellow-800 shadow-lg`;
      case "error":
        return `${baseAlertStyles} bg-red-500/10 backdrop-blur-lg border-red-300/50 text-red-800 shadow-lg`;
      default:
        return `${baseAlertStyles} bg-glass-secondary border-[#D0D8C3]/50 text-text-primary shadow-lg`;
    }
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
  };

  const Icon = icons[variant];

  const getIconColorClass = (variant) => {
    switch (variant) {
      case "info":
        return "text-text-primary";
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-text-primary";
    }
  };

  const getDismissButtonClasses = (variant) => {
    const baseClasses = "inline-flex items-center justify-center p-1 rounded-full transition-colors duration-200 hover:bg-opacity-20";

    switch (variant) {
      case "info":
        return `${baseClasses} text-[#014421] hover:bg-[#014421]`;
      case "success":
        return `${baseClasses} text-green-600 hover:bg-green-600`;
      case "warning":
        return `${baseClasses} text-yellow-600 hover:bg-yellow-600`;
      case "error":
        return `${baseClasses} text-red-600 hover:bg-red-600`;
      default:
        return `${baseClasses} text-[#014421] hover:bg-[#014421]`;
    }
  };

  return (
    <div className={`${getAlertClasses(variant)} ${className}`} role="alert">
      <Icon className={`w-6 h-6 ${getIconColorClass(variant)}`} />
      <div className="flex-1">{children}</div>
      {dismissible &&
      <button
        onClick={handleDismiss}
        className={getDismissButtonClasses(variant)}>
          <X className="w-4 h-4" />
        </button>
      }
    </div>);

}