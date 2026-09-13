/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface TourContextType {
  isTourRunning: boolean;
  startTour: () => void;
  stopTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourRunning, setIsTourRunning] = useState(false);

  // FIX 2.4: Race Condition bei der Product Tour beheben
  // Wir setzen die Tour kurz zurück und geben dem React-DOM 100ms Zeit, 
  // um alle Elemente fertig zu rendern, bevor die Tour ihre Ziel-Elemente sucht.
  const startTour = useCallback(() => {
    setIsTourRunning(false);
    setTimeout(() => {
      setIsTourRunning(true);
    }, 100);
  }, []);

  const stopTour = useCallback(() => setIsTourRunning(false), []);

  React.useEffect(() => {
    const handleStartTourEvent = () => {
      startTour();
    };
    window.addEventListener('start-tour', handleStartTourEvent);
    return () => {
      window.removeEventListener('start-tour', handleStartTourEvent);
    };
  }, [startTour]);


  return (
    <TourContext.Provider value={{ isTourRunning, startTour, stopTour }}>
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