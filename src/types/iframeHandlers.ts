import React from 'react';

/**
 * Interface for iframe handlers that provide custom functionality for specific iframe types
 */
export interface IframeHandler {
  /**
   * Unique identifier for this handler
   */
  id: string;
  
  /**
   * Human-readable name for this handler
   */
  name: string;
  
  /**
   * Checks if this handler can handle the given iframe source URL
   */
  canHandle: (src: string) => boolean;
  
  /**
   * Extracts configuration data from the iframe source URL
   */
  extractConfig?: (src: string) => Record<string, any>;
  
  /**
   * Renders custom UI components for this iframe type
   */
  renderCustomUI?: (props: CustomUIProps) => React.ReactNode;
  
  /**
   * Updates the iframe source URL with new parameters
   */
  updateUrl?: (baseUrl: string, params: Record<string, any>) => string;
}

/**
 * Props passed to custom UI components
 */
export interface CustomUIProps {
  /**
   * Current iframe source URL
   */
  src: string;
  
  /**
   * Configuration data extracted from the URL
   */
  config: Record<string, any>;
  
  /**
   * Callback to update the iframe source
   */
  onSrcUpdate: (newSrc: string) => void;
  
  /**
   * Callback to update iframe parameters
   */
  onParamsUpdate: (params: Record<string, any>) => void;
}

/**
 * Registry for managing iframe handlers
 */
export interface IframeHandlerRegistry {
  /**
   * Register a new handler
   */
  register: (handler: IframeHandler) => void;
  
  /**
   * Get handler for a specific iframe source
   */
  getHandler: (src: string) => IframeHandler | null;
  
  /**
   * Get all registered handlers
   */
  getAllHandlers: () => IframeHandler[];
  
  /**
   * Unregister a handler
   */
  unregister: (handlerId: string) => void;
}
