import React, { useState, useEffect } from 'react';
import SystemHandbookModal from './SystemHandbookModal';

export default function GlobalSystemHandbookModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-system-handbook', handleOpen);
    return () => window.removeEventListener('open-system-handbook', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <SystemHandbookModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}
