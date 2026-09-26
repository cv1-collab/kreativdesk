/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface TourContextType {
  isTourRunning: boolean;
  activeModuleTour: string | null;
  startTour: (moduleTourId?: string | React.MouseEvent | any) => void;
  stopTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [activeModuleTour, setActiveModuleTour] = useState<string | null>(null);

  // FIX 2.4: Race Condition bei der Product Tour beheben
  // Wir setzen die Tour kurz zurück und geben dem React-DOM 100ms Zeit, 
  // um alle Elemente fertig zu rendern, bevor die Tour ihre Ziel-Elemente sucht.
  const startTour = useCallback((moduleTourId?: string | React.MouseEvent | any) => {
    const actualModuleId = typeof moduleTourId === 'string' ? moduleTourId : null;
    setIsTourRunning(false);
    setActiveModuleTour(actualModuleId);
    setTimeout(() => {
      setIsTourRunning(true);
    }, 100);
  }, []);

  const stopTour = useCallback(() => {
    setIsTourRunning(false);
    setActiveModuleTour(null);
  }, []);

  React.useEffect(() => {
    const handleStartTourEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ moduleId?: string }>;
      startTour(customEvent?.detail?.moduleId);
    };
    window.addEventListener('start-tour', handleStartTourEvent);
    return () => {
      window.removeEventListener('start-tour', handleStartTourEvent);
    };
  }, [startTour]);


  return (
    <TourContext.Provider value={{ isTourRunning, activeModuleTour, startTour, stopTour }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}