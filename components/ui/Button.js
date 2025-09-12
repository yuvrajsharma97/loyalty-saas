import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import Link from "next/link";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      outline = false,
      ghost = false,
      glass = false,
      wide = false,
      block = false,
      square = false,
      circle = false,
      loading = false,
      disabled = false,
      active = false,
      className = "",
      onClick,
      type = "button",
      href,
      ...props
    },
    ref
  ) => {
    // Base DaisyUI button class
    const baseClasses = "btn";

    // Map our variants to DaisyUI variants while preserving custom ones
    const variantMap = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      neutral: "btn-neutral",
      success: "btn-success",
      warning: "btn-warning",
      error: "btn-error",
      info: "btn-info",
      // Keep custom ghost behavior
      ghost: "btn-ghost",
    };

    // Size mapping to DaisyUI
    const sizeMap = {
      xs: "btn-xs",
      sm: "btn-sm",
      md: "", // default size
      lg: "btn-lg",
      xl: "btn-lg", // DaisyUI doesn't have xl, use lg
    };

    // Build DaisyUI classes
    const daisyClasses = [
      baseClasses,
      variantMap[variant] || "btn-primary",
      sizeMap[size],
      outline && "btn-outline",
      ghost && "btn-ghost",
      glass && "glass",
      wide && "btn-wide",
      block && "btn-block",
      square && "btn-square",
      circle && "btn-circle",
      loading && "loading",
      disabled && "btn-disabled",
      active && "btn-active",
    ].filter(Boolean);

    // Add custom classes for your brand styling
    const customClasses = [
      // Your custom shadow and transition enhancements
      "shadow-md hover:shadow-lg transition-all duration-200",
      // Ensure proper focus states
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      variant === "primary" && "bg-[#014421] hover:bg-[#014421]/90 border-[#014421] text-white focus:ring-[#014421]/50",
      variant === "secondary" && "bg-[#D0D8C3] hover:bg-[#D0D8C3]/90 border-[#D0D8C3] text-[#014421] focus:ring-[#D0D8C3]/50",
      variant === "outline" && "border-2 border-[#014421] text-[#014421] hover:bg-[#014421] hover:text-white",
      variant === "ghost" && "text-[#014421] hover:bg-[#D0D8C3]/20",
    ].filter(Boolean);

    const allClasses = [...daisyClasses, ...customClasses, className].join(" ");

    const content = (
      <>
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {children}
      </>
    );

    if (href) {
      return (
        <Link
          ref={ref}
          href={href}
          className={allClasses}
          onClick={onClick}
          {...props}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={allClasses}
        {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
