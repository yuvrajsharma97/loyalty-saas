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
  ref) =>
  {

    const baseClasses = "btn";


    const getVariantClasses = (variant) => {
      const baseButtonStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border";

      switch (variant) {
        case "primary":
          return `${baseButtonStyles} bg-[#014421] hover:bg-[#012f18] border-[#014421] text-white focus:ring-[#014421]/50 shadow-md hover:shadow-lg font-medium`;
        case "secondary":
          return `${baseButtonStyles} bg-[#D0D8C3] hover:bg-[#c4ceb5] border-[#D0D8C3] text-[#014421] focus:ring-[#D0D8C3]/50 shadow-md hover:shadow-lg font-medium`;
        case "success":
          return `${baseButtonStyles} bg-green-600 hover:bg-green-700 border-green-600 text-white focus:ring-green-500/50 shadow-md hover:shadow-lg font-medium`;
        case "warning":
          return `${baseButtonStyles} bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-white focus:ring-yellow-500/50 shadow-md hover:shadow-lg font-medium`;
        case "error":
          return `${baseButtonStyles} bg-red-600 hover:bg-red-700 border-red-600 text-white focus:ring-red-500/50 shadow-md hover:shadow-lg font-medium`;
        case "info":
          return `${baseButtonStyles} bg-blue-600 hover:bg-blue-700 border-blue-600 text-white focus:ring-blue-500/50 shadow-md hover:shadow-lg font-medium`;
        case "outline":
          return `${baseButtonStyles} bg-transparent hover:bg-[#014421] border-[#014421] text-[#014421] hover:text-white focus:ring-[#014421]/50 font-medium`;
        case "ghost":
          return `${baseButtonStyles} bg-transparent hover:bg-[#D0D8C3]/20 border-transparent text-[#014421] focus:ring-[#014421]/30 font-medium`;
        default:
          return `${baseButtonStyles} bg-[#014421] hover:bg-[#012f18] border-[#014421] text-white focus:ring-[#014421]/50 shadow-md hover:shadow-lg font-medium`;
      }
    };


    const getSizeClasses = (size) => {
      switch (size) {
        case "xs":
          return "px-2 py-1 text-xs";
        case "sm":
          return "px-3 py-1.5 text-sm";
        case "md":
          return "px-4 py-2 text-sm";
        case "lg":
          return "px-6 py-3 text-base";
        case "xl":
          return "px-8 py-4 text-lg";
        default:
          return "px-4 py-2 text-sm";
      }
    };


    const customClasses = [
    getVariantClasses(variant),
    getSizeClasses(size),
    wide && "w-full",
    block && "w-full",
    square && "aspect-square p-0",
    circle && "rounded-full aspect-square p-0",
    glass && "backdrop-blur-sm bg-opacity-80",
    loading && "opacity-75 cursor-not-allowed",
    disabled && "opacity-50 cursor-not-allowed",
    active && "scale-95"].
    filter(Boolean);

    const allClasses = [...customClasses, className].join(" ");

    const content =
    <>
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {children}
      </>;


    if (href) {
      return (
        <Link
          ref={ref}
          href={href}
          className={allClasses}
          onClick={onClick}
          {...props}>
          {content}
        </Link>);

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
      </button>);

  }
);

Button.displayName = "Button";

export default Button;