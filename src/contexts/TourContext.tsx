/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect, useMemo } from 'react';

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
  const timeoutRef = useRef<any>(null);

  const stopTour = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTourRunning(false);
    setActiveModuleTour(null);
  }, []);

  const startTour = useCallback((moduleTourId?: string | React.MouseEvent | any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const actualModuleId = typeof moduleTourId === 'string' ? moduleTourId : null;
    setIsTourRunning(false);
    setActiveModuleTour(actualModuleId);
    timeoutRef.current = setTimeout(() => {
      setIsTourRunning(true);
    }, 100);
  }, []);

  useEffect(() => {
    const handleStartTourEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ moduleId?: string }>;
      startTour(customEvent?.detail?.moduleId);
    };
    window.addEventListener('start-tour', handleStartTourEvent);
    return () => {
      window.removeEventListener('start-tour', handleStartTourEvent);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [startTour]);

  const value = useMemo(() => ({
    isTourRunning,
    activeModuleTour,
    startTour,
    stopTour
  }), [isTourRunning, activeModuleTour, startTour, stopTour]);

  return (
    <TourContext.Provider value={value}>
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