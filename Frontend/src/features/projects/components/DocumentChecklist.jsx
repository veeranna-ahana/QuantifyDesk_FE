import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Check,
  ClipboardCheck,
  Code,
  Database,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Layers,
  Link2,
  ListChecks,
  Palette,
  Pencil,
  Plus,
  Rocket,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { statusVariant } from "@/lib/status";

import { useCurrentUser } from "../hooks/useCurrentUser";
import { useDocumentChecklist } from "../hooks/useDocumentChecklist";
import { getDocumentMaster } from "../services/importProjectService";

import { DocumentLinkModal } from "./DocumentLinkModal";
import { ProjectContextBar } from "./ProjectContextBar";

const DOC_ICONS = {
  "file-text": FileText,
  sheet: FileSpreadsheet,
  layers: Layers,
  database: Database,
  code: Code,
  design: Palette,
  clipboard: ClipboardCheck,
  list: ListChecks,
  shield: ShieldCheck,
  check: CheckCircle2,
  tag: Tag,
  alert: AlertTriangle,
  book: BookOpen,
  git: GitBranch,
};

// document_master only returns document_id + document_name — this maps the fixed, known names
// to a display icon. Any name that isn't in this list (a custom document type someone's DB
// added) just falls back to the generic file icon rather than breaking.
const ICON_BY_DOC_NAME = {
  "brd or cr": "file-text",
  "proposal document": "file-text",
  "effort estimate": "sheet",
  "solution architecture": "layers",
  "db design document": "database",
  "swagger api document": "code",
  "ui/ux": "design",
  "test plan": "clipboard",
  "testcase document": "list",
  "qa signoff": "shield",
  "uat signoff": "check",
  "technical design document": "code",
  "release notes": "tag",
  "risk registry": "alert",
  "user manual": "book",
  "git repository link": "git",
};

const EMPTY_PROJECT_CONTEXT = { projectName: "", pmsId: "" };

/** document_master row -> the checklist row shape this component/hook works with, all "Pending". */
function toPendingRow(doc) {
  return {
    id: `doc-${doc.document_id}`,
    documentId: doc.document_id,
    name: doc.document_name,
    icon:
      ICON_BY_DOC_NAME[String(doc.document_name).toLowerCase()] || "file-text",
    status: "Pending",
    uploadedBy: "—",
    uploadDate: "—",
    link: "",
  };
}

/**
 * Document checklist, shared by:
 *   mode="import" - wizard step 4 (Pending docs, "Add Link", Back / Create Project)
 *   mode="edit"   - project edit tab (open + edit-link icons, Add Document, Back / Save changes)
 *   mode="view"   - project view tab (open-link icon only)
 *
 * `docs`/`onDocsChange`: the caller's own lifted state (same controlled pattern as
 * useTaskInfo/useEffortEstimate), so edits survive this component unmounting (wizard step
 * navigation, or switching tabs on the View/Edit screen).
 *   - import mode: seeded from the real document_master list (`getDocumentMaster`) — there's no
 *     project_info_id yet, so links here only update this in-memory table; the whole array rides
 *     along in the Create Project payload, and the backend does the real persisting.
 *   - edit/view modes: seeded by the caller from the real per-project view API
 *     (`documentsWithStatus`, mapped via mapViewToDocuments) — no mock fallback.
 */
export function DocumentChecklist({
  mode,
  onBack,
  onSubmit,
  docs: docsProp,
  onDocsChange,
  submitting = false,
  projectContext = EMPTY_PROJECT_CONTEXT,
}) {
  const { empName } = useCurrentUser();
  const isImport = mode === "import";

  const docMasterQuery = useQuery({
    queryKey: ["document-master"],
    queryFn: async () => (await getDocumentMaster())?.documents || [],
    enabled: isImport,
    staleTime: 5 * 60 * 1000,
  });

  // Seed the wizard's docs state from document_master the first time it loads (docsProp starts
  // empty, same "only role headers first" idea as Effort Estimate) — done via a ref-free guard
  // (only seed while docsProp is still empty) rather than an effect, so it stays a plain render.
  const seededDocs = useMemo(() => {
    if (!isImport) return docsProp;
    if (docsProp && docsProp.length > 0) return docsProp;
    return (docMasterQuery.data || []).map(toPendingRow);
  }, [isImport, docsProp, docMasterQuery.data]);

  const [localDocs, setLocalDocs] = useState(seededDocs || []);
  const controlled = Boolean(onDocsChange);
  const effectiveDocs = controlled ? seededDocs : localDocs;
  const setEffectiveDocs = controlled ? onDocsChange : setLocalDocs;

  const doc = useDocumentChecklist(effectiveDocs, setEffectiveDocs, empName);
  const [modal, setModal] = useState(null); // { kind: 'link' | 'edit' | 'newDoc', doc? }
  const canEdit = mode !== "view";

  const handleModalSubmit = ({ name, url }) => {
    if (modal.kind === "newDoc") doc.addDocument(name, url);
    else doc.setLink(modal.doc.id, url, { isEdit: modal.kind === "edit" });
    setModal(null);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {modal && (
        <DocumentLinkModal
          kind={modal.kind}
          doc={modal.doc}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
        />
      )}

      <Card className="overflow-hidden">
        {mode === "import" && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <h2 className="text-sm font-semibold text-ink-primary">
              Document Checklist
            </h2>
            <ProjectContextBar {...projectContext} />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 text-xs font-medium text-badge-success-ink">
            <span className="inline-flex items-center gap-1.5">
              {doc.uploadedCount === doc.docs.length && doc.docs.length > 0 && (
                <Check className="h-3.5 w-3.5" />
              )}
              {doc.uploadedCount} of {doc.docs.length} documents uploaded
            </span>
            <ProgressBar value={doc.progress} tone="success" className="w-40" />
          </div>
          {canEdit && (
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setModal({ kind: "newDoc" })}
            >
              Add Document
            </Button>
          )}
        </div>

        <Table className="min-w-[640px]">
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeaderCell>Document Name</TableHeaderCell>
              <TableHeaderCell className="text-center">
                Uploaded By
              </TableHeaderCell>
              <TableHeaderCell className="text-center">
                Upload Date
              </TableHeaderCell>
              <TableHeaderCell className="text-center">Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doc.docs.map((d) => {
              const Icon = DOC_ICONS[d.icon] ?? FileText;
              return (
                <TableRow key={d.id}>
                  <TableCell>
                    <span className="flex items-center gap-2 font-medium">
                      <Icon
                        className="h-4 w-4 text-action-primary"
                        aria-hidden="true"
                      />
                      {d.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-ink-secondary">
                    {d.uploadedBy}
                  </TableCell>
                  <TableCell className="text-center text-ink-secondary">
                    {d.uploadDate}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariant(d.status)} dot size="sm">
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-1">
                      {d.status === "Pending" ? (
                        // View mode is read-only: a Pending doc has no link to open yet, and
                        // "Add Link" is an edit action, so it only shows for import/edit modes.
                        canEdit ? (
                          <button
                            type="button"
                            onClick={() => setModal({ kind: "link", doc: d })}
                            className="inline-flex items-center gap-1 text-xs font-medium text-action-primary hover:underline"
                          >
                            <Link2 className="h-3.5 w-3.5" /> Add Link
                          </button>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )
                      ) : (
                        <IconButton
                          label={`Open ${d.name}`}
                          onClick={() =>
                            d.link &&
                            window.open(d.link, "_blank", "noopener,noreferrer")
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </IconButton>
                      )}
                      {mode === "edit" && d.status !== "Pending" && (
                        <IconButton
                          label={`Edit link for ${d.name}`}
                          variant="neutral"
                          onClick={() => setModal({ kind: "edit", doc: d })}
                        >
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {canEdit && (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          {mode === "import" ? (
            <Button
              isLoading={submitting}
              disabled={submitting}
              rightIcon={<Rocket className="h-4 w-4" />}
              onClick={onSubmit}
            >
              Create Project
            </Button>
          ) : (
            <Button onClick={onSubmit}>Save changes</Button>
          )}
        </div>
      )}
    </div>
  );
}
