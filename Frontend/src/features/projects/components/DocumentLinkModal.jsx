import { Link2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

const COPY = {
  link: { title: 'Add SharePoint Link', submit: 'Add Link' },
  edit: { title: 'Edit SharePoint Link', submit: 'Save changes' },
  newDoc: { title: 'Add Document SharePoint Link', submit: 'Add Link' },
};

/**
 * One modal for the three link flows:
 *   kind="link"   - add a link to a checklist document (name locked)
 *   kind="edit"   - change an existing link
 *   kind="newDoc" - add a new document (name editable)
 */
export function DocumentLinkModal({ kind, doc, onClose, onSubmit }) {
  const [name, setName] = useState(doc?.name ?? '');
  const [url, setUrl] = useState(doc?.link ?? '');
  const copy = COPY[kind];

  const submit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit({ name: name.trim(), url: url.trim() });
  };

  return (
    <Modal
      open
      title={copy.title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="document-link-form">{copy.submit}</Button>
        </>
      }
    >
      <form id="document-link-form" onSubmit={submit} className="flex flex-col gap-4">
        {kind === 'newDoc' ? (
          <Input label="Document Name" placeholder="Code review completed" value={name} onChange={(e) => setName(e.target.value)} />
        ) : (
          <Input label="Requirement Reference" value={doc?.name ?? ''} readOnly />
        )}
        <Input label="SharePoint URL" type="url" autoFocus placeholder="https://ahana-ai.sharepoint.com/..." leadingIcon={<Link2 className="h-4 w-4" />} value={url} onChange={(e) => setUrl(e.target.value)} />
      </form>
    </Modal>
  );
}
