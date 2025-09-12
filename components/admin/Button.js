import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-[#014421] text-white hover:opacity-90 focus:ring-[#014421] shadow-md hover:shadow-lg disabled:opacity-50",
    secondary:
      "border border-[#D0D8C3]/40 bg-[#D0D8C3]/10 text-[#014421] dark:bg-[#D0D8C3]/5 dark:text-[#D0D8C3] hover:bg-[#D0D8C3]/20 focus:ring-[#D0D8C3]",
    ghost:
      "text-gray-600 dark:text-gray-400 hover:text-[#014421] dark:hover:text-[#D0D8C3] hover:bg-gray-100 dark:hover:bg-zinc-700",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}>
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
