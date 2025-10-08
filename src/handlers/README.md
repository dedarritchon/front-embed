# Iframe Handler System

This directory contains the iframe handler system that allows the application to provide custom functionality for different types of iframes.

## Overview

The handler system is designed to be extensible and allows you to:
- Detect specific iframe types (Google Maps, YouTube, etc.)
- Extract configuration data from iframe URLs
- Render custom UI components for each iframe type
- Update iframe URLs with new parameters

## Architecture

### Core Components

1. **IframeHandler Interface** (`../types/iframeHandlers.ts`)
   - Defines the contract that all handlers must implement
   - Includes methods for detection, configuration extraction, UI rendering, and URL updates

2. **Handler Registry** (`../utils/iframeHandlerRegistry.ts`)
   - Manages registration and lookup of handlers
   - Provides a singleton instance for global access

3. **useIframeHandler Hook** (`../hooks/useIframeHandler.ts`)
   - React hook that manages handler state and provides utilities
   - Automatically detects the appropriate handler for a given iframe source

### Handler Implementation

Each handler implements the `IframeHandler` interface:

```typescript
export interface IframeHandler {
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  canHandle: (src: string) => boolean;  // Detection logic
  extractConfig?: (src: string) => Record<string, any>;  // Extract config
  renderCustomUI?: (props: CustomUIProps) => React.ReactNode;  // Custom UI
  updateUrl?: (baseUrl: string, params: Record<string, any>) => string;  // URL updates
}
```

## Existing Handlers

### Google Maps Handler (`googleMapsHandler.ts`)
- Detects Google Maps embed URLs
- Extracts API keys from URLs
- Renders search functionality with autocomplete
- Updates URLs with new location searches

### YouTube Handler (`youtubeHandler.ts`)
- Detects YouTube embed URLs
- Extracts video IDs
- Renders simple video information
- Updates URLs with new video IDs

## Adding New Handlers

To add support for a new iframe type:

1. **Create a new handler file** (e.g., `myHandler.ts`):

```typescript
import React from 'react';
import type { IframeHandler, CustomUIProps } from '../types/iframeHandlers';

export const myHandler: IframeHandler = {
  id: 'my-service',
  name: 'My Service',
  
  canHandle: (src: string): boolean => {
    return src.includes('myservice.com/embed');
  },
  
  extractConfig: (src: string): Record<string, any> => {
    // Extract any configuration from the URL
    return {
      // Your config data
    };
  },
  
  renderCustomUI: (props: CustomUIProps): React.ReactNode => {
    // Return your custom UI component
    return React.createElement('div', {}, 'Custom UI');
  },
  
  updateUrl: (baseUrl: string, params: Record<string, any>): string => {
    // Update the URL with new parameters
    return baseUrl; // or modified URL
  },
};
```

2. **Register the handler** in `index.ts`:

```typescript
import { myHandler } from './myHandler';

// Register the handler
iframeHandlerRegistry.register(myHandler);
```

3. **The handler will automatically be used** when the MainView encounters a matching iframe source.

## Usage in Components

The handler system is automatically used in the MainView component:

```typescript
import { useIframeHandler } from '../hooks/useIframeHandler';

const { handler, customUIProps } = useIframeHandler(iframeSrc);

// Custom UI is automatically rendered if available
{handler?.renderCustomUI && handler.renderCustomUI(customUIProps)}
```

## Benefits

- **Extensible**: Easy to add support for new iframe types
- **Modular**: Each handler is self-contained
- **Type-safe**: Full TypeScript support
- **Automatic**: Handlers are automatically detected and used
- **Flexible**: Each handler can provide as much or as little functionality as needed
