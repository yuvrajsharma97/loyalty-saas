"use client";
import { useState } from "react";
import { Store, Users, CheckCircle, Gift, TrendingUp } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import DataTable from "@/components/admin/DataTable";
import Banner from "@/components/admin/Banner";

export default function AdminDashboard() {
  const MOCK_STORES = [
    {
      id: "1",
      name: "Bloom Coffee Co.",
      ownerEmail: "sarah@bloomcoffee.com",
      tier: "gold",
      usersCount: 245,
      createdAt: "2024-01-15",
      status: "active",
    },
    {
      id: "2",
      name: "The Grooming Lounge",
      ownerEmail: "marcus@groominglounge.com",
      tier: "platinum",
      usersCount: 156,
      createdAt: "2024-02-03",
      status: "active",
    },
    {
      id: "3",
      name: "Fresh Bakes Bakery",
      ownerEmail: "emma@freshbakes.co.uk",
      tier: "silver",
      usersCount: 89,
      createdAt: "2024-02-20",
      status: "active",
    },
    {
      id: "4",
      name: "City Barbers",
      ownerEmail: "james@citybarbers.com",
      tier: "gold",
      usersCount: 203,
      createdAt: "2024-01-28",
      status: "suspended",
    },
    {
      id: "5",
      name: "Green Leaf Café",
      ownerEmail: "lisa@greenleaf.com",
      tier: "silver",
      usersCount: 67,
      createdAt: "2024-03-01",
      status: "active",
    },
  ];

  const MOCK_USERS = [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      role: "user",
      storesCount: 3,
      createdAt: "2024-01-20",
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Chen",
      email: "sarah@bloomcoffee.com",
      role: "store-owner",
      storesCount: 1,
      createdAt: "2024-01-15",
      status: "active",
    },
    {
      id: "3",
      name: "Marcus Rodriguez",
      email: "marcus@groominglounge.com",
      role: "store-owner",
      storesCount: 1,
      createdAt: "2024-02-03",
      status: "active",
    },
    {
      id: "4",
      name: "Emma Thompson",
      email: "emma@freshbakes.co.uk",
      role: "store-owner",
      storesCount: 1,
      createdAt: "2024-02-20",
      status: "active",
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david@example.com",
      role: "user",
      storesCount: 2,
      createdAt: "2024-02-10",
      status: "suspended",
    },
  ];

  const [showBanner, setShowBanner] = useState(true);

  const recentStores = MOCK_STORES.slice(0, 5);

  const storeColumns = [
    { key: "name", label: "Store Name", sortable: true },
    { key: "ownerEmail", label: "Owner", sortable: true },
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
    { key: "usersCount", label: "Users", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stores"
          value="2,847"
          change="+12% from last month"
          trend="up"
          icon={Store}
        />
        <StatCard
          title="Total Users"
          value="45,231"
          change="+8% from last month"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Approved Visits"
          value="128,492"
          change="+15% from last month"
          trend="up"
          icon={CheckCircle}
        />
        <StatCard
          title="Points Distributed"
          value="2.4M"
          change="+22% from last month"
          trend="up"
          icon={Gift}
        />
      </div>

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
        <DataTable columns={storeColumns} data={recentStores} />
      </div>
    </div>
  );
}
