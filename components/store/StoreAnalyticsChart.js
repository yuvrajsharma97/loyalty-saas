"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Calendar } from "lucide-react";

export default function StoreAnalyticsChart({ className = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/store/analytics/visits?period=${period}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error("Store analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const periods = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "1y", label: "1 Year" },
  ];

  if (loading) {
    return (
      <div className={`bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Store Visit Analytics
          </h3>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-24 rounded"></div>
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Store Visit Analytics
        </h3>
        <div className="h-64 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...(data?.data || [1]), 1);
  const chartHeight = 200;

  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#014421]/10 dark:bg-[#014421]/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#014421] dark:text-[#D0D8C3]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Store Visit Analytics
          </h3>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#014421] focus:border-transparent"
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#014421] dark:text-[#D0D8C3]">
                {data.totalVisits || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Visits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#014421] dark:text-[#D0D8C3]">
                {period === "1y"
                  ? data.averagePerMonth?.toFixed(1) || "0"
                  : data.averagePerDay?.toFixed(1) || "0"
                }
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg per {period === "1y" ? "Month" : "Day"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#014421] dark:text-[#D0D8C3]">
                {Math.max(...(data.data || [0])) || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Peak</p>
            </div>
          </div>

          <div className="relative">
            <div
              className="flex items-end justify-between gap-1 px-2"
              style={{ height: chartHeight }}
            >
              {(data.data || []).map((value, index) => {
                const height = maxValue > 0 ? (value / maxValue) * (chartHeight - 20) : 0;
                return (
                  <div
                    key={index}
                    className="flex-1 relative group cursor-pointer"
                  >
                    <div
                      className="bg-[#014421] dark:bg-[#D0D8C3] rounded-t transition-all hover:opacity-80"
                      style={{
                        height: Math.max(height, value > 0 ? 4 : 0),
                        minHeight: value > 0 ? "4px" : "0"
                      }}
                    />

                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {data.labels?.[index] || index}: {value} visits
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-2">
              <span>{data.labels?.[0] || ""}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {period}
              </span>
              <span>{data.labels?.[data.labels?.length - 1] || ""}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}