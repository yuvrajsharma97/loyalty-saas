import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
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
    // Base DaisyUI input class
    const baseClasses = "input w-full text-primary";

    // Variant mapping
    const variantMap = {
      default: "input-bordered",
      primary: "input-primary",
      secondary: "input-secondary",
      accent: "input-accent",
      success: "input-success",
      warning: "input-warning",
      error: "input-error",
      info: "input-info",
    };

    // Size mapping
    const sizeMap = {
      xs: "input-xs",
      sm: "input-sm",
      md: "", // default
      lg: "input-lg",
      xl: "input-lg",
    };

    const daisyClasses = [
      baseClasses,
      !ghost && (bordered ? "input-bordered" : ""),
      ghost && "input-ghost",
      variantMap[variant],
      sizeMap[size],
      error && "input-error",
      success && "input-success",
    ].filter(Boolean);

    // Custom focus enhancement with theme colors
    const customClasses = [
      "focus:outline-none", 
      "transition-all duration-200",
      "focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20",
      variant === "primary" && "border-[#014421] focus:border-[#014421]",
      variant === "secondary" && "border-[#D0D8C3] focus:border-[#014421]",
    ];

    const allClasses = [...daisyClasses, ...customClasses, className].join(" ");

    return <input ref={ref} className={allClasses} {...props} />;
  }
);

Input.displayName = "Input";

export default Input;
