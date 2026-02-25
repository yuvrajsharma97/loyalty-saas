"use client";
import { useState } from "react";
import { Calendar } from "lucide-react";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

export default function RangeDatePicker({
  value = { start: "", end: "" },
  onChange,
  presets = true,
  className = ""
}) {
  const [mode, setMode] = useState("preset");

  const presetOptions = [
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 30 days", value: "last30days" },
  { label: "Last 90 days", value: "last90days" },
  { label: "This month", value: "thismonth" },
  { label: "Last month", value: "lastmonth" },
  { label: "Custom range", value: "custom" }];


  const handlePresetChange = (preset) => {
    if (preset === "custom") {
      setMode("custom");
      return;
    }

    const today = new Date();
    let start, end;

    switch (preset) {
      case "last7days":
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case "last30days":
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case "last90days":
        start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case "thismonth":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;
      case "lastmonth":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    onChange?.({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0]
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {presets &&
      <Select
        value={mode === "custom" ? "custom" : ""}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "custom") {
            setMode("custom");
          } else {
            setMode("preset");
            handlePresetChange(value);
          }
        }}>
          <option value="">Select date range</option>
          {presetOptions.map((option) =>
        <option key={option.value} value={option.value}>
              {option.label}
            </option>
        )}
        </Select>
      }

      {mode === "custom" &&
      <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
              type="date"
              value={value.start}
              onChange={(e) =>
              onChange?.({ ...value, start: e.target.value })
              }
              className="pl-10" />
            
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
              type="date"
              value={value.end}
              onChange={(e) => onChange?.({ ...value, end: e.target.value })}
              className="pl-10" />
            
            </div>
          </div>
        </div>
      }
    </div>);

}