"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Gift, Store, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Banner from "@/components/ui/Banner";
import Modal from "@/components/ui/Modal";

export default function ClaimRewardPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningStore, setJoiningStore] = useState(false);
  const [claimForm, setClaimForm] = useState({
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const storeId = params.storeId;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/store/${storeId}/claim-reward`);
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "user") {
      setError("Only users can claim rewards");
      setLoading(false);
      return;
    }

    if (status === "authenticated") {
      fetchStoreAndCheckConnection();
    }
  }, [status, session, storeId]);

  const fetchStoreAndCheckConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch store details
      const storeResponse = await fetch(`/api/stores/${storeId}`);
      if (!storeResponse.ok) {
        throw new Error("Store not found");
      }
      const storeData = await storeResponse.json();
      setStore(storeData.store);

      // Check if user is connected to this store
      const connectedResponse = await fetch("/api/user/stores");
      if (connectedResponse.ok) {
        const connectedData = await connectedResponse.json();
        const connected = connectedData.stores?.some(
          (s) => s.id === storeId || s._id === storeId
        );
        setIsConnected(connected);

        // Show join modal if not connected
        if (!connected) {
          setShowJoinModal(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinStore = async () => {
    try {
      setJoiningStore(true);
      const response = await fetch("/api/user/stores/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join store");
      }

      setIsConnected(true);
      setShowJoinModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setJoiningStore(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      setError("You must join this store first");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/user/reward-claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          message: claimForm.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit claim");
      }

      setSubmitSuccess(true);
      setClaimForm({ message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#014421] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Banner
            type="error"
            title="Error"
            message={error}
            dismissible={false}
          />
          <Button
            onClick={() => router.push("/user/dashboard")}
            className="mt-4 w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Claim Submitted!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your reward claim has been submitted to{" "}
            <span className="font-semibold">{store?.name}</span>. You'll be
            notified once it's reviewed.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/user/dashboard")}
              className="w-full">
              Go to Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSubmitSuccess(false);
                setClaimForm({ message: "" });
              }}
              className="w-full">
              Submit Another Claim
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-6">
            <Banner type="error" message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Store Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#014421] rounded-lg flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {store?.name || "Store"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Request a reward from this store
              </p>
            </div>
          </div>

          {isConnected && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Connected to {store?.name}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  You can now submit reward claims
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Claim Form */}
        {isConnected && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-[#014421]" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Submit Reward Claim
              </h2>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={claimForm.message}
                  onChange={(e) =>
                    setClaimForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Add a note about your reward claim..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {claimForm.message.length}/500 characters
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">Important Information</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Your claim will be reviewed by the store</li>
                      <li>You'll receive a notification once it's processed</li>
                      <li>Store admin can approve or reject your request</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
                icon={submitting ? Loader2 : Gift}>
                {submitting ? "Submitting..." : "Submit Claim Request"}
              </Button>
            </form>
          </div>
        )}

        {/* Join Store Modal */}
        <Modal
          isOpen={showJoinModal}
          onClose={() => !joiningStore && setShowJoinModal(false)}
          title={`Join ${store?.name || "Store"}?`}
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => router.push("/user/dashboard")}
                disabled={joiningStore}>
                Cancel
              </Button>
              <Button onClick={handleJoinStore} disabled={joiningStore}>
                {joiningStore ? "Joining..." : "Join Store"}
              </Button>
            </>
          }>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              You need to join <strong>{store?.name}</strong> before you can
              request rewards.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By joining, you'll be able to:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                <li>Submit reward claim requests</li>
                <li>Earn and track loyalty points</li>
                <li>Redeem rewards at this store</li>
              </ul>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
