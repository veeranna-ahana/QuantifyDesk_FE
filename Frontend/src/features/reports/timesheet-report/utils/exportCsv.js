import toast from "react-hot-toast";

function csvRow(values) {
  return values
    .map((value) => {
      let text = String(value ?? "");
      if (/^[=+\-@]/.test(text)) text = `'${text}`; // keep Excel from reading it as a formula
      return `"${text.replace(/"/g, '""')}"`;
    })
    .join(",");
}

// Shared CSV export used by all 3 Timesheet Report tabs — exports whatever
// rows are passed (already filtered, not just the visible page).
export function exportRowsAsCsv({
  rows,
  header,
  toRow,
  filenamePrefix,
  emptyMessage,
}) {
  try {
    if (!rows || rows.length === 0) {
      toast.error(emptyMessage || "No records to export");
      return;
    }
    const body = rows.map(toRow);
    // The BOM makes Excel read the file as UTF-8
    const blob = new Blob(["﻿", [header, ...body].map(csvRow).join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    toast.error("Failed to export the report");
  }
}
