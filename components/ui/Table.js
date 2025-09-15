export default function Table({
  columns,
  data,
  size = "md",
  zebra = false,
  hover = true,
  compact = false,
  className = "",
  ...props
}) {
  // Custom size styling
  const getSizeClasses = (size, compact) => {
    if (compact) return "text-xs";

    switch (size) {
      case "xs":
        return "text-xs";
      case "sm":
        return "text-sm";
      case "md":
        return "text-sm";
      case "lg":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  const getPaddingClasses = (size, compact) => {
    if (compact) return "px-2 py-1";

    switch (size) {
      case "xs":
        return "px-2 py-1";
      case "sm":
        return "px-3 py-2";
      case "md":
        return "px-4 py-3";
      case "lg":
        return "px-6 py-4";
      default:
        return "px-4 py-3";
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/30 shadow-lg bg-white/95 backdrop-blur-lg">
      <table className={`w-full ${getSizeClasses(size, compact)} ${className}`} {...props}>
        <thead className="bg-[#D0D8C3]/20 backdrop-blur-sm">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`font-semibold text-[#014421] border-b border-[#D0D8C3]/30 text-left ${getPaddingClasses(size, compact)}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className={`
                border-b border-[#D0D8C3]/20
                ${hover ? "hover:bg-[#D0D8C3]/10 transition-colors duration-150" : ""}
                ${zebra && index % 2 === 1 ? "bg-gray-50/50" : ""}
              `}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`text-gray-900 ${getPaddingClasses(size, compact)}`}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
