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
    // Base DaisyUI select class
    const baseClasses = "select";

    // Variant mapping
    const variantMap = {
      default: "select-bordered",
      primary: "select-primary",
      secondary: "select-secondary",
      accent: "select-accent",
      success: "select-success",
      warning: "select-warning",
      error: "select-error",
      info: "select-info",
    };

    // Size mapping
    const sizeMap = {
      xs: "select-xs",
      sm: "select-sm",
      md: "", // default
      lg: "select-lg",
      xl: "select-lg",
    };

    const daisyClasses = [
      baseClasses,
      !ghost && (bordered ? "select-bordered" : ""),
      ghost && "select-ghost",
      variantMap[variant],
      sizeMap[size],
      error && "select-error",
      success && "select-success",
    ].filter(Boolean);

    // Custom theme styling with glassmorphism
    const customClasses = [
      "glass bg-gradient-to-br from-primary/5 via-secondary/5 to-base-100/40 backdrop-blur-sm",
      "focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-primary",
      "transition-all duration-300 shadow-md text-white",
      variant === "primary" && "border-primary/30",
      variant === "secondary" && "border-secondary/30",
      variant === "error" &&
        "border-error focus:ring-error/50 focus:border-error",
      !error && !success && "border-secondary/30",
    ].filter(Boolean);

    const allClasses = [...daisyClasses, ...customClasses, className].join(" ");

    return (
      <div className="relative">
        <select ref={ref} className={allClasses} {...props}>
          {children}
        </select>
        <style jsx>{`
          select {
            color-scheme: dark;
            background-color: #111827 !important;
          }
        `}</style>
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
