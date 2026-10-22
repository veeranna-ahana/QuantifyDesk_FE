const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export function formatINR(value) {
  return inrFormatter.format(Number(value) || 0);
}

export function formatCategory(value) {
  return typeof value === "string"
    ? value.replace(/\s*:\s*/g, ":").trim()
    : "";
}
