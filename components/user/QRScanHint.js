import { QrCode, Smartphone, CheckCircle } from "lucide-react";

export default function QRScanHint({ className = "" }) {
  return (
    <div
      className={`bg-[#D0D8C3]/10 dark:bg-[#014421]/10 rounded-xl p-6 border border-[#D0D8C3] dark:border-[#014421]/40 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#014421] rounded-xl">
          <QrCode className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            How to Scan Store QR
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#014421] rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find the store&apos;s QR code at checkout or displayed in-store
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#014421] rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Smartphone className="w-4 h-4" />
                Scan with your device camera or QR scanner app
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#014421] rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Store owner approves your visit and points are earned
                automatically
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Your visit request will appear as &ldquo;Pending&rdquo;
              until the store approves it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
