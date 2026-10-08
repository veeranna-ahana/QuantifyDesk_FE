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
export function SectionCard({ icon, title, children, className, iconClassName }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Section header */}
      <div className="flex items-center gap-2 border-b border-line-card pb-2">
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-[#F5F3FF] text-action-primary', iconClassName)}>
          {icon}
        </span>
        <h3 className="text-sm font-semibold leading-[18px] text-[#1A202C]">{title}</h3>
      </div>
      {/* Body */}
      {children}
    </div>
  );
}
