import { useMemo } from 'react';
import type { CustomUIProps } from '../types/iframeHandlers';
import { iframeHandlerRegistry } from '../utils/iframeHandlerRegistry';

/**
 * Hook for managing iframe handlers
 */
export const useIframeHandler = (src: string, onSrcUpdate?: (newSrc: string) => void) => {
  // Get the appropriate handler for the current source
  const handler = useMemo(() => {
    return iframeHandlerRegistry.getHandler(src);
  }, [src]);
  
  // Extract configuration from the source URL
  const config = useMemo(() => {
    return handler?.extractConfig?.(src) || {};
  }, [handler, src]);
  
  // Update the iframe source
  const updateSrc = (newSrc: string) => {
    if (onSrcUpdate) {
      onSrcUpdate(newSrc);
    }
  };
  
  // Update iframe parameters
  const updateParams = (params: Record<string, any>) => {
    if (handler?.updateUrl) {
      const newSrc = handler.updateUrl(src, params);
      updateSrc(newSrc);
    }
  };
  
  // Create custom UI props
  const customUIProps: CustomUIProps = {
    src: src,
    config,
    onSrcUpdate: updateSrc,
    onParamsUpdate: updateParams,
  };
  
  return {
    handler,
    config,
    updateSrc,
    updateParams,
    customUIProps,
  };
};
