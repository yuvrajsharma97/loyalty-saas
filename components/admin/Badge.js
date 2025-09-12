export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    primary:
      "bg-[#014421]/10 text-[#014421] dark:bg-[#014421]/20 dark:text-[#D0D8C3]",
    success:
      "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
    silver: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400",
    platinum:
      "bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
