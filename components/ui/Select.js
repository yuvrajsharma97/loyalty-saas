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
      const baseSelectStyles =
        "select w-full";

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
          return "select-xs";
        case "sm":
          return "select-sm";
        case "md":
          return "select-md";
        case "lg":
          return "select-lg";
        case "xl":
          return "select-xl";
        default:
          return "select-md";
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
