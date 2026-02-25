import { ChevronUp, ChevronDown } from "lucide-react";
import EmptyState from "./EmptyState";

export default function DataTable({
  columns,
  data,
  sortBy,
  sortDirection,
  onSort,
  emptyState,
  className = ""
}) {
  const handleSort = (columnKey) => {
    if (onSort && columns.find((col) => col.key === columnKey)?.sortable) {
      const newDirection =
      sortBy === columnKey && sortDirection === "asc" ? "desc" : "asc";
      onSort(columnKey, newDirection);
    }
  };

  if (!data || data.length === 0) {
    return (
      emptyState ||
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md">
          <EmptyState
          title="No data"
          description="No items found matching your criteria." />
        
        </div>);


  }

  return (
    <div
      className={`bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-zinc-700">
            <tr>
              {columns.map((column) =>
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                column.sortable ?
                "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" :
                ""}`
                }
                onClick={() => handleSort(column.key)}>
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable &&
                  sortBy === column.key && (
                  sortDirection === "asc" ?
                  <ChevronUp className="w-4 h-4" /> :

                  <ChevronDown className="w-4 h-4" />)
                  }
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
            {data.map((row, index) =>
            <tr
              key={row.id || index}
              className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                {columns.map((column) =>
              <td
                key={column.key}
                className="px-6 py-4 whitespace-nowrap text-sm">
                    {column.render ?
                column.render(row[column.key], row) :
                row[column.key]}
                  </td>
              )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}