import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge our custom token utilities so `cn('h-control-md', 'h-control-lg')`
// resolves the conflict instead of keeping both classes.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      h: [{ h: ['control-sm', 'control-md', 'control-lg', 'table-head', 'header'] }],
      rounded: [{ rounded: ['control', 'chip'] }],
    },
  },
});

/**
 * Merge class names and resolve conflicting Tailwind utilities.
 * Every components/ui component takes a `className` escape hatch merged through this.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
