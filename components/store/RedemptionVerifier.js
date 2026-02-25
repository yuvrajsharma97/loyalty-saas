import { useState } from "react";
import { CheckCircle, XCircle, Search, Gift } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function RedemptionVerifier({ storeId }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 8) {
      setError("Please enter a valid 8-digit code");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setVerification(null);
      setSuccess(null);

      const response = await fetch('/api/store/verify-redemption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storeId,
          code: code.trim()
        })
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      setVerification(data.data.redemption);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCode = async () => {
    if (!verification) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/store/use-redemption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storeId,
          code: verification.code
        })
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to mark code as used');
      }

      setSuccess(`Redemption code ${verification.code} has been successfully used!`);
      setVerification((prev) => ({ ...prev, used: true, usedAt: new Date() }));
      setCode("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setVerification(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-[#D0D8C3]/40">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="w-5 h-5 text-[#014421]" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Verify Redemption Code
        </h3>
      </div>

      {}
      {success &&
      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        </div>
      }

      {}
      {error &&
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      }

      {}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            8-Digit Redemption Code
          </label>
          <div className="flex gap-3">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="12345678"
              className="font-mono text-center text-lg tracking-widest"
              maxLength={8} />
            
            <Button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 8}
              variant="secondary"
              className="px-4">
              
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter the 8-digit code from customer's device
          </p>
        </div>

        {}
        {verification &&
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Code Verification Results
              </h4>
              <Badge variant={verification.used ? "secondary" : "success"}>
                {verification.used ? "Already Used" : "Valid"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {verification.userName}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  {verification.userEmail}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Reward Value:</span>
                <p className="font-semibold text-[#014421] text-lg">
                  {formatCurrency(verification.rewardValueGBP)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Points Used:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {verification.pointsUsed} points
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Redeemed On:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(verification.redemptionDate)}
                </p>
              </div>
            </div>

            {verification.used && verification.usedAt &&
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Used on:</span>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {formatDate(verification.usedAt)}
                </p>
              </div>
          }

            {}
            <div className="flex gap-3 mt-6">
              {!verification.used ?
            <Button
              onClick={handleUseCode}
              disabled={loading}
              className="flex-1"
              isLoading={loading}>
              
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Used & Complete Redemption
                </Button> :

            <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This redemption has already been completed
                  </p>
                </div>
            }
              <Button
              onClick={handleReset}
              variant="secondary"
              disabled={loading}>
              
                Reset
              </Button>
            </div>
          </div>
        }
      </div>
    </div>);

}