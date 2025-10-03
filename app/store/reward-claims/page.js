"use client";
import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, Clock, User, Mail, MessageSquare, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import Banner from "@/components/ui/Banner";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

export default function RewardClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/store/reward-claims");
      if (!response.ok) {
        throw new Error("Failed to fetch reward claims");
      }

      const data = await response.json();
      setClaims(data.claims || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId) => {
    if (!confirm("Are you sure you want to approve this reward claim?")) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch(`/api/store/reward-claims/${claimId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve claim");
      }

      setSuccess("Reward claim approved successfully");
      fetchClaims();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch(`/api/store/reward-claims/${selectedClaim.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject claim");
      }

      setSuccess("Reward claim rejected");
      setShowRejectModal(false);
      setSelectedClaim(null);
      setRejectionReason("");
      fetchClaims();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (claim) => {
    setSelectedClaim(claim);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingClaims = claims.filter((c) => c.status === "pending");
  const reviewedClaims = claims.filter((c) => c.status !== "pending");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reward Claims
          </h1>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reward Claims
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Review and manage reward claim requests from users
          </p>
        </div>
        <Button
          onClick={fetchClaims}
          variant="secondary"
          icon={RefreshCw}
          disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Banners */}
      {error && (
        <Banner type="error" message={error} onDismiss={() => setError(null)} />
      )}
      {success && (
        <Banner type="success" message={success} onDismiss={() => setSuccess(null)} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {pendingClaims.length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {claims.filter((c) => c.status === "approved").length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {claims.filter((c) => c.status === "rejected").length}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Pending Claims */}
      {pendingClaims.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Requests ({pendingClaims.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-zinc-700">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {claim.userName}
                      </span>
                      {getStatusBadge(claim.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <Mail className="w-4 h-4" />
                      <span>{claim.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(claim.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(claim.id)}
                      disabled={processing}
                      icon={CheckCircle}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openRejectModal(claim)}
                      disabled={processing}
                      icon={XCircle}>
                      Reject
                    </Button>
                  </div>
                </div>
                {claim.message && (
                  <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {claim.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Claims */}
      {reviewedClaims.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reviewed Claims ({reviewedClaims.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-zinc-700">
            {reviewedClaims.map((claim) => (
              <div key={claim.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {claim.userName}
                      </span>
                      {getStatusBadge(claim.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <Mail className="w-4 h-4" />
                      <span>{claim.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Reviewed: {new Date(claim.reviewedAt).toLocaleString()}
                      </span>
                    </div>
                    {claim.message && (
                      <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3 mt-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {claim.message}
                          </p>
                        </div>
                      </div>
                    )}
                    {claim.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3">
                        <p className="text-sm text-red-900 dark:text-red-100">
                          <strong>Rejection Reason:</strong> {claim.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {claims.length === 0 && !loading && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Reward Claims Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Reward claims from users will appear here for review.
          </p>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedClaim(null);
          setRejectionReason("");
        }}
        title="Reject Reward Claim"
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedClaim(null);
                setRejectionReason("");
              }}
              disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={processing || !rejectionReason}>
              {processing ? "Rejecting..." : "Reject Claim"}
            </Button>
          </>
        }>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Please provide a reason for rejecting this reward claim from{" "}
            <strong>{selectedClaim?.userName}</strong>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this claim is being rejected..."
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#014421] focus:border-transparent"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
