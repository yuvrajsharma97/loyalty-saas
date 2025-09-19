import { forwardRef } from "react";

const Select = forwardRef(
  (
    {
      children,
      variant = "default",
      size = "md",
      bordered = true,
      ghost = false,
      error,
      success,
      placeholder,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    // Custom size styling
    const getSizeClasses = (size) => {
      switch (size) {
        case "xs":
          return "px-2 py-1 text-xs";
        case "sm":
          return "px-2.5 py-1.5 text-sm";
        case "md":
          return "px-3 py-2 text-sm";
        case "lg":
          return "px-4 py-3 text-base";
        case "xl":
          return "px-5 py-4 text-lg";
        default:
          return "px-3 py-2 text-sm";
      }
    };

    // Base glassmorphism styling with brand colors
    const baseClasses = [
      "w-full rounded-lg transition-all duration-300 focus:outline-none",
      "glass backdrop-blur-md shadow-xl border border-white/10",
      "bg-gradient-to-br from-[#014421]/15 via-[#D0D8C3]/10 to-[#014421]/5",
      "text-[#D0D8C3] focus:ring-2 focus:ring-[#D0D8C3]/50 focus:border-[#014421]",
      getSizeClasses(size),
      disabled && "opacity-50 cursor-not-allowed",
      error && "border-red-500/30 focus:ring-red-500/50 focus:border-red-500",
      success && "border-green-500/30 focus:ring-green-500/50 focus:border-green-500",
    ].filter(Boolean);

    const allClasses = [...baseClasses, className].join(" ");

    return (
      <div className="relative">
        <select ref={ref} className={allClasses} disabled={disabled} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
