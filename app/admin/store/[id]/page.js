"use client";

import { useCallback, useEffect, useState } from "react";
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

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toISOString().split("T")[0];
}

function formatCurrency(value) {
  const num = Number(value || 0);
  return `GBP ${num.toFixed(2)}`;
}

export default function StoreDetail() {
  const params = useParams();
  const storeId = params?.id;

  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({
    userCount: 0,
    approvedVisits: 0,
    totalPointsDistributed: 0,
    totalPointsRedeemed: 0
  });
  const [users, setUsers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [rewards, setRewards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTierModal, setShowTierModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newTier, setNewTier] = useState("silver");
  const [rewardConfig, setRewardConfig] = useState({
    type: "hybrid",
    pointsPerPound: "0",
    pointsPerVisit: "0",
    conversionRate: "100"
  });
  const [successBanner, setSuccessBanner] = useState("");

  const fetchStoreData = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    setError("");

    try {
      const [storeRes, usersRes, rewardsRes] = await Promise.all([
      fetch(`/api/admin/stores/${storeId}`),
      fetch(`/api/admin/store/${storeId}/users?page=1&limit=100`),
      fetch(`/api/admin/store/${storeId}/rewards?page=1&limit=100`)]
      );

      const [storeJson, usersJson, rewardsJson] = await Promise.all([
      storeRes.json(),
      usersRes.json(),
      rewardsRes.json()]
      );

      if (!storeRes.ok || !storeJson?.success) {
        throw new Error(storeJson?.error || "Failed to load store details");
      }

      const storeData = storeJson.data?.store;
      const statsData = storeJson.data?.stats || {};
      const recentVisits = storeJson.data?.recentVisits || [];

      const normalizedStore = {
        id: storeData?._id,
        name: storeData?.name || "Unknown Store",
        tier: storeData?.tier || "silver",
        rewardConfig: storeData?.rewardConfig || {
          type: "hybrid",
          pointsPerPound: 0,
          pointsPerVisit: 0,
          conversionRate: 100
        }
      };

      const usersData =
      usersRes.ok && usersJson?.success ?
      usersJson.data :
      (storeJson.data?.connectedUsers || []).map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        points: u.points || 0,
        joined: formatDate(u.createdAt),
        status: u.isActive === false ? "suspended" : "active"
      }));

      const rewardsData =
      rewardsRes.ok && rewardsJson?.success ?
      rewardsJson.data :
      (storeJson.data?.recentRedemptions || []).map((r) => ({
        id: r._id,
        userName: r.userId?.name || "Unknown User",
        date: formatDate(r.createdAt),
        pointsUsed: r.pointsUsed || 0,
        value: formatCurrency(r.rewardValueGBP ?? r.value),
        autoTriggered: r.autoTriggered ? "Yes" : "No"
      }));

      const visitsData = recentVisits.map((visit) => ({
        id: visit._id,
        userName: visit.userId?.name || "Unknown User",
        date: formatDate(visit.createdAt),
        method: visit.method || "manual",
        status: visit.status || "pending",
        pointsEarned: visit.points || 0,
        spendAmount: formatCurrency(visit.spend)
      }));

      const totalRedeemed = rewardsData.reduce((sum, reward) => {
        return sum + Number(reward.pointsUsed || 0);
      }, 0);

      setStore(normalizedStore);
      setNewTier(normalizedStore.tier);
      setRewardConfig({
        type: normalizedStore.rewardConfig.type || "hybrid",
        pointsPerPound: String(normalizedStore.rewardConfig.pointsPerPound ?? 0),
        pointsPerVisit: String(normalizedStore.rewardConfig.pointsPerVisit ?? 0),
        conversionRate: String(normalizedStore.rewardConfig.conversionRate ?? 100)
      });

      setStats({
        userCount: statsData.userCount || usersData.length || 0,
        approvedVisits: statsData.visitStats?.approved?.count || 0,
        totalPointsDistributed: statsData.totalPointsDistributed || 0,
        totalPointsRedeemed: totalRedeemed
      });
      setUsers(usersData || []);
      setVisits(visitsData || []);
      setRewards(rewardsData || []);
    } catch (err) {
      setError(err.message || "Failed to load store data");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  const handleTierChange = async () => {
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/tier`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTier })
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to update tier");
      }

      setStore((prev) => ({ ...prev, tier: newTier }));
      setSuccessBanner(
        `Store tier updated to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}.`
      );
      setShowTierModal(false);
    } catch (err) {
      setError(err.message || "Failed to update tier");
    }
  };

  const handleRewardUpdate = async () => {
    try {
      const payload = {
        type: rewardConfig.type,
        pointsPerPound: Number(rewardConfig.pointsPerPound),
        pointsPerVisit: Number(rewardConfig.pointsPerVisit),
        conversionRate: Number(rewardConfig.conversionRate)
      };

      const res = await fetch(`/api/admin/stores/${storeId}/reward-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to update reward configuration");
      }

      setStore((prev) => ({
        ...prev,
        rewardConfig: {
          type: payload.type,
          pointsPerPound: payload.pointsPerPound,
          pointsPerVisit: payload.pointsPerVisit,
          conversionRate: payload.conversionRate
        }
      }));

      setSuccessBanner("Reward configuration updated successfully.");
      setShowRewardModal(false);
    } catch (err) {
      setError(err.message || "Failed to update reward configuration");
    }
  };

  const userColumns = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "points", label: "Points", sortable: true },
  { key: "joined", label: "Joined", sortable: true },
  {
    key: "status",
    label: "Status",
    render: (status) =>
    <Badge variant={status === "active" ? "success" : "danger"}>
          {status}
        </Badge>

  }];


  const visitColumns = [
  { key: "userName", label: "User", sortable: true },
  { key: "date", label: "Date", sortable: true },
  {
    key: "method",
    label: "Method",
    render: (method) =>
    <Badge variant={method === "qr" ? "primary" : "default"}>
          {(method || "manual").toUpperCase()}
        </Badge>

  },
  {
    key: "status",
    label: "Status",
    render: (status) =>
    <Badge variant={status === "approved" ? "success" : "warning"}>
          {status}
        </Badge>

  },
  { key: "pointsEarned", label: "Points Earned", sortable: true },
  { key: "spendAmount", label: "Spend Amount", sortable: true }];


  const rewardColumns = [
  { key: "userName", label: "User", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "pointsUsed", label: "Points Used", sortable: true },
  { key: "value", label: "Value", sortable: true },
  {
    key: "autoTriggered",
    label: "Auto Triggered",
    render: (auto) =>
    <Badge variant={auto === "Yes" ? "success" : "default"}>{auto}</Badge>

  }];


  if (loading && !store) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Loading store data...</div>;
  }

  if (!store) {
    return (
      <div className="space-y-4">
        {error && <Banner type="error" message={error} onDismiss={() => setError("")} />}
        <p className="text-sm text-gray-500 dark:text-gray-400">Store not found.</p>
      </div>);

  }

  const tabs = [
  {
    label: "Overview",
    content:
    <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Users" value={stats.userCount} icon={Users} />
            <StatCard title="Approved Visits" value={stats.approvedVisits} icon={Activity} />
            <StatCard title="Points Distributed" value={stats.totalPointsDistributed} icon={Gift} />
            <StatCard title="Points Redeemed" value={stats.totalPointsRedeemed} icon={Gift} />
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reward Configuration
              </h3>
              <Button variant="secondary" onClick={() => setShowRewardModal(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Override Config
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {store.rewardConfig?.type}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Points per GBP</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {store.rewardConfig?.pointsPerPound}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Points per Visit</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {store.rewardConfig?.pointsPerVisit}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {store.rewardConfig?.conversionRate} points = GBP 1
                </p>
              </div>
            </div>
          </div>
        </div>

  },
  {
    label: "Users",
    content: <DataTable columns={userColumns} data={users} />
  },
  {
    label: "Visits",
    content: <DataTable columns={visitColumns} data={visits} />
  },
  {
    label: "Rewards",
    content: <DataTable columns={rewardColumns} data={rewards} />
  }];


  return (
    <div className="space-y-6">
      {successBanner &&
      <Banner
        type="success"
        message={successBanner}
        onDismiss={() => setSuccessBanner("")} />

      }

      {error && <Banner type="error" message={error} onDismiss={() => setError("")} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
          <Badge variant={store.tier}>
            {store.tier.charAt(0).toUpperCase() + store.tier.slice(1)}
          </Badge>
        </div>
        <Button onClick={() => setShowTierModal(true)}>Change Tier</Button>
      </div>

      <Tabs tabs={tabs} />

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
            <Select value={newTier} onChange={(e) => setNewTier(e.target.value)}>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </Select>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Changing the tier will affect the store access and limits.
          </p>
        </div>
      </Modal>

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
                onChange={(e) => setRewardConfig((prev) => ({ ...prev, type: e.target.value }))}>

                <option value="spend">Spend-based</option>
                <option value="visit">Visit-based</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points per GBP
              </label>
              <Input
                type="number"
                value={rewardConfig.pointsPerPound}
                onChange={(e) =>
                setRewardConfig((prev) => ({ ...prev, pointsPerPound: e.target.value }))
                } />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points per Visit
              </label>
              <Input
                type="number"
                value={rewardConfig.pointsPerVisit}
                onChange={(e) =>
                setRewardConfig((prev) => ({ ...prev, pointsPerVisit: e.target.value }))
                } />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversion Rate (points per GBP 1)
              </label>
              <Input
                type="number"
                step="0.01"
                value={rewardConfig.conversionRate}
                onChange={(e) =>
                setRewardConfig((prev) => ({ ...prev, conversionRate: e.target.value }))
                } />

            </div>
          </div>
        </div>
      </Modal>
    </div>);

}