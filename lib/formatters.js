export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB");
}

export function formatDateTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-GB");
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "£0.00";
  const num =
  typeof amount === "string" ? parseFloat(amount.replace("£", "")) : amount;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(num);
}

export function formatPoints(points) {
  if (!points) return "0";
  return points.toLocaleString();
}