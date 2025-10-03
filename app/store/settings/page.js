"use client";
import { useState, useEffect } from "react";
import { Download, Save, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";
import Banner from "@/components/ui/Banner";
import FileUpload from "@/components/store/FileUpload";
import QRPreview from "@/components/store/QRPreview";

export default function StoreSettings() {
  const [storeMeta, setStoreMeta] = useState(null);
  const [storeProfile, setStoreProfile] = useState({
    name: "",
    slug: "",
    location: "",
  });
  const [logo, setLogo] = useState(null);
  const [notifications, setNotifications] = useState({
    visitPending: true,
    rewardEarned: true,
    tierWarnings: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const fetchStoreProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/store/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch store profile');
      }

      const data = await response.json();
      const store = data.store;

      setStoreMeta(store);
      setStoreProfile({
        name: store.name || "",
        slug: store.slug || "",
        location: store.location || "",
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching store profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    // Update store meta with new profile data
    setStoreMeta((prev) => ({
      ...prev,
      ...storeProfile,
    }));

    setSuccessBanner("Store settings updated successfully.");
  };

  const handleDownloadQR = () => {
    setSuccessBanner("QR code download coming soon - feature in development.");
  };

  const handleNotificationChange = (key) => (value) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-[#014421] animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Banner type="error" message={error} dismissible={false} />
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

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Store Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Profile */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Store Profile
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Name
              </label>
              <Input
                value={storeProfile.name}
                onChange={(e) =>
                  setStoreProfile((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter store name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Slug
              </label>
              <Input
                value={storeProfile.slug}
                onChange={(e) =>
                  setStoreProfile((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="store-slug"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Used in URLs. Use lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <Input
                value={storeProfile.location}
                onChange={(e) =>
                  setStoreProfile((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Store Logo
          </h3>

          <FileUpload value={logo} onChange={setLogo} accept="image/*" />
        </div>
      </div>

      {/* Store QR Code */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Store QR Code
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <QRPreview slug={storeProfile.slug} />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {storeProfile.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                /{storeProfile.slug}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Display this QR code in your store for customers to scan and
                request visit approval.
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleDownloadQR}>
            <Download className="w-4 h-4 mr-2" />
            Download QR
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Notifications
        </h3>

        <div className="space-y-4">
          <Toggle
            checked={notifications.visitPending}
            onChange={handleNotificationChange("visitPending")}
            label="Visit Request Pending"
            description="Get notified when a customer requests visit approval"
          />

          <Toggle
            checked={notifications.rewardEarned}
            onChange={handleNotificationChange("rewardEarned")}
            label="Reward Earned"
            description="Get notified when customers earn rewards"
          />

          <Toggle
            checked={notifications.tierWarnings}
            onChange={handleNotificationChange("tierWarnings")}
            label="Tier Warnings"
            description="Get notified about tier limits and upgrade opportunities"
          />
        </div>
      </div>

      {/* Loyalty Program Control */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Loyalty Program
        </h3>

        <Toggle
          checked={!storeMeta.paused}
          onChange={(value) =>
            setStoreMeta((prev) => ({ ...prev, paused: !value }))
          }
          label="Program Active"
          description={
            storeMeta.paused
              ? "Loyalty program is paused"
              : "Loyalty program is active"
          }
        />

        {storeMeta.paused && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              When paused, customers cannot earn or redeem points, but existing
              data is preserved.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
