export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  className = "",
}) {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  return (
    <div
      className={`glass backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10 bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5 hover:shadow-2xl hover:shadow-secondary/20 transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#014421] dark:text-white mt-1 drop-shadow-sm">
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${trendColors[trend]} drop-shadow-sm`}>{change}</p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-[#D0D8C3] dark:bg-[#014421] rounded-lg flex items-center justify-center shadow-md border border-[#014421]/20 dark:border-[#D0D8C3]/30">
            <Icon className="w-6 h-6 text-[#014421] dark:text-[#D0D8C3] drop-shadow-sm" />
          </div>
        )}
      </div>
    </div>
  );
}
