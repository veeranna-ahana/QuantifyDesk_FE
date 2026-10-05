// src/features/server-information/components/SectionCard.jsx
import { cn } from '@/lib/cn';

/**
 * Reusable section block used inside the Add/Edit Server form card.
 * Renders an icon-prefixed section header row with a bottom divider,
 * followed by the section body. Matches the Figma "Server Information",
 * "Project Assignment", and "Additional Information" sections.
 *
 * @param {ReactNode} icon      – 16×16 lucide icon (rendered in a purple tinted box)
 * @param {string}   title      – Section heading text
 * @param {ReactNode} children  – Section body content
 * @param {string}   className  – Optional extra classes for the outer wrapper
 */
export function SectionCard({ icon, title, children, className }) {
  return (
    <div className={cn('flex flex-col', className)}>
      {/* Section header */}
      <div className="flex items-center gap-2.5 pb-3 pt-1">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-action-primary-soft text-action-primary">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-ink-primary">{title}</h3>
      </div>
      {/* Divider */}
      <div className="mb-4 h-px w-full bg-line-card" />
      {/* Body */}
      {children}
    </div>
  );
}
