// src/components/ui/Drawer/Drawer.jsx
// Mirrors @UI/src/components/ui/Drawer/Drawer.tsx
import React from 'react';

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

/**
 * Slide-in panel drawer.
 * @param {{ open: boolean, title: string, children: React.ReactNode, footer?: React.ReactNode, taskId?: string, context?: string, onClose: () => void }} props
 */
export function Drawer({ open, title, children, footer, taskId, context, onClose }) {
  if (!open) return null;

  return (
    <div className="drawer-layer">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close drawer"
        className="drawer-backdrop"
        onClick={onClose}
      />

      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="drawer-header">
          <div className="drawer-header-top">
            {taskId && <span className="drawer-task-id">{taskId}</span>}
            <button
              type="button"
              aria-label="Close drawer"
              className="drawer-close"
              onClick={onClose}
            >
              <XIcon className="drawer-close-icon" />
            </button>
          </div>

          <div className="drawer-header-bottom">
            <h2 className="drawer-title">{title}</h2>
            {context && <div className="drawer-context">{context}</div>}
          </div>
        </header>

        <div className="drawer-content">{children}</div>

        {footer && <footer className="drawer-footer">{footer}</footer>}
      </aside>
    </div>
  );
}

export default Drawer;
