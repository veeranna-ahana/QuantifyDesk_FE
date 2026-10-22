// src/features/server-information/hooks/useServerForm.js
import { useState } from "react";

import {
  CPU_ERROR,
  CPU_PATTERN,
  EMPTY_SERVER_FORM,
  RAM_ERROR,
  RAM_PATTERN,
  STORAGE_ERROR,
  STORAGE_PATTERN,
} from "../constants";

/**
 * Manages form state for Add / Edit Server.
 * @param {object|null} initialServer – null for Add, server object for Edit.
 * @param {string[]} projectOptions – catalog project names (used to reject a duplicate "Other" name).
 */
export function useServerForm(initialServer = null, projectOptions = []) {
  const [values, setValues] = useState(() =>
    initialServer
      ? {
          serverName: initialServer.serverName ?? "",
          ipAddress: initialServer.ipAddress ?? "",
          ram: initialServer.ram ?? "",
          cpu: initialServer.cpu ?? "",
          storage: initialServer.storage ?? "",
          os: initialServer.os ?? "",
          environment: initialServer.environment ?? "",
          gpu: initialServer.gpu === "None" ? "" : (initialServer.gpu ?? ""),
          status: initialServer.status ?? "Active",
          assignedProjects: initialServer.assignedProjects ?? [],
          description: initialServer.description ?? "",
        }
      : { ...EMPTY_SERVER_FORM },
  );

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  // "Other (Add Project)": a project that isn't in the catalog, typed in by name
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherError, setOtherError] = useState("");

  /** Generic field setter for native input/select/textarea onChange. */
  const set = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setIsDirty(true);
  };

  /** Toggle a project in the assignedProjects array. */
  const toggleProject = (project) => {
    setValues((prev) => {
      const already = prev.assignedProjects.includes(project);
      return {
        ...prev,
        assignedProjects: already
          ? prev.assignedProjects.filter((p) => p !== project)
          : [...prev.assignedProjects, project],
      };
    });
    setIsDirty(true);
  };

  /** Remove a project tag (same as toggle, convenience alias). */
  const removeProject = (project) => toggleProject(project);

  const toggleOther = () => {
    setOtherOpen((v) => !v);
    setOtherName("");
    setOtherError("");
  };

  const changeOtherName = (value) => {
    setOtherName(value);
    if (otherError) setOtherError("");
  };

  /** Adds the typed "Other" project name as its own chip, then closes the Other box. */
  const confirmOther = () => {
    const name = otherName.trim().replace(/\s+/g, " ");
    if (!name) {
      setOtherError("Project name is required.");
      return;
    }
    const known = [...projectOptions, ...values.assignedProjects];
    if (known.some((p) => p.toLowerCase() === name.toLowerCase())) {
      setOtherError("This project is already in the list.");
      return;
    }
    setValues((prev) => ({
      ...prev,
      assignedProjects: [...prev.assignedProjects, name],
    }));
    if (errors.assignedProjects)
      setErrors((prev) => ({ ...prev, assignedProjects: undefined }));
    setIsDirty(true);
    setOtherOpen(false);
    setOtherName("");
    setOtherError("");
  };

  /** Client-side validation. Returns true if valid. */
  const validate = () => {
    const next = {};
    if (!values.serverName.trim()) next.serverName = "Server name is required.";
    if (!values.ipAddress.trim()) next.ipAddress = "IP address is required.";
    // Optional fields — only validated when something was actually typed in them.
    if (values.ram.trim() && !RAM_PATTERN.test(values.ram.trim()))
      next.ram = RAM_ERROR;
    if (values.cpu.trim() && !CPU_PATTERN.test(values.cpu.trim()))
      next.cpu = CPU_ERROR;
    if (values.storage.trim() && !STORAGE_PATTERN.test(values.storage.trim()))
      next.storage = STORAGE_ERROR;
    if (!values.os) next.os = "Operating System is required.";
    if (!values.environment) next.environment = "Environment is required.";
    if (!values.status) next.status = "Initial Status is required.";
    if (otherOpen) {
      // "Other" is ticked but the name was never confirmed with the ✓ button
      setOtherError(
        otherName.trim()
          ? "Click ✓ to add this project."
          : "Project name is required.",
      );
      next.assignedProjects = 'Add the project name for "Other", or untick it.';
    } else if (values.assignedProjects.length === 0) {
      next.assignedProjects = "At least one project must be assigned.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const reset = () => {
    setValues(
      initialServer
        ? {
            serverName: initialServer.serverName ?? "",
            ipAddress: initialServer.ipAddress ?? "",
            ram: initialServer.ram ?? "",
            cpu: initialServer.cpu ?? "",
            storage: initialServer.storage ?? "",
            os: initialServer.os ?? "",
            environment: initialServer.environment ?? "",
            gpu: initialServer.gpu === "None" ? "" : (initialServer.gpu ?? ""),
            status: initialServer.status ?? "Active",
            assignedProjects: initialServer.assignedProjects ?? [],
            description: initialServer.description ?? "",
          }
        : { ...EMPTY_SERVER_FORM },
    );
    setErrors({});
    setIsDirty(false);
    setProjectSearch("");
    setProjectDropdownOpen(false);
    setOtherOpen(false);
    setOtherName("");
    setOtherError("");
  };

  /** Fills Operating System / Environment / Initial Status from the backend defaults, only where still empty. */
  const applyDefaults = (defaults) =>
    setValues((prev) => ({
      ...prev,
      os: prev.os || defaults.operatingSystem || "",
      environment: prev.environment || defaults.environment || "",
      status: prev.status || defaults.status || "",
    }));

  return {
    values,
    errors,
    applyDefaults,
    setErrors,
    isDirty,
    set,
    toggleProject,
    removeProject,
    validate,
    reset,
    projectSearch,
    setProjectSearch,
    projectDropdownOpen,
    setProjectDropdownOpen,
    otherOpen,
    otherName,
    otherError,
    toggleOther,
    changeOtherName,
    confirmOther,
  };
}
