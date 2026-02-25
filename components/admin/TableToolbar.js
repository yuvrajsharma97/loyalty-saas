import { Search } from "lucide-react";

export default function TableToolbar({
  searchValue,
  onSearchChange,
  filters = [],
  actions = [],
  className = ""
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 ${className}`}>
      {}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            value={searchValue}
            onChange={onSearchChange}
            className="input input-bordered h-10 w-full sm:w-64 pl-10 border-[#D0D8C3]/40 bg-white dark:bg-zinc-800 dark:border-zinc-600 text-gray-900 dark:text-white focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20" />

        </div>

        {}
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter, index) =>
          <div key={index} className="min-w-32">
              {filter}
            </div>
          )}
        </div>
      </div>

      {}
      <div className="flex gap-2 flex-wrap">
        {actions.map((action, index) =>
        <div key={index}>{action}</div>
        )}
      </div>
    </div>);

}