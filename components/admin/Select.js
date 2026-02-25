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
  ref) =>
  {

    const getSizeClasses = () => "h-10 px-3 text-sm";


    const baseClasses = [
    "w-full rounded-lg transition-all duration-300 focus:outline-none",
    "glass backdrop-blur-md shadow-xl border border-white/10",
    "bg-gradient-to-br from-[#014421]/15 via-[#D0D8C3]/10 to-[#014421]/5",
    "text-[#D0D8C3] focus:ring-2 focus:ring-[#D0D8C3]/50 focus:border-[#014421]",
    getSizeClasses(size),
    disabled && "opacity-50 cursor-not-allowed",
    error && "border-red-500/30 focus:ring-red-500/50 focus:border-red-500",
    success && "border-green-500/30 focus:ring-green-500/50 focus:border-green-500"].
    filter(Boolean);

    const allClasses = [...baseClasses, className].join(" ");

    return (
      <div className="relative">
        <select ref={ref} className={allClasses} disabled={disabled} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      </div>);

  }
);

Select.displayName = "Select";

export default Select;