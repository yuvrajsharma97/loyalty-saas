import { useState } from "react";
import { X, Gift, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function RedeemPointsModal({
  isOpen,
  onClose,
  store,
  userPoints,
  onRedemptionSuccess
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);
  const [error, setError] = useState(null);

  const conversionRate = store?.rewardConfig?.conversionRate || 100;
  const availableRewardValue = Math.floor(userPoints / conversionRate);
  const pointsToUse = availableRewardValue * conversionRate;

  const handleRedeem = async () => {
    if (availableRewardValue <= 0) {
      setError("Insufficient points for redemption");
      return;
    }

    if (!store || !store.id) {
      setError("Store information is missing");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: store.id,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to redeem points');
      }

      setRedemptionResult(data.data);
      onRedemptionSuccess && onRedemptionSuccess(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRedemptionResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-6">
        {redemptionResult ? (
          // Success State
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Redemption Successful!
            </h3>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <div className="text-3xl font-bold text-[#014421] mb-2">
                {redemptionResult.code}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show this code to the store staff
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex justify-between">
                <span>Reward Value:</span>
                <span className="font-semibold">£{redemptionResult.rewardValueGBP}</span>
              </div>
              <div className="flex justify-between">
                <span>Points Used:</span>
                <span>{redemptionResult.pointsUsed} points</span>
              </div>
              <div className="flex justify-between">
                <span>Store:</span>
                <span>{store.name}</span>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          // Redemption Form
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Redeem Points
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="text-center p-6 bg-gradient-to-r from-[#014421] to-[#2e7d4a] rounded-lg text-white mb-4">
                <Gift className="w-12 h-12 mx-auto mb-2" />
                <div className="text-2xl font-bold">£{availableRewardValue}</div>
                <div className="text-sm opacity-90">Available to redeem</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Your Points:</span>
                  <span className="font-semibold">{userPoints} points</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Points to Use:</span>
                  <span className="font-semibold">{pointsToUse} points</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                  <span className="font-semibold">{userPoints - pointsToUse} points</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Conversion Rate:</span>
                  <span className="font-semibold">{conversionRate} points = £1</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRedeem}
                className="flex-1"
                disabled={isLoading || availableRewardValue <= 0}
                isLoading={isLoading}
              >
                {availableRewardValue <= 0 ? 'Insufficient Points' : `Redeem £${availableRewardValue}`}
              </Button>
            </div>

            {availableRewardValue <= 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                You need at least {conversionRate} points to redeem £1
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}