import React from 'react';
import type { IframeHandler, CustomUIProps } from '../types/iframeHandlers';
import { LocationSearch } from '../components/LocationSearch';

/**
 * Google Maps iframe handler
 */
export const googleMapsHandler: IframeHandler = {
  id: 'google-maps',
  name: 'Google Maps',
  
  canHandle: (src: string): boolean => {
    return src.includes('google.com/maps/embed');
  },
  
  extractConfig: (src: string): Record<string, any> => {
    const keyMatch = src.match(/key=([^&]+)/);
    return {
      apiKey: keyMatch ? keyMatch[1] : '',
    };
  },
  
  renderCustomUI: (props: CustomUIProps): React.ReactNode => {
    const { onSrcUpdate } = props;
    
    const handleLocationSelect = (location: string) => {
      const newSrc = googleMapsHandler.updateUrl?.(props.src, { location });
      if (newSrc) {
        onSrcUpdate(newSrc);
      }
    };
    
    return React.createElement(LocationSearch, {
      onLocationSelect: handleLocationSelect,
      placeholder: "Search for a location on the map...",
    });
  },
  
  updateUrl: (baseUrl: string, params: Record<string, any>): string => {
    if (!googleMapsHandler.canHandle(baseUrl)) {
      return baseUrl;
    }
    
    const { location } = params;
    if (!location) {
      return baseUrl;
    }
    
    const apiKey = googleMapsHandler.extractConfig?.(baseUrl)?.apiKey || '';
    if (!apiKey) {
      return baseUrl;
    }
    
    const encodedQuery = encodeURIComponent(location.trim());
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedQuery}&maptype=roadmap`;
  },
};
