import { Link2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

const COPY = {
  link: { title: "Add SharePoint Link", submit: "Add Link" },
  edit: { title: "Edit SharePoint Link", submit: "Save changes" },
  newDoc: { title: "Add Document SharePoint Link", submit: "Add Document" },
};

/**
 * One modal for the three link flows:
 *   kind="link"   - add a link to a checklist document (name locked)
 *   kind="edit"   - change an existing link
 *   kind="newDoc" - add a new document (name editable)
 */
export function DocumentLinkModal({ kind, doc, onClose, onSubmit }) {
  const [name, setName] = useState(doc?.name ?? "");
  const [url, setUrl] = useState(doc?.link ?? "");
  const [errors, setErrors] = useState({});
  const copy = COPY[kind];

  const isValidUrl = (v) => {
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (kind === "newDoc" && !name.trim())
      next.name = "Document name is required.";
    if (!url.trim()) next.url = "SharePoint URL is required.";
    else if (!isValidUrl(url.trim()))
      next.url = "Enter a valid URL starting with http:// or https://";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ name: name.trim(), url: url.trim() });
  };

  return (
    <Modal
      open
      title={copy.title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="document-link-form">
            {copy.submit}
          </Button>
        </>
      }
    >
      <form
        id="document-link-form"
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-4"
      >
        {kind === "newDoc" ? (
          <Input
            label="Document Name"
            required
            autoFocus
            placeholder="Enter document name"
            value={name}
            error={errors.name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((x) => ({ ...x, name: undefined }));
            }}
          />
        ) : (
          <Input
            label="Requirement Reference"
            value={doc?.name ?? ""}
            readOnly
          />
        )}
        <Input
          label="SharePoint URL"
          required
          type="url"
          autoFocus={kind !== "newDoc"}
          error={errors.url}
          placeholder="https://ahana-ai.sharepoint.com/..."
          leadingIcon={<Link2 className="h-4 w-4" />}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setErrors((x) => ({ ...x, url: undefined }));
          }}
        />
      </form>
    </Modal>
  );
}
