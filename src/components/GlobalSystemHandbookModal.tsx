import React, { useState, useEffect, Suspense, lazy } from 'react';

const SystemHandbookModal = lazy(() => import('./SystemHandbookModal'));

export default function GlobalSystemHandbookModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-system-handbook', handleOpen);
    return () => window.removeEventListener('open-system-handbook', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <Suspense fallback={null}>
      <SystemHandbookModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </Suspense>
  );
}
