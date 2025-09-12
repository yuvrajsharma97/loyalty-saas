"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Settings, Users, Activity, Gift } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import Badge from "@/components/admin/Badge";
import Button from "@/components/admin/Button";
import Tabs from "@/components/admin/Tabs";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
import Input from "@/components/admin/Input";
import Banner from "@/components/admin/Banner";

const MOCK_STORE_USERS = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    points: 245,
    joined: "2024-01-20",
    status: "active",
  },
  {
    id: "2",
    name: "Alice Johnson",
    email: "alice@example.com",
    points: 156,
    joined: "2024-02-03",
    status: "active",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    points: 89,
    joined: "2024-02-15",
    status: "suspended",
  },
];

const MOCK_VISITS = [
  {
    id: "1",
    userName: "John Smith",
    date: "2024-03-15",
    method: "qr",
    status: "approved",
    pointsEarned: 10,
    spendAmount: "£12.50",
  },
  {
    id: "2",
    userName: "Alice Johnson",
    date: "2024-03-15",
    method: "manual",
    status: "pending",
    pointsEarned: 0,
    spendAmount: "£8.00",
  },
  {
    id: "3",
    userName: "Bob Wilson",
    date: "2024-03-14",
    method: "qr",
    status: "approved",
    pointsEarned: 15,
    spendAmount: "£18.75",
  },
];

const MOCK_REWARDS = [
  {
    id: "1",
    userName: "John Smith",
    date: "2024-03-10",
    pointsUsed: 100,
    value: "£10.00",
    autoTriggered: "Yes",
  },
  {
    id: "2",
    userName: "Alice Johnson",
    date: "2024-03-08",
    pointsUsed: 50,
    value: "£5.00",
    autoTriggered: "No",
  },
];

export default function StoreDetail() {
  const params = useParams();
  const storeId = params?.id;

  const [store, setStore] = useState(
    MOCK_STORES.find((s) => s.id === storeId) || MOCK_STORES[0]
  );
  const [showTierModal, setShowTierModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newTier, setNewTier] = useState(store.tier);
  const [rewardConfig, setRewardConfig] = useState({
    type: "hybrid",
    pointsPerPound: "1",
    pointsPerVisit: "10",
    conversionRate: "0.10",
  });
  const [successBanner, setSuccessBanner] = useState("");

  const handleTierChange = () => {
    setStore((prev) => ({ ...prev, tier: newTier }));
    setSuccessBanner(
      `Store tier updated to ${
        newTier.charAt(0).toUpperCase() + newTier.slice(1)
      }.`
    );
    setShowTierModal(false);
  };

  const handleRewardUpdate = () => {
    console.log("Reward config updated:", rewardConfig);
    setSuccessBanner("Reward configuration updated successfully.");
    setShowRewardModal(false);
  };

  const userColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "points", label: "Points", sortable: true },
    { key: "joined", label: "Joined", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <Badge variant={status === "active" ? "success" : "danger"}>
          {status}
        </Badge>
      ),
    },
  ];

  const visitColumns = [
    { key: "userName", label: "User", sortable: true },
    { key: "date", label: "Date", sortable: true },
    {
      key: "method",
      label: "Method",
      render: (method) => (
        <Badge variant={method === "qr" ? "primary" : "default"}>
          {method.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <Badge variant={status === "approved" ? "success" : "warning"}>
          {status}
        </Badge>
      ),
    },
    { key: "pointsEarned", label: "Points Earned", sortable: true },
    { key: "spendAmount", label: "Spend Amount", sortable: true },
  ];

  const rewardColumns = [
    { key: "userName", label: "User", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "pointsUsed", label: "Points Used", sortable: true },
    { key: "value", label: "Value", sortable: true },
    {
      key: "autoTriggered",
      label: "Auto Triggered",
      render: (auto) => (
        <Badge variant={auto === "Yes" ? "success" : "default"}>{auto}</Badge>
      ),
    },
  ];

  const tabs = [
    {
      label: "Overview",
      content: (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Users" value={store.usersCount} icon={Users} />
            <StatCard title="Approved Visits" value="1,247" icon={Activity} />
            <StatCard title="Points Distributed" value="12,450" icon={Gift} />
            <StatCard title="Points Redeemed" value="3,210" icon={Gift} />
          </div>

          {/* Reward Config */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reward Configuration
              </h3>
              <Button
                variant="secondary"
                onClick={() => setShowRewardModal(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Override Config
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Type
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rewardConfig.type}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Points per £
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rewardConfig.pointsPerPound}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Points per Visit
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rewardConfig.pointsPerVisit}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  £{rewardConfig.conversionRate}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Users",
      content: <DataTable columns={userColumns} data={MOCK_STORE_USERS} />,
    },
    {
      label: "Visits",
      content: <DataTable columns={visitColumns} data={MOCK_VISITS} />,
    },
    {
      label: "Rewards",
      content: <DataTable columns={rewardColumns} data={MOCK_REWARDS} />,
    },
  ];

  return (
    <div className="space-y-6">
      {successBanner && (
        <Banner
          type="success"
          message={successBanner}
          onDismiss={() => setSuccessBanner("")}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {store.name}
          </h1>
          <Badge variant={store.tier}>
            {store.tier.charAt(0).toUpperCase() + store.tier.slice(1)}
          </Badge>
        </div>
        <Button onClick={() => setShowTierModal(true)}>Change Tier</Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} />

      {/* Tier Change Modal */}
      <Modal
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        title="Change Store Tier"
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowTierModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleTierChange}>Update Tier</Button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select New Tier
            </label>
            <Select
              value={newTier}
              onChange={(e) => setNewTier(e.target.value)}>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </Select>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Changing the tier will affect the store's feature access and limits.
          </p>
        </div>
      </Modal>

      {/* Reward Config Modal */}
      <Modal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        title="Override Reward Configuration"
        size="lg"
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowRewardModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRewardUpdate}>Save Changes</Button>
          </>
        }>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reward Type
              </label>
              <Select
                value={rewardConfig.type}
                onChange={(e) =>
                  setRewardConfig((prev) => ({ ...prev, type: e.target.value }))
                }>
                <option value="spend">Spend-based</option>
                <option value="visit">Visit-based</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points per £
              </label>
              <Input
                type="number"
                value={rewardConfig.pointsPerPound}
                onChange={(e) =>
                  setRewardConfig((prev) => ({
                    ...prev,
                    pointsPerPound: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points per Visit
              </label>
              <Input
                type="number"
                value={rewardConfig.pointsPerVisit}
                onChange={(e) =>
                  setRewardConfig((prev) => ({
                    ...prev,
                    pointsPerVisit: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversion Rate (£ per point)
              </label>
              <Input
                type="number"
                step="0.01"
                value={rewardConfig.conversionRate}
                onChange={(e) =>
                  setRewardConfig((prev) => ({
                    ...prev,
                    conversionRate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
