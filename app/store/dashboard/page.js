"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  Gift,
  TrendingUp,
  Award,
  UserPlus,
  QrCode,
  Pause,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import Banner from "@/components/ui/Banner";
import QuickAction from "@/components/store/QuickAction";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import QRPreview from "@/components/store/QRPreview";
import Badge from "@/components/ui/Badge";
import StoreAnalyticsChart from "@/components/store/StoreAnalyticsChart";
import { formatPoints } from "@/lib/formatters";

export default function StoreDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MOCK_STORE_META = {
      id: "bloom-coffee",
      name: "Bloom Coffee Co.",
      slug: "bloom-coffee",
      location: "London, UK",
      tier: "gold",
      userCount: 245,
      paused: false,
      rewardConfig: {
        type: "hybrid",
        pointsPerPound: 2,
        pointsPerVisit: 10,
        conversionRate: 100,
      },
    };

    const MOCK_USERS = [
      {
        id: "1",
        name: "John Smith",
        email: "john@example.com",
        points: 245,
        visits: 12,
        lastVisit: "2024-03-15",
        joinedAt: "2024-01-20",
        status: "active",
        hasRewards: true,
      },
      {
        id: "2",
        name: "Alice Johnson",
        email: "alice@example.com",
        points: 156,
        visits: 8,
        lastVisit: "2024-03-14",
        joinedAt: "2024-02-03",
        status: "active",
        hasRewards: true,
      },
      {
        id: "3",
        name: "Bob Wilson",
        email: "bob@example.com",
        points: 89,
        visits: 5,
        lastVisit: "2024-03-10",
        joinedAt: "2024-02-15",
        status: "suspended",
        hasRewards: false,
      },
      {
        id: "4",
        name: "Sarah Davis",
        email: "sarah@example.com",
        points: 320,
        visits: 18,
        lastVisit: "2024-03-16",
        joinedAt: "2024-01-10",
        status: "active",
        hasRewards: true,
      },
      {
        id: "5",
        name: "Mike Brown",
        email: "mike@example.com",
        points: 78,
        visits: 4,
        lastVisit: "2024-03-12",
        joinedAt: "2024-02-28",
        status: "active",
        hasRewards: false,
      },
    ];

    const MOCK_VISITS_PENDING = [
      {
        id: "1",
        userName: "John Smith",
        date: "2024-03-16",
        method: "qr",
        spendAmount: 12.5,
        points: 35,
      },
      {
        id: "2",
        userName: "Alice Johnson",
        date: "2024-03-16",
        method: "manual",
        spendAmount: 8.0,
        points: 26,
      },
      {
        id: "3",
        userName: "Sarah Davis",
        date: "2024-03-15",
        method: "qr",
        spendAmount: 15.75,
        points: 42,
      },
    ];

    const MOCK_VISITS_HISTORY = [
      {
        id: "4",
        userName: "John Smith",
        date: "2024-03-15",
        method: "qr",
        status: "approved",
        pointsEarned: 35,
        spendAmount: 12.5,
      },
      {
        id: "5",
        userName: "Bob Wilson",
        date: "2024-03-14",
        method: "manual",
        status: "approved",
        pointsEarned: 26,
        spendAmount: 8.0,
      },
      {
        id: "6",
        userName: "Sarah Davis",
        date: "2024-03-13",
        method: "qr",
        status: "approved",
        pointsEarned: 42,
        spendAmount: 15.75,
      },
      {
        id: "7",
        userName: "Alice Johnson",
        date: "2024-03-12",
        method: "qr",
        status: "approved",
        pointsEarned: 30,
        spendAmount: 10.25,
      },
      {
        id: "8",
        userName: "Mike Brown",
        date: "2024-03-11",
        method: "manual",
        status: "approved",
        pointsEarned: 20,
        spendAmount: 5.5,
      },
    ];

    const MOCK_REDEMPTIONS = [
      {
        id: "1",
        userName: "John Smith",
        date: "2024-03-10",
        pointsUsed: 100,
        value: 1.0,
        autoTriggered: true,
      },
      {
        id: "2",
        userName: "Sarah Davis",
        date: "2024-03-08",
        pointsUsed: 200,
        value: 2.0,
        autoTriggered: false,
      },
      {
        id: "3",
        userName: "Alice Johnson",
        date: "2024-03-05",
        pointsUsed: 150,
        value: 1.5,
        autoTriggered: true,
      },
    ];



  const [storeMeta, setStoreMeta] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingVisits, setPendingVisits] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [successBanner, setSuccessBanner] = useState("");

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsResponse, visitsResponse] = await Promise.all([
        fetch('/api/store/dashboard/metrics'),
        fetch('/api/store/visits?status=pending&limit=10')
      ]);

      if (!metricsResponse.ok || !visitsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const metrics = await metricsResponse.json();
      const visitsData = await visitsResponse.json();

      setDashboardData(metrics);
      setStoreMeta({
        id: metrics.store.id,
        name: metrics.store.name,
        tier: metrics.store.tier,
        userCount: metrics.users.total,
        paused: !metrics.store.isActive,
        rewardConfig: {
          type: "hybrid", // Will be populated from store profile API
          pointsPerPound: 2,
          pointsPerVisit: 10,
          conversionRate: 100,
        },
      });
      setPendingVisits(visitsData.visits || []);
    } catch (err) {
      setError(err.message);
      console.error('Dashboard fetch error:', err);
      // Fallback to mock data
      setStoreMeta(MOCK_STORE_META);
      setPendingVisits(MOCK_VISITS_PENDING);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getTierProgress = () => {
    if (!storeMeta || !dashboardData) return null;

    const tierLimits = { silver: 100, gold: 500, platinum: 1000 };
    const nextTierLimit =
      storeMeta.tier === "silver" ? 101 :
      storeMeta.tier === "gold" ? 501 : null;

    return {
      current: storeMeta.userCount,
      max: tierLimits[storeMeta.tier],
      nextLimit: nextTierLimit,
      nextTier: storeMeta.tier === "silver" ? "gold" :
                storeMeta.tier === "gold" ? "platinum" : null
    };
  };

  const tierProgress = getTierProgress();
  const currentTierProgress = tierProgress;
  const nextTier = tierProgress?.nextTier;

  const handleInviteUser = async () => {
    if (!inviteForm.name || !inviteForm.email) return;

    try {
      const response = await fetch('/api/store/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: inviteForm.name,
          email: inviteForm.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite user');
      }

      const result = await response.json();

      setInviteForm({ name: "", email: "" });
      setShowInviteModal(false);
      setSuccessBanner(result.message || `User ${inviteForm.name} has been invited successfully.`);

      // Refresh dashboard data to update user count
      fetchDashboardData();
    } catch (err) {
      console.error('Invite user error:', err);
      setSuccessBanner(`Error: ${err.message}`);
    }
  };

  const handlePauseProgram = async () => {
    if (!storeMeta) return;

    try {
      const response = await fetch('/api/store/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: storeMeta.paused, // If currently paused, make it active
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update store status');
      }

      const result = await response.json();

      setStoreMeta((prev) => ({ ...prev, paused: !result.store.isActive }));
      setSuccessBanner(result.message ||
        `Loyalty program ${storeMeta.paused ? "resumed" : "paused"} successfully.`
      );
    } catch (err) {
      console.error('Update store status error:', err);
      setSuccessBanner(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !storeMeta) {
    return (
      <div className="space-y-6">
        <Banner
          type="error"
          title="Failed to load dashboard"
          message={error}
          dismissible={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successBanner && (
        <Banner
          type={successBanner.includes("Error") ? "error" : "success"}
          message={successBanner}
          onDismiss={() => setSuccessBanner("")}
        />
      )}

      {/* Tier Progress Banner */}
      {nextTier &&
        currentTierProgress &&
        currentTierProgress.current < currentTierProgress.nextLimit && (
          <Banner
            type="info"
            title={`You are on ${
              storeMeta.tier.charAt(0).toUpperCase() + storeMeta.tier.slice(1)
            }`}
            message={`${currentTierProgress.current}/${
              currentTierProgress.nextLimit
            } users. Reach ${
              nextTier.charAt(0).toUpperCase() + nextTier.slice(1)
            } at ${currentTierProgress.nextLimit}+ users.`}
            dismissible={false}
          />
        )}

      {/* Stats Grid - First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Users"
          value={
            dashboardData?.users?.total?.toLocaleString() ||
            storeMeta?.userCount?.toLocaleString() ||
            "0"
          }
          icon={Users}
          change={
            dashboardData?.users?.recentJoins
              ? `+${dashboardData.users.recentJoins} this week`
              : ""
          }
        />
        <StatCard
          title="Pending Approvals"
          value={dashboardData?.visits?.pending || pendingVisits?.length || 0}
          icon={Clock}
          trend={
            (dashboardData?.visits?.pending || pendingVisits?.length || 0) > 0
              ? "up"
              : "neutral"
          }
        />
        <StatCard
          title="Approved Visits"
          value={dashboardData?.visits?.monthlyApproved || 0}
          change="This month"
          icon={CheckCircle}
        />
      </div>

      {/* Stats Grid - Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Points Distributed"
          value={formatPoints(dashboardData?.points?.totalDistributed || 0)}
          change="All time"
          icon={Gift}
        />
        <StatCard
          title="Points Redeemed"
          value={formatPoints(dashboardData?.points?.totalRedeemed || 0)}
          change="All time"
          icon={TrendingUp}
        />
        <StatCard
          title="Tier Status"
          value={
            <Badge variant={storeMeta?.tier || "silver"}>
              {(storeMeta?.tier || "silver").charAt(0).toUpperCase() +
                (storeMeta?.tier || "silver").slice(1)}
            </Badge>
          }
          icon={Award}
          change={
            currentTierProgress && nextTier
              ? `${currentTierProgress.current}/${currentTierProgress.nextLimit} users`
              : "Current tier"
          }
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <QuickAction
            icon={UserPlus}
            title="Invite User"
            description="Send an invitation to a new customer"
            onClick={() => setShowInviteModal(true)}
            variant="primary"
          />
          <QuickAction
            icon={QrCode}
            title="Generate Store QR"
            description="Display QR code for customer visits"
            onClick={() => setShowQRModal(true)}
          />
        </div>
      </div>

      {/* Store Analytics Chart */}
      <StoreAnalyticsChart />

      {/* Invite User Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteForm({ name: "", email: "" });
        }}
        title="Invite New User"
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser}>Send Invitation</Button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <Input
              value={inviteForm.name}
              onChange={(e) =>
                setInviteForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter customer's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter customer's email"
            />
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Store QR Code"
        size="sm">
        <div className="text-center space-y-4">
          <QRPreview slug={storeMeta.slug} size="lg" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {storeMeta.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              /{storeMeta.slug}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Customers can scan this QR code to request visit approval and earn
            loyalty points.
          </p>
        </div>
      </Modal>
    </div>
  );
}
