"use client";
import Toggle from "@/components/ui/Toggle";

export default function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex items-start justify-between py-4 ${className}`}>
      <div className="flex-1 mr-4">
        <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
