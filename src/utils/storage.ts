import type {AppSettings} from '../types';

const STORAGE_KEY = 'front-embed-settings';

export const loadSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        iframeConfigs: parsed.iframeConfigs || [],
        activeIframeId: parsed.activeIframeId,
      };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  
  return {
    iframeConfigs: [],
    activeIframeId: undefined,
  };
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

export const exportSettings = (settings: AppSettings): string => {
  return JSON.stringify(settings, null, 2);
};

export const importSettings = (jsonString: string): AppSettings => {
  try {
    const parsed = JSON.parse(jsonString);
    return {
      iframeConfigs: parsed.iframeConfigs || [],
      activeIframeId: parsed.activeIframeId,
    };
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
