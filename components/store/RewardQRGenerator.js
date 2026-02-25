"use client";
import { useState, useEffect } from "react";
import { Download, QrCode, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Banner from "@/components/ui/Banner";

export default function RewardQRGenerator({ storeId, storeName: initialStoreName }) {
  const [formData, setFormData] = useState({
    storeName: initialStoreName || "",
    storeEmail: ""
  });
  const [qrCode, setQrCode] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [existingQR, setExistingQR] = useState(null);


  useEffect(() => {
    fetchExistingQR();
  }, []);

  const fetchExistingQR = async () => {
    try {
      const response = await fetch("/api/store/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.store?.rewardQRCode) {
          setExistingQR(data.store.rewardQRCode);
          setQrCode(data.store.rewardQRCode);
          setFormData((prev) => ({
            ...prev,
            storeName: data.store.name || prev.storeName,
            storeEmail: data.store.rewardQREmail || prev.storeEmail
          }));
          const baseUrl = window.location.origin;
          setQrUrl(`${baseUrl}/store/${data.store._id}/claim-reward`);
        }
      }
    } catch (err) {
      console.error("Error fetching existing QR code:", err);
    }
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/store/generate-reward-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate QR code");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setQrUrl(data.qrUrl);
      setExistingQR(data.qrCode);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${formData.storeName.replace(/\s+/g, "-")}-reward-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <QrCode className="w-6 h-6 text-[#014421]" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Reward Claim QR Code
        </h2>
      </div>

      {error &&
      <Banner type="error" message={error} onDismiss={() => setError(null)} />
      }

      {success &&
      <Banner
        type="success"
        message="QR code generated successfully!"
        onDismiss={() => setSuccess(false)} />

      }

      <div className="grid md:grid-cols-2 gap-6">
        {}
        <div>
          <form onSubmit={handleGenerateQR} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Name
              </label>
              <Input
                required
                value={formData.storeName}
                onChange={(e) =>
                setFormData((prev) => ({ ...prev, storeName: e.target.value }))
                }
                placeholder="Enter your store name" />
              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Email
              </label>
              <Input
                type="email"
                required
                value={formData.storeEmail}
                onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  storeEmail: e.target.value
                }))
                }
                placeholder="store@example.com" />
              
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Users scan this QR to request rewards</li>
                <li>They must login before making a request</li>
                <li>All requests require your approval</li>
                <li>QR code is unique to your store</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              icon={existingQR ? RefreshCw : QrCode}>
              {loading ?
              "Generating..." :
              existingQR ?
              "Regenerate QR Code" :
              "Generate QR Code"}
            </Button>
          </form>
        </div>

        {}
        <div>
          {qrCode ?
          <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-6 flex items-center justify-center">
                <img
                src={qrCode}
                alt="Reward Claim QR Code"
                className="w-64 h-64 rounded-lg" />
              
              </div>

              {qrUrl &&
            <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    QR Code URL:
                  </p>
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all bg-gray-50 dark:bg-zinc-900 p-2 rounded">
                    {qrUrl}
                  </p>
                </div>
            }

              <Button
              onClick={handleDownloadQR}
              variant="secondary"
              icon={Download}
              className="w-full">
                Download QR Code
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Print this QR code and display it at your store for customers to
                scan and request rewards.
              </p>
            </div> :

          <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
              <QrCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Fill in the form and click generate to create your reward claim QR
                code.
              </p>
            </div>
          }
        </div>
      </div>
    </div>);

}