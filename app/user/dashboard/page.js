"use client";
import { useState, useEffect } from "react";
import {
  MapPin,
  QrCode,
  Gift,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useUserStore } from "../layout";
import StatCard from "@/components/admin/StatCard";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import StoreSwitcher from "@/components/user/StoreSwitcher";
import PointsSummary from "@/components/user/PointsSummary";
import RewardProgress from "@/components/user/RewardProgress";
import QRScanHint from "@/components/user/QRScanHint";
import VisitAnalyticsChart from "@/components/user/VisitAnalyticsChart";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const {
    currentStore,
    setCurrentStore,
    connectedStores,
    getCurrentStoreData,
    loading: storesLoading,
  } = useUserStore();
  const [showQRHint, setShowQRHint] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  // Fetch dashboard metrics
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (currentStore) {
        params.append("storeId", currentStore);
      }

      const response = await fetch(`/api/user/dashboard/metrics?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentStore]);

  const currentStoreData = getCurrentStoreData();

  // Calculate metrics based on current store
  const getMetrics = () => {
    // Use real data if available
    if (dashboardData && !loading) {
      return {
        currentPoints: dashboardData.currentPoints,
        redeemableValue: dashboardData.redeemableValue,
        visitsMTD: dashboardData.visitsMTD,
        visitsLifetime: dashboardData.visitsLifetime,
      };
    }

    // Use store data from API
    if (currentStore && currentStoreData) {
      return {
        currentPoints: currentStoreData.points,
        redeemableValue:
          currentStoreData.points / currentStoreData.conversionRate,
        visitsMTD: currentStoreData.visitsMTD,
        visitsLifetime: currentStoreData.visitsLifetime,
      };
    } else if (connectedStores.length > 0) {
      // All stores combined
      const totalPoints = connectedStores.reduce(
        (sum, store) => sum + store.points,
        0
      );
      const totalVisitsMTD = connectedStores.reduce(
        (sum, store) => sum + store.visitsMTD,
        0
      );
      const totalVisitsLifetime = connectedStores.reduce(
        (sum, store) => sum + store.visitsLifetime,
        0
      );
      const avgConversionRate =
        connectedStores.reduce((sum, store) => sum + store.conversionRate, 0) /
        connectedStores.length || 100;

      return {
        currentPoints: totalPoints,
        redeemableValue: totalPoints / avgConversionRate,
        visitsMTD: totalVisitsMTD,
        visitsLifetime: totalVisitsLifetime,
      };
    } else {
      // No connected stores
      return {
        currentPoints: 0,
        redeemableValue: 0,
        visitsMTD: 0,
        visitsLifetime: 0,
      };
    }
  };

  const metrics = getMetrics();

  const handleScanQR = () => {
    setShowQRHint(true);
  };

  // Show loading state
  if (storesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successBanner && (
        <Banner
          type="success"
          message={successBanner}
          onDismiss={() => setSuccessBanner("")}
        />
      )}

      {/* Welcome Banner */}
      {!currentStore && connectedStores.length > 0 && (
        <Banner
          type="info"
          title="Welcome to your loyalty dashboard!"
          message={`You're connected to ${connectedStores.length} store${connectedStores.length !== 1 ? 's' : ''}. Select a specific store above to see detailed information.`}
          dismissible={false}
        />
      )}

      {/* No Stores Connected Banner */}
      {!storesLoading && connectedStores.length === 0 && (
        <Banner
          type="warning"
          title="No stores connected"
          message="You haven't connected to any stores yet. Join a store to start earning loyalty rewards!"
          dismissible={false}
        />
      )}

      {/* Store Switcher */}
      <div className="hidden sm:block w-1/2">
        <StoreSwitcher
          stores={connectedStores}
          currentStore={currentStore}
          onStoreChange={setCurrentStore}
        />
      </div>

      {/* Store Switcher (Mobile) */}
      <div className="sm:hidden">
        <StoreSwitcher
          stores={connectedStores}
          currentStore={currentStore}
          onStoreChange={setCurrentStore}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Points"
          value={metrics.currentPoints.toLocaleString()}
          change={
            currentStoreData
              ? `at ${currentStoreData.name}`
              : "across all stores"
          }
          icon={Gift}
          trend="neutral"
        />
        <StatCard
          title="Redeemable Value"
          value={formatCurrency(metrics.redeemableValue)}
          change="Available now"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Visits This Month"
          value={metrics.visitsMTD.toString()}
          change={currentStoreData ? "visits" : "total visits"}
          icon={CheckCircle}
          trend="neutral"
        />
        <StatCard
          title="Lifetime Visits"
          value={metrics.visitsLifetime.toString()}
          change="All time"
          icon={Clock}
          trend="neutral"
        />
      </div>

      {/* Points Summary and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PointsSummary
          points={metrics.currentPoints}
          conversionRate={currentStoreData?.conversionRate || 100}
          storeName={currentStoreData?.name}
        />
        <RewardProgress
          currentPoints={currentStoreData?.points || metrics.currentPoints}
          conversionRate={currentStoreData?.conversionRate || 100}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleScanQR}
            className="p-4 rounded-xl border border-[#D0D8C3]/40 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-[#D0D8C3]/5 dark:hover:bg-zinc-700 transition-all text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#014421]/10 dark:bg-[#014421]/20 rounded-lg">
                <QrCode className="w-5 h-5 text-[#014421] dark:text-[#D0D8C3]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Scan Store QR
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Request visit approval
                </p>
              </div>
            </div>
          </button>

          <Link
            href={`/user/rewards${
              currentStore ? `?store=${currentStore}` : ""
            }`}
            className="p-4 rounded-xl border border-[#D0D8C3]/40 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-[#D0D8C3]/5 dark:hover:bg-zinc-700 transition-all text-left block">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#014421]/10 dark:bg-[#014421]/20 rounded-lg">
                <Gift className="w-5 h-5 text-[#014421] dark:text-[#D0D8C3]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  View Rewards
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Check points & redemptions
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/user/visits"
            className="p-4 rounded-xl border border-[#D0D8C3]/40 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-[#D0D8C3]/5 dark:hover:bg-zinc-700 transition-all text-left block">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#014421]/10 dark:bg-[#014421]/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[#014421] dark:text-[#D0D8C3]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Visit History
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View all visits
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Visit Analytics Chart */}
      <VisitAnalyticsChart storeId={currentStore} />

      {/* QR Scan Hint Modal/Panel */}
      {showQRHint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  How to Scan Store QR Code
                </h3>
                <button
                  onClick={() => setShowQRHint(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="sr-only">Close</span>×
                </button>
              </div>
              <QRScanHint />
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowQRHint(false)}>Got it</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
