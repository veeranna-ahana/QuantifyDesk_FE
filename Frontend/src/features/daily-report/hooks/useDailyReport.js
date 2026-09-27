import { useState } from 'react';
import toast from 'react-hot-toast';

import { MOCK_GLOBAL_TABS, MOCK_METRICS, MOCK_PROJECTS } from '../mock/mockDailyReport';

const pad = (n) => String(n).padStart(2, '0');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-08-22" -> "Today • Aug 22, 2026" */
export function formatReportDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Today • Aug 22, 2026';
  return `Today • ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Page-level state for the Daily Report: status tab, search, report date, CSV export. */
export function useDailyReport() {
  const [globalTab, setGlobalTab] = useState('In Progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportDate, setReportDate] = useState('2026-08-22');

  const shiftDate = (days) => {
    const d = new Date(reportDate);
    d.setDate(d.getDate() + days);
    setReportDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  const exportCsv = () => {
    toast.success('Exporting daily report (CSV/Excel)...');
    const rows = [['Project', 'Task Name', 'Classification', 'Owner', 'Planned Start', 'Planned End', 'Status']];
    MOCK_PROJECTS.forEach((proj) => proj.tasks.forEach((t) => rows.push([proj.name, `"${t.taskName}"`, t.classification, t.ownerName, t.plannedStart, t.plannedEnd, t.status])));
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Daily_Report_${reportDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { metrics: MOCK_METRICS, tabs: MOCK_GLOBAL_TABS, projects: MOCK_PROJECTS, globalTab, setGlobalTab, searchQuery, setSearchQuery, reportDate, setReportDate, shiftDate, exportCsv };
}
