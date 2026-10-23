import { Button } from "@/components/ui/Button";

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

export function ReportHeader({ onExport }) {
  return (
    <header className="flex h-11 min-h-[44px] flex-none items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="m-0 text-[22px] font-bold leading-7 text-ink-primary">
          Timesheet Report
        </h1>
      </div>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<DownloadIcon />}
        onClick={onExport}
      >
        Export Report
      </Button>
    </header>
  );
}
