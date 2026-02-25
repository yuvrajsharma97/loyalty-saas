import { Coins, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function PointsSummary({
  points,
  conversionRate = 100,
  storeName,
  className = ""
}) {
  const redeemableValue = points / conversionRate;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-[#D0D8C3] dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Points Balance
        </h3>
        <div className="p-2 bg-[#D0D8C3]/20 dark:bg-[#014421]/20 rounded-lg">
          <Coins className="w-5 h-5 text-[#014421] dark:text-[#D0D8C3]" />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-3xl font-bold text-[#014421] dark:text-[#D0D8C3]">
            {points.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {storeName ? `at ${storeName}` : "total points"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Worth {formatCurrency(redeemableValue)}
          </span>
        </div>

        <div className="pt-2 border-t border-[#D0D8C3] dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {conversionRate} points = £1
          </p>
        </div>
      </div>
    </div>);

}