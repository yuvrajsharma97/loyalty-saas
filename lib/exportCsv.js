export function exportCsv(data, filename = "export.csv", columns = null) {
  if (!data || data.length === 0) return;


  const headers = columns || Object.keys(data[0]);


  const csvContent = [
  headers.join(","),
  ...data.map((row) =>
  headers.
  map((header) => {
    const value = row[header] || "";

    return typeof value === "string" && (
    value.includes(",") || value.includes('"')) ?
    `"${value.replace(/"/g, '""')}"` :
    value;
  }).
  join(",")
  )].
  join("\n");


  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}