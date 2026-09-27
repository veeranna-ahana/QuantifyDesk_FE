import {
  AlertTriangle, BookOpen, CheckCircle2, Check, ClipboardCheck, Code, Database, ExternalLink, FileSpreadsheet, FileText, GitBranch,
  Layers, Link2, ListChecks, Palette, Pencil, Plus, Rocket, ShieldCheck, Tag,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { MOCK_PROJECT_CONTEXT } from '@/features/projects/mock/mockTasks';
import { PENDING_DOCUMENTS, UPLOADED_DOCUMENTS } from '@/features/projects/mock/mockDocuments';
import { statusVariant } from '@/lib/status';

import { useDocumentChecklist } from '../hooks/useDocumentChecklist';

import { DocumentLinkModal } from './DocumentLinkModal';
import { ProjectContextBar } from './ProjectContextBar';

const DOC_ICONS = {
  'file-text': FileText, sheet: FileSpreadsheet, layers: Layers, database: Database, code: Code, design: Palette,
  clipboard: ClipboardCheck, list: ListChecks, shield: ShieldCheck, check: CheckCircle2, tag: Tag, alert: AlertTriangle, book: BookOpen, git: GitBranch,
};

/**
 * Document checklist, shared by:
 *   mode="import" - wizard step 4 (Pending docs, "Add Link", Back / Create Project)
 *   mode="edit"   - project edit tab (open + edit-link icons, Add Document, Back / Save changes)
 *   mode="view"   - project view tab (open-link icon only)
 */
export function DocumentChecklist({ mode, onBack, onSubmit }) {
  const { docs, uploadedCount, progress, setLink, addDocument } = useDocumentChecklist(mode === 'import' ? PENDING_DOCUMENTS : UPLOADED_DOCUMENTS);
  const [modal, setModal] = useState(null); // { kind: 'link' | 'edit' | 'newDoc', doc? }
  const canEdit = mode !== 'view';

  const handleModalSubmit = ({ name, url }) => {
    if (modal.kind === 'newDoc') addDocument(name, url);
    else setLink(modal.doc.id, url, { isEdit: modal.kind === 'edit' });
    setModal(null);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {modal && <DocumentLinkModal kind={modal.kind} doc={modal.doc} onClose={() => setModal(null)} onSubmit={handleModalSubmit} />}

      <Card className="overflow-hidden">
        {mode === 'import' && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <h2 className="text-sm font-semibold text-ink-primary">Document Checklist</h2>
            <ProjectContextBar {...MOCK_PROJECT_CONTEXT} />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 text-xs font-medium text-badge-success-ink">
            <span className="inline-flex items-center gap-1.5">
              {uploadedCount === docs.length && <Check className="h-3.5 w-3.5" />}
              {uploadedCount} of {docs.length} documents uploaded
            </span>
            <ProgressBar value={progress} tone="success" className="w-40" />
          </div>
          {canEdit && <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setModal({ kind: 'newDoc' })}>Add Document</Button>}
        </div>

        <Table className="min-w-[640px]">
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeaderCell>Document Name</TableHeaderCell>
              <TableHeaderCell className="text-center">Uploaded By</TableHeaderCell>
              <TableHeaderCell className="text-center">Upload Date</TableHeaderCell>
              <TableHeaderCell className="text-center">Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {docs.map((d) => {
              const Icon = DOC_ICONS[d.icon] ?? FileText;
              return (
                <TableRow key={d.id}>
                  <TableCell><span className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4 text-action-primary" aria-hidden="true" />{d.name}</span></TableCell>
                  <TableCell className="text-center text-ink-secondary">{d.uploadedBy}</TableCell>
                  <TableCell className="text-center text-ink-secondary">{d.uploadDate}</TableCell>
                  <TableCell className="text-center"><Badge variant={statusVariant(d.status)} dot size="sm">{d.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-1">
                      {d.status === 'Pending' ? (
                        <button type="button" onClick={() => setModal({ kind: 'link', doc: d })} className="inline-flex items-center gap-1 text-xs font-medium text-action-primary hover:underline">
                          <Link2 className="h-3.5 w-3.5" /> Add Link
                        </button>
                      ) : (
                        <IconButton label={`Open ${d.name}`} onClick={() => d.link && window.open(d.link, '_blank', 'noopener,noreferrer')}><ExternalLink className="h-4 w-4" /></IconButton>
                      )}
                      {mode === 'edit' && d.status !== 'Pending' && (
                        <IconButton label={`Edit link for ${d.name}`} variant="neutral" onClick={() => setModal({ kind: 'edit', doc: d })}><Pencil className="h-4 w-4" /></IconButton>
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
          <Button variant="ghost" onClick={onBack}>Back</Button>
          {mode === 'import' ? (
            <Button rightIcon={<Rocket className="h-4 w-4" />} onClick={onSubmit}>Create Project</Button>
          ) : (
            <Button onClick={onSubmit}>Save changes</Button>
          )}
        </div>
      )}
    </div>
  );
}
