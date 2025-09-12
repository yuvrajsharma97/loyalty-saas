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
      className={`glass bg-gradient-to-br from-primary/10 via-secondary/5 to-base-100/40 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary/80 dark:text-gray-300">
            {title}
          </p>
          <p className="text-2xl font-bold text-primary dark:text-white mt-1 drop-shadow-sm">
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${trendColors[trend]} drop-shadow-sm`}>{change}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-gradient-to-br from-secondary/30 via-secondary/20 to-primary/10 dark:from-primary/30 dark:to-primary/10 rounded-lg shadow-md">
            <Icon className="w-6 h-6 text-primary dark:text-secondary drop-shadow-sm" />
          </div>
        )}
      </div>
    </div>
  );
}
