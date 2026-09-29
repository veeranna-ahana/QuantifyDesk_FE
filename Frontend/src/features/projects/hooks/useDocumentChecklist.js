import toast from "react-hot-toast";

const today = () =>
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

/**
 * Document checklist state: link a SharePoint URL to a document, add a document, edit a link.
 *
 * CONTROLLED, same pattern as useTaskInfo/useEffortEstimate: `docs`/`onDocsChange` are owned by
 * the caller (the wizard hook), not local state here — the Import wizard unmounts each step's
 * component on Back/Next, so a local `useState` would silently drop every link the moment the
 * user left Step 4 and came back.
 *
 * In import mode there's no project yet to persist a link against (no project_info_id until
 * Create Project is submitted), so "adding a link" here only ever updates this in-memory table;
 * the whole `docs` array is what gets sent as `documents` in the Create Project payload, and the
 * BACKEND is what actually stamps uploaded_by/uploaded_date at that point (from the JWT's
 * emp_id, resolved to a name via master.emp) — `uploaderName` below is only a same-user preview
 * so the table doesn't look blank while the wizard is still in progress.
 */
export function useDocumentChecklist(docs, onDocsChange, uploaderName) {
  const safeDocs = docs || [];
  const uploadedCount = safeDocs.filter((d) => d.status === "Uploaded").length;
  const progress = safeDocs.length
    ? Math.round((uploadedCount / safeDocs.length) * 100)
    : 0;

  /** Attach / replace the link of an existing document. */
  const setLink = (id, url, { isEdit = false } = {}) => {
    onDocsChange(
      safeDocs.map((d) =>
        d.id === id
          ? {
              ...d,
              link: url,
              ...(isEdit
                ? {}
                : {
                    status: "Uploaded",
                    uploadedBy: uploaderName || "—",
                    uploadDate: today(),
                  }),
            }
          : d,
      ),
    );
    toast.success(
      isEdit
        ? "SharePoint link updated successfully!"
        : "Link added successfully!",
    );
  };

  /** Add a brand-new document (goes on top of the list). */
  const addDocument = (name, url) => {
    onDocsChange([
      {
        id: `custom_${Date.now()}`,
        documentId: null,
        name: name || "Custom Document",
        icon: "file-text",
        status: "Uploaded",
        uploadedBy: uploaderName || "—",
        uploadDate: today(),
        link: url,
      },
      ...safeDocs,
    ]);
    toast.success("Document added successfully!");
  };

  return { docs: safeDocs, uploadedCount, progress, setLink, addDocument };
}
