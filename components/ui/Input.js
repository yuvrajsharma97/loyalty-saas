import { forwardRef } from "react";

const Input = forwardRef(
  (
  {
    type = "text",
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

    const getVariantClasses = (variant) => {
      const baseInputStyles =
      "w-full h-10 px-3 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2";

      switch (variant) {
        case "primary":
          return `${baseInputStyles} border-[#014421] text-[#014421] focus:border-[#014421] focus:ring-[#014421]/20 bg-white`;
        case "secondary":
          return `${baseInputStyles} border-[#D0D8C3] text-[#014421] focus:border-[#014421] focus:ring-[#014421]/20 bg-white`;
        case "success":
          return `${baseInputStyles} border-green-300 text-gray-900 focus:border-green-500 focus:ring-green-500/20 bg-white`;
        case "warning":
          return `${baseInputStyles} border-yellow-300 text-gray-900 focus:border-yellow-500 focus:ring-yellow-500/20 bg-white`;
        case "error":
          return `${baseInputStyles} border-red-300 text-gray-900 focus:border-red-500 focus:ring-red-500/20 bg-white`;
        case "info":
          return `${baseInputStyles} border-blue-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 bg-white`;
        default:
          return `${baseInputStyles} border-gray-300 text-[#014421] focus:border-[#014421] focus:ring-[#014421]/20 bg-white`;
      }
    };


    const getSizeClasses = () => "h-10 text-sm";


    const customClasses = [
    getVariantClasses(variant),
    getSizeClasses(size),
    !bordered && "border-0",
    ghost && "bg-transparent border-transparent focus:bg-white",
    error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
    success && "border-green-500 focus:border-green-500 focus:ring-green-500/20"].
    filter(Boolean);

    const allClasses = [...customClasses, className].join(" ");

    const dateClasses =
    type === "date" ?
    "input input-bordered h-10 px-3 text-sm border-[#D0D8C3] bg-white text-[#014421] focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20" :
    "";

    return (
      <input
        ref={ref}
        type={type}
        className={[allClasses, dateClasses].filter(Boolean).join(" ")}
        {...props} />);


  }
);

Input.displayName = "Input";

export default Input;