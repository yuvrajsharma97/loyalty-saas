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
      className = "",
      ...props
    },
    ref
  ) => {
    // Custom variant styling with our brand colors
    const getVariantClasses = (variant) => {
      const baseSelectStyles = "w-full px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 border bg-white";

      switch (variant) {
        case "primary":
          return `${baseSelectStyles} border-[#014421] text-[#014421] focus:border-[#014421] focus:ring-[#014421]/20`;
        case "secondary":
          return `${baseSelectStyles} border-[#D0D8C3] text-[#014421] focus:border-[#014421] focus:ring-[#014421]/20`;
        case "success":
          return `${baseSelectStyles} border-green-300 text-gray-900 focus:border-green-500 focus:ring-green-500/20`;
        case "warning":
          return `${baseSelectStyles} border-yellow-300 text-gray-900 focus:border-yellow-500 focus:ring-yellow-500/20`;
        case "error":
          return `${baseSelectStyles} border-red-300 text-gray-900 focus:border-red-500 focus:ring-red-500/20`;
        case "info":
          return `${baseSelectStyles} border-blue-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20`;
        default:
          return `${baseSelectStyles} border-gray-300 text-[#014421] focus:border-[#014421] focus:ring-[#014421]/20`;
      }
    };

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

    // Build custom classes
    const customClasses = [
      getVariantClasses(variant),
      getSizeClasses(size),
      !bordered && "border-0",
      ghost && "bg-transparent border-transparent focus:bg-white",
      error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      success && "border-green-500 focus:border-green-500 focus:ring-green-500/20",
    ].filter(Boolean);

    const allClasses = [...customClasses, className].join(" ");

    return (
      <select ref={ref} className={allClasses} {...props}>
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export default Select;
