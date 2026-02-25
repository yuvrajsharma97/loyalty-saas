import { forwardRef } from "react";

const BASE_CLASSES =
"select w-full h-10 px-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANT_CLASSES = {
  primary:
  "!border-[#014421] !text-[#014421] focus:!border-[#014421] focus:!ring-[#014421]/20 !bg-white",
  secondary:
  "!border-[#D0D8C3] !text-[#014421] focus:!border-[#014421] focus:!ring-[#014421]/20 !bg-white",
  success:
  "!border-green-300 !text-gray-900 focus:!border-green-500 focus:!ring-green-500/20 !bg-white",
  warning:
  "!border-yellow-300 !text-gray-900 focus:!border-yellow-500 focus:!ring-yellow-500/20 !bg-white",
  error:
  "!border-red-300 !text-gray-900 focus:!border-red-500 focus:!ring-red-500/20 !bg-white",
  info:
  "!border-blue-300 !text-gray-900 focus:!border-blue-500 focus:!ring-blue-500/20 !bg-white",
  default:
  "!border-gray-300 !text-[#014421] focus:!border-[#014421] focus:!ring-[#014421]/20 !bg-white"
};

const SIZE_CLASSES = {
  xs: "h-10 text-sm",
  sm: "h-10 text-sm",
  md: "h-10 text-sm",
  lg: "h-10 text-sm",
  xl: "h-10 text-sm"
};

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
  ref) =>
  {
    const customClasses = [
    BASE_CLASSES,
    bordered ? "select-bordered" : "border-0",
    VARIANT_CLASSES[variant] || VARIANT_CLASSES.default,
    SIZE_CLASSES[size] || SIZE_CLASSES.md,
    ghost && "bg-transparent border-transparent focus:bg-white",
    error &&
    "!border-red-500 focus:!border-red-500 focus:!ring-red-500/20",
    success &&
    "!border-green-500 focus:!border-green-500 focus:!ring-green-500/20"].
    filter(Boolean);

    const allClasses = [...customClasses, className].join(" ");

    return (
      <select ref={ref} className={allClasses} {...props}>
        {children}
      </select>);

  }
);

Select.displayName = "Select";

export default Select;