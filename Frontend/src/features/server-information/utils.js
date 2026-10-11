// Builds the Server Information CSV (opens in Excel) and triggers the download.

const COLUMNS = [
  ["Server Name", (s) => s.serverName],
  ["IP Address", (s) => s.ipAddress],
  ["RAM", (s) => s.ram],
  ["CPU", (s) => s.cpu],
  ["Storage", (s) => s.storage],
  ["OS", (s) => s.os],
  ["Environment", (s) => s.environment],
  ["GPU", (s) => s.gpu],
  ["Status", (s) => s.status],
  ["Assigned Projects", (s) => (s.assignedProjects || []).join("; ")],
  ["Description", (s) => s.description],
];

const escapeCell = (value) => {
  let text = String(value ?? "");
  // Stop Excel treating a cell as a formula
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function buildServersCsv(servers) {
  const lines = [
    COLUMNS.map(([title]) => escapeCell(title)).join(","),
    ...servers.map((s) =>
      COLUMNS.map(([, get]) => escapeCell(get(s))).join(","),
    ),
  ];
  return lines.join("\r\n");
}

export function downloadCsv(csv, filename) {
  // The BOM makes Excel read the file as UTF-8
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
