"use client";
import { useState } from "react";
import { Calculator, Settings, Pause, Play } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import Banner from "@/components/ui/Banner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatCurrency } from "@/lib/formatters";

export default function StoreRewards() {
  const [rewardConfig, setRewardConfig] = useState(
    MOCK_STORE_META.rewardConfig
  );
  const [paused, setPaused] = useState(MOCK_STORE_META.paused);
  const [editConfig, setEditConfig] = useState({
    ...MOCK_STORE_META.rewardConfig,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  // Calculator state
  const [exampleSpend, setExampleSpend] = useState("");
  const [exampleVisits, setExampleVisits] = useState("");

  const handleSaveConfig = () => {
    setRewardConfig({ ...editConfig });
    setSuccessBanner("Reward configuration updated successfully.");
    setShowConfirmDialog(false);
  };

  const handleTogglePause = () => {
    setPaused(!paused);
    setSuccessBanner(
      `Loyalty program ${paused ? "resumed" : "paused"} successfully.`
    );
  };

  // Calculate projected points and value
  const calculatePoints = () => {
    const spend = parseFloat(exampleSpend) || 0;
    const visits = parseInt(exampleVisits) || 0;

    let points = 0;
    if (rewardConfig.type === "spend" || rewardConfig.type === "hybrid") {
      points += spend * rewardConfig.pointsPerPound;
    }
    if (rewardConfig.type === "visit" || rewardConfig.type === "hybrid") {
      points += visits * rewardConfig.pointsPerVisit;
    }

    return points;
  };

  const projectedPoints = calculatePoints();
  const redeemableValue = projectedPoints / rewardConfig.conversionRate;

  return (
    <div className="space-y-6">
      {successBanner && (
        <Banner
          type="success"
          message={successBanner}
          onDismiss={() => setSuccessBanner("")}
        />
      )}

      {paused && (
        <Banner
          type="warning"
          title="Loyalty Program Paused"
          message="Your loyalty program is currently paused. Customers cannot earn or redeem points."
          dismissible={false}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Reward Configuration
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Config */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Configuration
            </h3>
            {paused ? (
              <Button
                variant="secondary"
                onClick={handleTogglePause}
                className="text-green-600 hover:text-green-700">
                <Play className="w-4 h-4 mr-2" />
                Resume Program
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleTogglePause}
                className="text-yellow-600 hover:text-yellow-700">
                <Pause className="w-4 h-4 mr-2" />
                Pause Program
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Type
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {rewardConfig.type}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Points per £
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rewardConfig.pointsPerPound}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Points per Visit
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rewardConfig.pointsPerVisit}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rewardConfig.conversionRate} points = £1
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Config */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Configuration
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reward Type
              </label>
              <Select
                value={editConfig.type}
                onChange={(e) =>
                  setEditConfig((prev) => ({ ...prev, type: e.target.value }))
                }>
                <option value="spend">Spend-based</option>
                <option value="visit">Visit-based</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Points per £
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editConfig.pointsPerPound}
                  onChange={(e) =>
                    setEditConfig((prev) => ({
                      ...prev,
                      pointsPerPound: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Points per Visit
                </label>
                <Input
                  type="number"
                  min="0"
                  value={editConfig.pointsPerVisit}
                  onChange={(e) =>
                    setEditConfig((prev) => ({
                      ...prev,
                      pointsPerVisit: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversion Rate (points per £1)
              </label>
              <Input
                type="number"
                min="1"
                value={editConfig.conversionRate}
                onChange={(e) =>
                  setEditConfig((prev) => ({
                    ...prev,
                    conversionRate: parseInt(e.target.value) || 100,
                  }))
                }
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Higher numbers mean customers need more points to redeem £1
              </p>
            </div>

            <Button
              onClick={() => setShowConfirmDialog(true)}
              className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Calculator */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center mb-4">
          <Calculator className="w-5 h-5 text-[#014421] dark:text-[#D0D8C3] mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preview Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Example Spend (£)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={exampleSpend}
              onChange={(e) => setExampleSpend(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Example Visits
            </label>
            <Input
              type="number"
              min="0"
              value={exampleVisits}
              onChange={(e) => setExampleVisits(e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Projected Points
            </label>
            <div className="px-3 py-2 bg-[#D0D8C3]/10 dark:bg-[#014421]/10 rounded-lg">
              <span className="text-lg font-semibold text-[#014421] dark:text-[#D0D8C3]">
                {projectedPoints.toFixed(0)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Redeemable Value
            </label>
            <div className="px-3 py-2 bg-[#D0D8C3]/10 dark:bg-[#014421]/10 rounded-lg">
              <span className="text-lg font-semibold text-[#014421] dark:text-[#D0D8C3]">
                {formatCurrency(redeemableValue)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Calculation:</strong> Based on current configuration,
            {rewardConfig.type === "spend" &&
              ` spending ${formatCurrency(
                parseFloat(exampleSpend) || 0
              )} earns ${(
                (parseFloat(exampleSpend) || 0) * rewardConfig.pointsPerPound
              ).toFixed(0)} points.`}
            {rewardConfig.type === "visit" &&
              ` ${parseInt(exampleVisits) || 0} visits earn ${(
                (parseInt(exampleVisits) || 0) * rewardConfig.pointsPerVisit
              ).toFixed(0)} points.`}
            {rewardConfig.type === "hybrid" &&
              ` spending ${formatCurrency(parseFloat(exampleSpend) || 0)} + ${
                parseInt(exampleVisits) || 0
              } visits earn ${projectedPoints.toFixed(0)} points total.`}
          </p>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleSaveConfig}
        title="Update Reward Configuration"
        message="Are you sure you want to update the reward configuration? This will affect how customers earn and redeem points going forward."
        confirmLabel="Update Configuration"
      />
    </div>
  );
}
