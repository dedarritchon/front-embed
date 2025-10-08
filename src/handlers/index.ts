import { iframeHandlerRegistry } from '../utils/iframeHandlerRegistry';
import { googleMapsHandler } from './googleMapsHandler';

// Register all handlers
iframeHandlerRegistry.register(googleMapsHandler);

// Export the registry for external use
export { iframeHandlerRegistry };
export { googleMapsHandler };
