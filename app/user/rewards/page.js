"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Download, Gift } from "lucide-react";
import { useSearchParams } from "next/navigation";
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
import RedeemPointsModal from "@/components/user/RedeemPointsModal";
import { exportCsv } from "@/lib/exportCsv";
import { formatDate, formatCurrency } from "@/lib/formatters";

export default function UserRewards() {
  const {
    currentStore,
    setCurrentStore,
    connectedStores,
    getCurrentStoreData,
    refreshStores
  } = useUserStore();
  const searchParams = useSearchParams();


  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({});


  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const itemsPerPage = 10;
  const currentStoreData = getCurrentStoreData();

  const fetchRedemptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      if (currentStore) {
        params.append("storeId", currentStore);
      }

      const response = await fetch(`/api/user/redemptions?${params}`);
      const data = await response.json();

      if (data.success) {
        setRedemptions(data.data);
        setPaginationMeta(data.meta);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch redemptions');
      }
    } catch (err) {
      console.error('Error fetching redemptions:', err);
      setError('Failed to fetch redemption history');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentStore]);


  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);


  useEffect(() => {
    const storeFromQuery = searchParams.get("store");
    if (
    storeFromQuery &&
    currentStore !== storeFromQuery &&
    connectedStores.some((store) => store.id === storeFromQuery))
    {
      setCurrentStore(storeFromQuery);
    }
  }, [searchParams, connectedStores, currentStore, setCurrentStore]);


  useEffect(() => {
    setCurrentPage(1);
  }, [currentStore, searchQuery, dateFrom, dateTo]);


  const filteredRedemptions = useMemo(() => {
    return redemptions.filter((redemption) => {
      if (currentStore && redemption.storeId !== currentStore) return false;
      if (
      searchQuery &&
      !redemption.storeName.toLowerCase().includes(searchQuery.toLowerCase()))

      return false;

      if (dateFrom) {
        const redemptionDate = new Date(redemption.redemptionDate);
        const startDate = new Date(`${dateFrom}T00:00:00`);
        if (redemptionDate < startDate) return false;
      }

      if (dateTo) {
        const redemptionDate = new Date(redemption.redemptionDate);
        const endDate = new Date(`${dateTo}T23:59:59.999`);
        if (redemptionDate > endDate) return false;
      }

      return true;
    });
  }, [redemptions, currentStore, searchQuery, dateFrom, dateTo]);

  const totalPages = paginationMeta.totalPages || 1;

  const exportRedemptions = () => {
    const csvData = filteredRedemptions.map((redemption) => ({
      store: redemption.storeName,
      date: formatDate(redemption.redemptionDate),
      pointsUsed: redemption.pointsUsed,
      value: formatCurrency(redemption.rewardValueGBP),
      code: redemption.code,
      status: redemption.used ? "Used" : "Available",
      autoTriggered: redemption.autoTriggered ? "Yes" : "No"
    }));

    exportCsv(csvData, "my-redemptions.csv");
  };

  const handleRedemptionSuccess = () => {

    fetchRedemptions();

    refreshStores();

    setShowRedeemModal(false);
  };

  const redemptionColumns = [
  { key: "storeName", label: "Store", sortable: true },
  {
    key: "redemptionDate",
    label: "Date",
    sortable: true,
    render: (date) => formatDate(date)
  },
  { key: "pointsUsed", label: "Points Used", sortable: true },
  {
    key: "rewardValueGBP",
    label: "Value",
    sortable: true,
    render: (value) => formatCurrency(value)
  },
  {
    key: "code",
    label: "Code",
    render: (code, row) =>
    <div className="flex items-center gap-2">
          <span className={`font-mono text-sm px-2 py-1 rounded ${
      !row.used ?
      "bg-[#014421]/10 dark:bg-[#014421]/20 text-[#014421] dark:text-[#2e7d4a] border border-[#014421]/30 dark:border-[#014421]/40" :
      "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`
      }>
            {code}
          </span>
          {!row.used &&
      <span className="text-xs text-[#014421] dark:text-[#2e7d4a] font-medium">
              UNUSED
            </span>
      }
        </div>

  },
  {
    key: "used",
    label: "Status",
    render: (used, row) =>
    <Badge variant={used ? "secondary" : "success"}>
          {used ? "Used" : "Available"}
        </Badge>

  },
  {
    key: "autoTriggered",
    label: "Type",
    render: (auto) =>
    <Badge variant={auto ? "success" : "primary"}>
          {auto ? "Auto" : "Manual"}
        </Badge>

  }];


  const filters = [
  <div key="daterange" className="flex gap-2">
      <Input
      type="date"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
      placeholder="From date"
      className="w-full" />
    
      <Input
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      placeholder="To date"
      className="w-full" />
    
    </div>];


  const actions = [
  <Button key="export" variant="secondary" onClick={exportRedemptions}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>];


  const aggregatedPoints = connectedStores.reduce(
    (sum, store) => sum + (store.points || 0),
    0
  );
  const averageConversionRate =
  connectedStores.length > 0 ?
  connectedStores.reduce(
    (sum, store) => sum + (store.rewardConfig?.conversionRate || 100),
    0
  ) / connectedStores.length :
  100;

  const userPoints = currentStoreData ? currentStoreData.points || 0 : aggregatedPoints;
  const conversionRate = currentStoreData ?
  currentStoreData.rewardConfig?.conversionRate || 100 :
  averageConversionRate;
  const availableReward = Math.floor(userPoints / conversionRate);

  const tabs = [
  {
    label: "Points & Rewards",
    content:
    <div className="space-y-6">
          {}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PointsSummary
          points={userPoints}
          conversionRate={conversionRate}
          storeName={currentStoreData?.name} />
        
            <RewardProgress
          currentPoints={userPoints}
          conversionRate={conversionRate} />
        
          </div>

          {}
          {currentStoreData ?
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-[#D0D8C3]/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Redeem Rewards
                </h3>
                {availableReward > 0 &&
          <Badge variant="success">
                    £{availableReward} Available
                  </Badge>
          }
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Your Points:</span>
                    <span className="font-semibold">{userPoints} points</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Conversion Rate:</span>
                    <span className="font-semibold">{conversionRate} points = £1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Available to Redeem:</span>
                    <span className="font-semibold text-[#014421]">£{availableReward}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <Button
              onClick={() => setShowRedeemModal(true)}
              disabled={availableReward <= 0}
              className="w-full md:w-auto">
              
                    <Gift className="w-4 h-4 mr-2" />
                    {availableReward > 0 ? `Redeem £${availableReward}` : 'Insufficient Points'}
                  </Button>
                </div>
              </div>

              {availableReward <= 0 &&
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    You need at least {conversionRate} points to redeem £1.
                    You need {conversionRate - userPoints} more points.
                  </p>
                </div>
        }
            </div> :

      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-[#D0D8C3]/40">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select a Store to Redeem
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You are viewing combined rewards data across stores. Choose a specific
                store from the switcher to redeem points.
              </p>
            </div>
      }

          {}
          {currentStoreData ?
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-[#D0D8C3]/40">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Store Rules - {currentStoreData.name}
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
            </div> :

      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-[#D0D8C3]/40">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Combined Store Rules
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rules differ per store. Select a store above to view exact reward
                configuration.
              </p>
            </div>
      }
        </div>

  },
  {
    label: "Redemption History",
    content:
    <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Your Redemption History:</strong> All your reward redemptions are listed below.
              Show the 8-digit code to store staff to claim your reward.
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
              💡 <strong>Unused codes</strong> are highlighted in green and remain valid until used at the store.
            </p>
          </div>

          <TableToolbar
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        filters={filters}
        actions={actions} />
      

          {loading ?
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md animate-pulse">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) =>
          <div key={i} className="flex space-x-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
          )}
              </div>
            </div> :
      error ?
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">Error: {error}</p>
            </div> :

      <>
              <Table columns={redemptionColumns} data={filteredRedemptions} />

              {totalPages > 1 &&
        <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, paginationMeta.total || 0)} of {paginationMeta.total || 0} redemptions
                    </div>
                    <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage} />
            
                  </div>
                </div>
        }
            </>
      }
        </div>

  }];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Rewards
        </h1>
        <StoreSwitcher
          stores={connectedStores}
          currentStore={currentStore}
          onStoreChange={setCurrentStore} />
        
      </div>

      <Tabs tabs={tabs} />

      {}
      {currentStoreData &&
      <RedeemPointsModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        store={currentStoreData}
        userPoints={userPoints}
        onRedemptionSuccess={handleRedemptionSuccess} />

      }
    </div>);

}