"use client";
import { ChevronDown } from "lucide-react";
import Select from "@/components/ui/Select";

export default function StoreSwitcher({
  stores,
  currentStore,
  onStoreChange,
  className = ""
}) {
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Current Store
      </label>
      <Select
        value={currentStore}
        onChange={(e) => onStoreChange(e.target.value)}
        className="min-w-48">
        <option value="">All Stores</option>
        {stores?.map((store) =>
        <option key={store.id} value={store.id}>
            {store.name}
          </option>
        )}
      </Select>
    </div>);

}