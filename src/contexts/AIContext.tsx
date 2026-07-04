/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AIWarning {
  id: string;
  message: string;
  module: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface AIContextType {
  warnings: AIWarning[];
  addWarning: (warning: Omit<AIWarning, 'id' | 'timestamp'>) => void;
  dismissWarning: (id: string) => void;
  isProcessing: boolean;
  setIsProcessing: (status: boolean) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

 
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [warnings, setWarnings] = useState<AIWarning[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addWarning = (warning: Omit<AIWarning, 'id' | 'timestamp'>) => {
    const newWarning: AIWarning = {
      ...warning,
      id: `ai-warn-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setWarnings(prev => [newWarning, ...prev]);
  };

  const dismissWarning = (id: string) => {
    setWarnings(prev => prev.filter(w => w.id !== id));
  };

  return (
    <AIContext.Provider value={{ warnings, addWarning, dismissWarning, isProcessing, setIsProcessing }}>
      {children}
    </AIContext.Provider>
  );
};