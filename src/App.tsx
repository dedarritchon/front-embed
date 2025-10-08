import {useState, useEffect} from 'react';
import {createGlobalStyle} from 'styled-components';
import {DefaultStyleProvider} from '@frontapp/ui-kit';

import {MainView} from './components/MainView';
import {SettingsView} from './components/SettingsView';
import type {AppSettings, View} from './types';
import {loadSettings, saveSettings} from './utils/storage';
// Import handlers to register them
import './handlers';

// Global styles to prevent overflow issues
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }
  
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  #root {
    height: 100%;
    overflow: hidden;
  }
`;

export function App() {
  const [currentView, setCurrentView] = useState<View>('main');
  const [settings, setSettings] = useState<AppSettings>({iframeConfigs: []});

  useEffect(() => {
    // Load settings from localStorage on app start
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
  }, []);

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleGoToSettings = () => {
    setCurrentView('settings');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const handleViewIframe = (configId: string) => {
    // Set the active iframe ID and switch to main view
    const updatedSettings = {
      ...settings,
      activeIframeId: configId,
    };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    setCurrentView('main');
  };

  return (
    <DefaultStyleProvider>
      <GlobalStyle />
      {currentView === 'main' ? (
        <MainView
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onGoToSettings={handleGoToSettings}
        />
      ) : (
        <SettingsView
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onBackToMain={handleBackToMain}
          onViewIframe={handleViewIframe}
        />
      )}
    </DefaultStyleProvider>
  );
}
