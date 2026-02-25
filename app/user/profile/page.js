"use client";
import { useState, useEffect } from "react";
import { Save, Trash2, ExternalLink } from "lucide-react";
import { useUserStore } from "../layout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Banner from "@/components/ui/Banner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Badge from "@/components/ui/Badge";
import PreferenceToggle from "@/components/user/PreferenceToggle";
import { formatDate } from "@/lib/formatters";
import Link from "next/link";

const MOCK_USER_PROFILE = {
  id: "1",
  name: "John Smith",
  email: "john.smith@example.com",
  role: "User",
  preferences: {
    visitApprovedEmail: true,
    rewardEmail: true,
    promotionEmail: false
  },
  createdAt: "2024-01-20",
  lastLogin: "2024-03-15"
};

export default function UserProfile() {
  const { connectedStores, setCurrentStore } = useUserStore();
  const [userProfile, setUserProfile] = useState(null);
  const [stores, setStores] = useState(connectedStores);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    storeId: ""
  });
  const [successBanner, setSuccessBanner] = useState("");


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/user/profile');

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await response.json();

        const normalizedProfile = {
          ...profileData,
          preferences: {
            visitApprovedEmail: true,
            rewardEmail: true,
            promotionEmail: false,
            ...profileData.preferences
          }
        };
        setUserProfile(normalizedProfile);
      } catch (err) {
        setError(err.message);
        console.error('Profile fetch error:', err);

        setUserProfile(MOCK_USER_PROFILE);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSavePreferences = async () => {
    if (!userProfile) return;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userProfile.name,
          preferences: userProfile.preferences || {
            visitApprovedEmail: true,
            rewardEmail: true,
            promotionEmail: false
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      const result = await response.json();
      setSuccessBanner(result.message || "Notification preferences saved successfully.");
    } catch (err) {
      setSuccessBanner("Error saving preferences. Please try again.");
      console.error('Save preferences error:', err);
    }
  };

  const handleLeaveStore = () => {
    const { storeId } = confirmDialog;
    const store = stores.find((s) => s.id === storeId);

    setStores((prev) => prev.filter((s) => s.id !== storeId));
    setSuccessBanner(
      `You have left ${store?.name}. Your points and history have been preserved.`
    );
    setConfirmDialog({ isOpen: false, type: "", storeId: "" });
  };

  const handleDeleteAccount = () => {
    setSuccessBanner(
      "Account deletion coming soon - this feature is in development."
    );
    setConfirmDialog({ isOpen: false, type: "", storeId: "" });
  };

  const handlePreferenceChange = (key) => (value) => {
    setUserProfile((prev) => ({
      ...prev,
      preferences: {
        visitApprovedEmail: true,
        rewardEmail: true,
        promotionEmail: false,
        ...prev?.preferences,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Profile
          </h1>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>);

  }

  if (!userProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Profile
          </h1>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
          <p className="text-red-600 dark:text-red-400">
            {error || "Failed to load profile"}
          </p>
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {successBanner &&
      <Banner
        type={successBanner.includes("Error") ? "error" : "success"}
        message={successBanner}
        onDismiss={() => setSuccessBanner("")} />

      }

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Profile
        </h1>
      </div>

      {}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <Input
              value={userProfile.name}
              onChange={(e) =>
              setUserProfile((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter your full name" />
            
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={userProfile.email}
              onChange={(e) =>
              setUserProfile((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter your email" />
            
          </div>
        </div>

        <Link href="/auth/forgot-password">
          <Button variant="secondary">
            <ExternalLink className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </Link>
      </div>

      {}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connected Stores
        </h3>

        <div className="space-y-4">
          {stores.map((store) =>
          <div
            key={store.id}
            className="flex items-center justify-between p-4 border border-[#D0D8C3]/40 dark:border-zinc-600 rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {store.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {store.points} points
                    </span>
                    <Badge variant={store.tier}>
                      {store.tier.charAt(0).toUpperCase() + store.tier.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Joined {formatDate(store.joinedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
              variant="ghost"
              size="sm"
              onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "leave",
                storeId: store.id
              })
              }
              className="text-red-600 hover:text-red-700">
                Leave Store
              </Button>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Email Notifications
          </h3>
          <Button onClick={handleSavePreferences}>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>

        <div className="space-y-2">
          <PreferenceToggle
            label="Visit Approved Notifications"
            description="Get notified when your visit requests are approved"
            checked={userProfile?.preferences?.visitApprovedEmail || false}
            onChange={handlePreferenceChange("visitApprovedEmail")} />
          

          <PreferenceToggle
            label="Reward Earned Notifications"
            description="Get notified when you earn rewards or points"
            checked={userProfile?.preferences?.rewardEmail || false}
            onChange={handlePreferenceChange("rewardEmail")} />
          
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Delete Account
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Permanently delete your account and all associated data
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() =>
            setConfirmDialog({ isOpen: true, type: "delete", storeId: "" })
            }
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>

      {}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
        setConfirmDialog({ isOpen: false, type: "", storeId: "" })
        }
        onConfirm={
        confirmDialog.type === "leave" ?
        handleLeaveStore :
        handleDeleteAccount
        }
        title={
        confirmDialog.type === "leave" ? "Leave Store" : "Delete Account"
        }
        message={
        confirmDialog.type === "leave" ?
        "Are you sure you want to leave this store? Your points and visit history will be preserved, but you won't earn new rewards." :
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        }
        confirmLabel={
        confirmDialog.type === "leave" ? "Leave Store" : "Delete Account"
        }
        variant="danger" />
      
    </div>);

}