export default function Badge({
  children,
  variant = "default",
  size = "md",
  outline = false,
  className = ""
}) {

  const getVariantClasses = (variant, outline) => {
    const baseBadgeStyles = "inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full transition-all duration-200";

    if (outline) {
      switch (variant) {
        case "primary":
          return `${baseBadgeStyles} border border-[#014421] text-[#014421] bg-transparent hover:bg-[#014421] hover:text-white`;
        case "secondary":
          return `${baseBadgeStyles} border border-[#D0D8C3] text-[#014421] bg-transparent hover:bg-[#D0D8C3] hover:text-[#014421]`;
        case "success":
          return `${baseBadgeStyles} border border-green-500 text-green-700 bg-transparent hover:bg-green-500 hover:text-white`;
        case "warning":
          return `${baseBadgeStyles} border border-yellow-500 text-yellow-700 bg-transparent hover:bg-yellow-500 hover:text-white`;
        case "error":
          return `${baseBadgeStyles} border border-red-500 text-red-700 bg-transparent hover:bg-red-500 hover:text-white`;
        case "info":
          return `${baseBadgeStyles} border border-blue-500 text-blue-700 bg-transparent hover:bg-blue-500 hover:text-white`;
        default:
          return `${baseBadgeStyles} border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-400 hover:text-white`;
      }
    } else {
      switch (variant) {
        case "primary":
          return `${baseBadgeStyles} bg-gradient-to-r from-[#014421] to-[#012f18] text-white shadow-md backdrop-blur-sm border border-white/20`;
        case "secondary":
          return `${baseBadgeStyles} bg-gradient-to-r from-[#D0D8C3] via-[#D0D8C3]/90 to-[#c4ceb5] text-[#014421] shadow-md backdrop-blur-sm border border-[#014421]/20`;
        case "success":
          return `${baseBadgeStyles} bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md backdrop-blur-sm border border-white/20`;
        case "warning":
          return `${baseBadgeStyles} bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md backdrop-blur-sm border border-white/20`;
        case "error":
          return `${baseBadgeStyles} bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md backdrop-blur-sm border border-white/20`;
        case "info":
          return `${baseBadgeStyles} bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md backdrop-blur-sm border border-white/20`;

        case "silver":
          return `${baseBadgeStyles} bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100 text-gray-800 shadow-md backdrop-blur-sm border border-gray-400/20`;
        case "gold":
          return `${baseBadgeStyles} bg-gradient-to-r from-[#D0D8C3] via-[#D0D8C3]/80 to-[#014421]/20 text-[#014421] shadow-lg backdrop-blur-sm border border-[#014421]/30 font-semibold`;
        case "platinum":
          return `${baseBadgeStyles} bg-gradient-to-r from-[#014421] via-[#014421]/90 to-[#012f18] text-white shadow-lg backdrop-blur-sm border border-white/30 font-semibold`;
        default:
          return `${baseBadgeStyles} bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md backdrop-blur-sm border border-white/10`;
      }
    }
  };


  const getSizeClasses = (size) => {
    switch (size) {
      case "xs":
        return "px-1.5 py-0.5 text-xs";
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "md":
        return "px-2.5 py-1 text-xs";
      case "lg":
        return "px-3 py-1.5 text-sm";
      case "xl":
        return "px-4 py-2 text-sm";
      default:
        return "px-2.5 py-1 text-xs";
    }
  };


  const customClasses = [
  getVariantClasses(variant, outline),
  getSizeClasses(size)].
  filter(Boolean);

  const allClasses = [...customClasses, className].join(" ");

  return <span className={allClasses}>{children}</span>;
}