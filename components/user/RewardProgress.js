export default function RewardProgress({
  currentPoints,
  conversionRate = 100,
  className = ""
}) {
  const pointsToNext = conversionRate - currentPoints % conversionRate;
  const progress = currentPoints % conversionRate / conversionRate * 100;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-[#D0D8C3] dark:border-gray-700 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Progress to Next Reward
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {pointsToNext} points until your next £1 reward
        </p>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#014421] to-[#D0D8C3] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{currentPoints % conversionRate} points</span>
          <span>{conversionRate} points</span>
        </div>
      </div>
    </div>);

}