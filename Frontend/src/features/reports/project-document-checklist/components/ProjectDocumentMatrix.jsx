import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function ProjectDocumentMatrix({ documents }) {
  return (
    <div className="w-full rounded-lg border border-line-card bg-surface-card p-2.5 xl:h-36">
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:h-[122px] xl:grid-cols-4 xl:grid-rows-4">
        {documents.map((document, index) => (
          <div
            key={document.id}
            className={cn(
              "flex h-[26px] min-w-0 items-center gap-1 rounded-control border px-2",
              document.available
                ? "border-badge-success-line bg-surface-card"
                : "border-badge-danger-line bg-surface-card",
            )}
          >
            <span
              className={cn(
                "shrink-0 text-[10px] font-semibold",
                document.available
                  ? "text-badge-success-ink"
                  : "text-badge-danger-ink",
              )}
            >
              {document.available ? "✓" : "−"}
            </span>
            <span className="min-w-0 flex-1 truncate text-[11px] leading-4 text-ink-secondary">
              {index + 1}. {document.name}
            </span>
            <Badge
              variant={document.available ? "success" : "danger"}
              shape="chip"
              size="sm"
              className="h-4 gap-0 rounded-control border-0 px-1 py-0 text-[9px] leading-4"
            >
              {document.available ? "Available" : "Not Available"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
