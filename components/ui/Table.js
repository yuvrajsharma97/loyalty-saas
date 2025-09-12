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
  // DaisyUI table classes
  const tableClasses = [
    "table",
    size === "xs" && "table-xs",
    size === "sm" && "table-sm",
    size === "lg" && "table-lg",
    zebra && "table-zebra",
    hover && "hover",
    compact && "table-compact",
  ].filter(Boolean);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/60">No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#D0D8C3]/30 shadow-sm">
      <table className={`${tableClasses.join(" ")} ${className}`} {...props}>
        <thead className="bg-[#D0D8C3]/20">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="font-semibold text-[#014421] border-b border-[#D0D8C3]/30">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index} className="hover:bg-[#D0D8C3]/10 transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="border-b border-[#D0D8C3]/20">
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
