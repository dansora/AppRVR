import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ModalContextType {
  isModalOpen: boolean;
  registerModal: () => void;
  unregisterModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalCount, setModalCount] = useState(0);

  const registerModal = useCallback(() => {
    setModalCount(count => count + 1);
  }, []);

  const unregisterModal = useCallback(() => {
    setModalCount(count => Math.max(0, count - 1));
  }, []);

  const isModalOpen = modalCount > 0;

  return (
    <ModalContext.Provider value={{ isModalOpen, registerModal, unregisterModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
