import React, { createContext, useState, useContext, ReactNode } from 'react';

export type FontSize = 'small' | 'medium' | 'large';

interface SettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialFontSize = (): FontSize => {
  const storedSize = localStorage.getItem('rvr-font-size');
  if (storedSize === 'small' || storedSize === 'medium' || storedSize === 'large') {
    return storedSize;
  }
  return 'medium';
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSize>(getInitialFontSize);

  const handleSetFontSize = (size: FontSize) => {
    localStorage.setItem('rvr-font-size', size);
    setFontSize(size);
  };

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize: handleSetFontSize }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
