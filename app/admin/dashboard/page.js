"use client";
import { useState, useEffect } from "react";
import { Store, Users, CheckCircle, Gift, TrendingUp } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import DataTable from "@/components/admin/DataTable";
import Banner from "@/components/admin/Banner";

export default function AdminDashboard() {
  const [showBanner, setShowBanner] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentStores, setRecentStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, storesResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/recent-stores')
      ]);

      if (!statsResponse.ok || !storesResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statsData = await statsResponse.json();
      const storesData = await storesResponse.json();

      setDashboardData(statsData.data);
      setRecentStores(storesData.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const storeColumns = [
    { key: "name", label: "Store Name", sortable: true },
    {
      key: "ownerId",
      label: "Owner",
      render: (ownerId, store) => store.ownerId?.email || store.ownerId?.name || "N/A"
    },
    {
      key: "tier",
      label: "Tier",
      render: (tier) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            tier === "platinum"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
              : tier === "gold"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
          }`}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>
      ),
    },
    {
      key: "userCount",
      label: "Users",
      sortable: true,
      render: (userCount) => userCount || 0
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (createdAt) => new Date(createdAt).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {showBanner && (
        <Banner
          type="warning"
          title="Scheduled Maintenance"
          message="System maintenance scheduled for Friday 22:00–23:00 GMT."
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error loading dashboard data: {error}</p>
        </div>
      ) : dashboardData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Stores"
            value={dashboardData.overview?.totalStores?.toLocaleString() || "0"}
            change={`+${dashboardData.overview?.changes?.stores || 0} from last month`}
            trend={dashboardData.overview?.changes?.stores > 0 ? "up" : "neutral"}
            icon={Store}
          />
          <StatCard
            title="Total Users"
            value={dashboardData.overview?.totalUsers?.toLocaleString() || "0"}
            change={`+${dashboardData.overview?.changes?.users || 0} from last month`}
            trend={dashboardData.overview?.changes?.users > 0 ? "up" : "neutral"}
            icon={Users}
          />
          <StatCard
            title="Total Visits"
            value={dashboardData.overview?.totalVisits?.toLocaleString() || "0"}
            change={`+${dashboardData.overview?.changes?.visits || 0} from last month`}
            trend={dashboardData.overview?.changes?.visits > 0 ? "up" : "neutral"}
            icon={CheckCircle}
          />
          <StatCard
            title="Points Distributed"
            value={dashboardData.overview?.totalPointsDistributed?.toLocaleString() || "0"}
            change="Total points distributed"
            trend="neutral"
            icon={Gift}
          />
        </div>
      ) : null}

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Visits per Month
          </h3>
          <div className="h-64 bg-[#D0D8C3]/10 dark:bg-[#014421]/10 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Chart placeholder - Visits trend
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Redemptions per Month
          </h3>
          <div className="h-64 bg-[#D0D8C3]/10 dark:bg-[#014421]/10 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Chart placeholder - Redemptions trend
            </p>
          </div>
        </div>
      </div>

      {/* Recently Created Stores */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recently Created Stores
        </h3>
        {loading ? (
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md animate-pulse">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">Error loading recent stores</p>
          </div>
        ) : (
          <DataTable columns={storeColumns} data={recentStores} />
        )}
      </div>
    </div>
  );
}
