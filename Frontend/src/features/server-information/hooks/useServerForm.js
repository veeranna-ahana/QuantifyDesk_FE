// src/features/server-information/hooks/useServerForm.js
import { useState } from 'react';

import { EMPTY_SERVER_FORM } from '../constants';

/**
 * Manages form state for Add / Edit Server.
 * @param {object|null} initialServer – null for Add, server object for Edit.
 */
export function useServerForm(initialServer = null) {
  const [values, setValues] = useState(() =>
    initialServer
      ? {
          serverName: initialServer.serverName ?? '',
          ipAddress: initialServer.ipAddress ?? '',
          ram: initialServer.ram ?? '',
          cpu: initialServer.cpu ?? '',
          storage: initialServer.storage ?? '',
          os: initialServer.os ?? '',
          environment: initialServer.environment ?? '',
          gpu: initialServer.gpu === 'None' ? '' : (initialServer.gpu ?? ''),
          status: initialServer.status ?? 'Active',
          assignedProjects: initialServer.assignedProjects ?? [],
          description: initialServer.description ?? '',
        }
      : { ...EMPTY_SERVER_FORM },
  );

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

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

  /** Client-side validation. Returns true if valid. */
  const validate = () => {
    const next = {};
    if (!values.serverName.trim()) next.serverName = 'Server name is required.';
    if (!values.ipAddress.trim()) next.ipAddress = 'IP address is required.';
    if (!values.os) next.os = 'Operating System is required.';
    if (!values.environment) next.environment = 'Environment is required.';
    if (!values.status) next.status = 'Initial Status is required.';
    if (values.assignedProjects.length === 0)
      next.assignedProjects = 'At least one project must be assigned.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const reset = () => {
    setValues(initialServer
      ? {
          serverName: initialServer.serverName ?? '',
          ipAddress: initialServer.ipAddress ?? '',
          ram: initialServer.ram ?? '',
          cpu: initialServer.cpu ?? '',
          storage: initialServer.storage ?? '',
          os: initialServer.os ?? '',
          environment: initialServer.environment ?? '',
          gpu: initialServer.gpu === 'None' ? '' : (initialServer.gpu ?? ''),
          status: initialServer.status ?? 'Active',
          assignedProjects: initialServer.assignedProjects ?? [],
          description: initialServer.description ?? '',
        }
      : { ...EMPTY_SERVER_FORM });
    setErrors({});
    setIsDirty(false);
    setProjectSearch('');
    setProjectDropdownOpen(false);
  };

  return {
    values,
    errors,
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
  };
}
