import type {AppSettings, IframeConfig} from '../types';

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

// Type validation functions
const isValidIframeConfig = (config: any): config is IframeConfig => {
  return (
    config &&
    typeof config === 'object' &&
    typeof config.id === 'string' &&
    typeof config.name === 'string' &&
    typeof config.embedCode === 'string' &&
    config.id.trim() !== '' &&
    config.name.trim() !== '' &&
    config.embedCode.trim() !== ''
  );
};

const isValidAppSettings = (settings: any): settings is AppSettings => {
  return (
    settings &&
    typeof settings === 'object' &&
    Array.isArray(settings.iframeConfigs) &&
    settings.iframeConfigs.every(isValidIframeConfig) &&
    (settings.activeIframeId === undefined || typeof settings.activeIframeId === 'string')
  );
};

export const validateImportedSettings = (jsonString: string): { isValid: boolean; error?: string; settings?: AppSettings } => {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!isValidAppSettings(parsed)) {
      return {
        isValid: false,
        error: 'Invalid settings format. Expected structure: { iframeConfigs: [{ id: string, name: string, embedCode: string }], activeIframeId?: string }'
      };
    }
    
    // Additional validation: ensure all iframe configs have unique IDs
    const ids = parsed.iframeConfigs.map((config: IframeConfig) => config.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      return {
        isValid: false,
        error: 'Invalid settings: duplicate configuration IDs found'
      };
    }
    
    // Validate that activeIframeId exists in the configs if provided
    if (parsed.activeIframeId && !parsed.iframeConfigs.some((config: IframeConfig) => config.id === parsed.activeIframeId)) {
      return {
        isValid: false,
        error: 'Invalid settings: activeIframeId does not match any configuration ID'
      };
    }
    
    return {
      isValid: true,
      settings: parsed
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid JSON format. Please check your import data.'
    };
  }
};

export const importSettings = (jsonString: string): AppSettings => {
  const validation = validateImportedSettings(jsonString);
  
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid settings format');
  }
  
  return validation.settings!;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
