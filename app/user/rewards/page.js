"use client";
import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { useUserStore } from "../layout";
import Tabs from "@/components/ui/Tabs";
import Table from "@/components/ui/Table";
import TableToolbar from "@/components/ui/TableToolbar";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import StoreSwitcher from "@/components/user/StoreSwitcher";
import PointsSummary from "@/components/user/PointsSummary";
import RewardProgress from "@/components/user/RewardProgress";
import { exportCsv } from "@/lib/exportCsv";
import { formatDate, formatCurrency } from "@/lib/formatters";

export default function UserRewards() {
  const {
    currentStore,
    setCurrentStore,
    connectedStores,
    getCurrentStoreData,
  } = useUserStore();
  const [redemptions] = useState(MOCK_REDEMPTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const currentStoreData = getCurrentStoreData();

  // Filter redemptions based on current store
  const filteredRedemptions = useMemo(() => {
    return redemptions.filter((redemption) => {
      if (currentStore && redemption.storeId !== currentStore) return false;
      if (
        searchQuery &&
        !redemption.storeName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (dateFrom && redemption.date < dateFrom) return false;
      if (dateTo && redemption.date > dateTo) return false;
      return true;
    });
  }, [redemptions, currentStore, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredRedemptions.length / itemsPerPage);
  const paginatedRedemptions = filteredRedemptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportRedemptions = () => {
    const csvData = filteredRedemptions.map((redemption) => ({
      store: redemption.storeName,
      date: formatDate(redemption.date),
      pointsUsed: redemption.pointsUsed,
      value: formatCurrency(redemption.value),
      autoTriggered: redemption.autoTriggered ? "Yes" : "No",
    }));

    exportCsv(csvData, "my-redemptions.csv");
  };

  const redemptionColumns = [
    { key: "storeName", label: "Store", sortable: true },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (date) => formatDate(date),
    },
    { key: "pointsUsed", label: "Points Used", sortable: true },
    {
      key: "value",
      label: "Value",
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      key: "autoTriggered",
      label: "Auto Triggered",
      render: (auto) => (
        <Badge variant={auto ? "success" : "default"}>
          {auto ? "Yes" : "No"}
        </Badge>
      ),
    },
  ];

  const filters = [
    <div key="daterange" className="flex gap-2">
      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        placeholder="From date"
        className="w-full"
      />
      <Input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        placeholder="To date"
        className="w-full"
      />
    </div>,
  ];

  const actions = [
    <Button key="export" variant="secondary" onClick={exportRedemptions}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>,
  ];

  const tabs = [
    {
      label: "Points",
      content: (
        <div className="space-y-6">
          {/* Points Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PointsSummary
              points={
                currentStoreData?.points ||
                connectedStores.reduce((sum, store) => sum + store.points, 0)
              }
              conversionRate={currentStoreData?.conversionRate || 100}
              storeName={currentStoreData?.name}
            />
            <RewardProgress
              currentPoints={
                currentStoreData?.points ||
                connectedStores.reduce((sum, store) => sum + store.points, 0)
              }
              conversionRate={currentStoreData?.conversionRate || 100}
            />
          </div>

          {/* Store Rules */}
          {currentStoreData && (
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-[#D0D8C3]/40">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Store Rules - {currentStoreData.name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Type
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {currentStoreData.rewardConfig.type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Points per £
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentStoreData.rewardConfig.pointsPerPound}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Points per Visit
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentStoreData.rewardConfig.pointsPerVisit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Conversion
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentStoreData.rewardConfig.conversionRate} points = £1
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Redemptions",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Redemptions are automatic when your points
              reach the threshold. You'll be notified when rewards are applied.
            </p>
          </div>

          <TableToolbar
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            filters={filters}
            actions={actions}
          />

          <Table columns={redemptionColumns} data={paginatedRedemptions} />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Rewards
        </h1>
        <div className="sm:hidden">
          <StoreSwitcher
            stores={connectedStores}
            currentStore={currentStore}
            onStoreChange={setCurrentStore}
          />
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
