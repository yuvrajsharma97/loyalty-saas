"use client";
import { useState, useMemo } from "react";
import { Download, FileText } from "lucide-react";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Banner from "@/components/ui/Banner";
import EmptyState from "@/components/ui/EmptyState";
import { exportCsv } from "@/lib/exportCsv";
import { formatDate, formatCurrency } from "@/lib/formatters";

export default function StoreReports() {
  const [dateRange, setDateRange] = useState("30");
  const [dataset, setDataset] = useState("visits");
  const [currentPage, setCurrentPage] = useState(1);
  const [successBanner, setSuccessBanner] = useState("");

  const itemsPerPage = 10;

  // Generate monthly summary data
  const monthlyData = useMemo(() => {
    const months = [
      {
        month: "March 2024",
        totalVisits: 47,
        totalPoints: 1420,
        totalRedemptions: 8,
        activeUsers: 32,
      },
      {
        month: "February 2024",
        totalVisits: 52,
        totalPoints: 1680,
        totalRedemptions: 12,
        activeUsers: 28,
      },
      {
        month: "January 2024",
        totalVisits: 38,
        totalPoints: 1140,
        totalRedemptions: 6,
        activeUsers: 25,
      },
    ];
    return months;
  }, []);

  const getCurrentData = () => {
    switch (dataset) {
      case "visits":
        return MOCK_VISITS_HISTORY.map((visit) => ({
          ...visit,
          date: formatDate(visit.date),
          spendAmount: formatCurrency(visit.spendAmount),
          method: visit.method.toUpperCase(),
        }));
      case "rewards":
        return MOCK_REDEMPTIONS.map((reward) => ({
          ...reward,
          date: formatDate(reward.date),
          value: formatCurrency(reward.value),
          autoTriggered: reward.autoTriggered ? "Yes" : "No",
        }));
      case "monthly":
        return monthlyData;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getColumns = () => {
    switch (dataset) {
      case "visits":
        return [
          { key: "userName", label: "User", sortable: true },
          { key: "date", label: "Date", sortable: true },
          { key: "method", label: "Method", sortable: true },
          { key: "status", label: "Status", sortable: true },
          { key: "pointsEarned", label: "Points", sortable: true },
          { key: "spendAmount", label: "Spend", sortable: true },
        ];
      case "rewards":
        return [
          { key: "userName", label: "User", sortable: true },
          { key: "date", label: "Date", sortable: true },
          { key: "pointsUsed", label: "Points Used", sortable: true },
          { key: "value", label: "Value", sortable: true },
          { key: "autoTriggered", label: "Auto Triggered", sortable: true },
        ];
      case "monthly":
        return [
          { key: "month", label: "Month", sortable: true },
          { key: "totalVisits", label: "Total Visits", sortable: true },
          { key: "totalPoints", label: "Total Points", sortable: true },
          {
            key: "totalRedemptions",
            label: "Total Redemptions",
            sortable: true,
          },
          { key: "activeUsers", label: "Active Users", sortable: true },
        ];
      default:
        return [];
    }
  };

  const exportData = () => {
    const filename = `${dataset}-report-${dateRange}days.csv`;
    exportCsv(currentData, filename);
    setSuccessBanner(
      `${
        dataset.charAt(0).toUpperCase() + dataset.slice(1)
      } report exported successfully.`
    );
  };

  const exportPDF = () => {
    setSuccessBanner("PDF export coming soon - feature in development.");
  };

  return (
    <div className="space-y-6">
      {successBanner && (
        <Banner
          type="success"
          message={successBanner}
          onDismiss={() => setSuccessBanner("")}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Reports
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dataset
            </label>
            <Select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}>
              <option value="visits">Visits</option>
              <option value="rewards">Rewards</option>
              <option value="monthly">Monthly Summary</option>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={exportData} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="secondary" onClick={exportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md">
        {currentData.length > 0 ? (
          <>
            <Table columns={getColumns()} data={paginatedData} />
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-200 dark:border-zinc-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No data available"
            description="No data found for the selected date range and dataset."
          />
        )}
      </div>
    </div>
  );
}
