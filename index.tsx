import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AudioProvider } from './contexts/AudioContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ModalProvider } from './contexts/ModalContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <SettingsProvider>
        <AudioProvider>
          <ProfileProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </ProfileProvider>
        </AudioProvider>
      </SettingsProvider>
    </LanguageProvider>
  </React.StrictMode>
);