"use client";
import { useState } from "react";
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
import { formatPoints } from "@/lib/formatters";

export default function StoreDashboard() {

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



  const [storeMeta, setStoreMeta] = useState(MOCK_STORE_META);
  const [users, setUsers] = useState(MOCK_USERS);
  const [pendingVisits] = useState(MOCK_VISITS_PENDING);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [successBanner, setSuccessBanner] = useState("");

  const tierProgress = {
    silver: { max: 100, current: storeMeta.userCount },
    gold: { max: 500, current: storeMeta.userCount },
    platinum: { max: 1000, current: storeMeta.userCount },
  };

  const currentTierProgress = tierProgress[storeMeta.tier];
  const nextTier =
    storeMeta.tier === "silver"
      ? "gold"
      : storeMeta.tier === "gold"
      ? "platinum"
      : null;

  const handleInviteUser = () => {
    if (inviteForm.name && inviteForm.email) {
      const newUser = {
        id: Date.now().toString(),
        name: inviteForm.name,
        email: inviteForm.email,
        points: 0,
        visits: 0,
        lastVisit: null,
        joinedAt: new Date().toISOString().split("T")[0],
        status: "active",
        hasRewards: false,
      };

      setUsers((prev) => [newUser, ...prev]);
      setStoreMeta((prev) => ({ ...prev, userCount: prev.userCount + 1 }));
      setInviteForm({ name: "", email: "" });
      setShowInviteModal(false);
      setSuccessBanner(
        `User ${inviteForm.name} has been invited successfully.`
      );
    }
  };

  const handlePauseProgram = () => {
    setStoreMeta((prev) => ({ ...prev, paused: !prev.paused }));
    setSuccessBanner(
      `Loyalty program ${storeMeta.paused ? "resumed" : "paused"} successfully.`
    );
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

      {/* Tier Progress Banner */}
      {nextTier && currentTierProgress.current < currentTierProgress.max && (
        <Banner
          type="info"
          title={`You are on ${
            storeMeta.tier.charAt(0).toUpperCase() + storeMeta.tier.slice(1)
          }`}
          message={`${currentTierProgress.current}/${
            currentTierProgress.max
          } users. Reach ${
            nextTier.charAt(0).toUpperCase() + nextTier.slice(1)
          } at ${nextTier === "gold" ? "101" : "501"}+ users.`}
          dismissible={false}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Users"
          value={storeMeta.userCount.toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingVisits.length}
          icon={Clock}
          trend={pendingVisits.length > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Approved Visits"
          value="47"
          change="This month"
          icon={CheckCircle}
        />
        <StatCard
          title="Points Distributed"
          value={formatPoints(12450)}
          change="All time"
          icon={Gift}
        />
        <StatCard
          title="Points Redeemed"
          value={formatPoints(3210)}
          change="All time"
          icon={TrendingUp}
        />
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tier Status
              </p>
              <div className="mt-2">
                <Badge variant={storeMeta.tier}>
                  {storeMeta.tier.charAt(0).toUpperCase() +
                    storeMeta.tier.slice(1)}
                </Badge>
              </div>
            </div>
            <Award className="w-6 h-6 text-[#014421] dark:text-[#D0D8C3]" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <QuickAction
            icon={Pause}
            title={storeMeta.paused ? "Resume Program" : "Pause Program"}
            description={
              storeMeta.paused
                ? "Activate loyalty program"
                : "Temporarily disable loyalty program"
            }
            onClick={handlePauseProgram}
            variant={storeMeta.paused ? "primary" : "warning"}
          />
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Visits Last 12 Months
        </h3>
        <div className="h-64 bg-[#D0D8C3]/10 dark:bg-[#014421]/10 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Chart placeholder - Visit trends over time
          </p>
        </div>
      </div>

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
