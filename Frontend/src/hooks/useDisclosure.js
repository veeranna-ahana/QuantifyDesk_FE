import { useCallback, useState } from 'react';

/** Open/close boolean state (mobile sidebar, modals, drawers). */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((p) => !p), []);
  return { isOpen, open, close, toggle };
}
