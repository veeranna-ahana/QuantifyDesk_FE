import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function ProjectDocumentMatrix({ documents }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
      {documents.map((document, index) => (
        <div
          key={document.id}
          className={cn(
            "flex min-w-0 items-center gap-1.5 rounded-control border px-2 py-1",
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
          <span className="min-w-0 flex-1 truncate text-[10px] text-ink-secondary">
            {index + 1}. {document.name}
          </span>
          <Badge
            variant={document.available ? "success" : "danger"}
            shape="chip"
            size="sm"
            className="px-1 py-0.5 text-[9px]"
          >
            {document.available ? "Available" : "Not Available"}
          </Badge>
        </div>
      ))}
    </div>
  );
}
