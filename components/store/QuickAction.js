export default function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
  variant = "default",
  className = "",
}) {
  const variants = {
    default:
      "bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700",
    primary:
      "bg-[#014421]/5 dark:bg-[#014421]/10 hover:bg-[#014421]/10 dark:hover:bg-[#014421]/20 border-[#014421]/20",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border border-[#D0D8C3]/40 dark:border-zinc-600 transition-all text-left w-full ${variants[variant]} ${className}`}>
      <div className="flex items-start space-x-3">
        <div
          className={`p-2 rounded-lg ${
            variant === "primary"
              ? "bg-[#014421]/10 dark:bg-[#014421]/20"
              : variant === "warning"
              ? "bg-yellow-100 dark:bg-yellow-800/20"
              : "bg-gray-100 dark:bg-zinc-700"
          }`}>
          <Icon
            className={`w-5 h-5 ${
              variant === "primary"
                ? "text-[#014421] dark:text-[#D0D8C3]"
                : variant === "warning"
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
