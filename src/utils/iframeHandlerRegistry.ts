import type { IframeHandler, IframeHandlerRegistry } from '../types/iframeHandlers';

/**
 * Implementation of the iframe handler registry
 */
class HandlerRegistry implements IframeHandlerRegistry {
  private handlers: Map<string, IframeHandler> = new Map();

  register(handler: IframeHandler): void {
    this.handlers.set(handler.id, handler);
  }

  getHandler(src: string): IframeHandler | null {
    for (const handler of this.handlers.values()) {
      if (handler.canHandle(src)) {
        return handler;
      }
    }
    return null;
  }

  getAllHandlers(): IframeHandler[] {
    return Array.from(this.handlers.values());
  }

  unregister(handlerId: string): void {
    this.handlers.delete(handlerId);
  }
}

// Create and export a singleton instance
export const iframeHandlerRegistry = new HandlerRegistry();
