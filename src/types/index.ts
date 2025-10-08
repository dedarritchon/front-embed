export interface IframeConfig {
  id: string;
  name: string;
  embedCode: string;
}

export interface AppSettings {
  iframeConfigs: IframeConfig[];
  activeIframeId?: string;
}

export type View = 'main' | 'settings';

// Re-export iframe handler types
export type { IframeHandler, CustomUIProps, IframeHandlerRegistry } from './iframeHandlers';
