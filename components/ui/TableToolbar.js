import { Search, Filter, Download } from "lucide-react";
import Input from "./Input";
import Select from "./Select";
import Button from "./Button";

export default function TableToolbar({
  searchValue,
  onSearchChange,
  filters = [],
  actions = [],
  className = "",
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 ${className}`}>
      {/* Left side - Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={onSearchChange}
            className="pl-10 w-full sm:w-64"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter, index) => (
            <div key={index} className="min-w-32">
              {filter}
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex gap-2 flex-wrap">
        {actions.map((action, index) => (
          <div key={index}>{action}</div>
        ))}
      </div>
    </div>
  );
}
