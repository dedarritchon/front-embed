import {useState, useEffect} from 'react';
import styled from 'styled-components';
import {
  Button,
  Heading,
  Paragraph,
  PluginLayout,
  PluginHeader,
  VisualSizesEnum,
  Select,
  SelectItem,
  Loader,
  Icon,
} from '@frontapp/ui-kit';
import type {AppSettings, IframeConfig} from '../types';
import { useIframeHandler } from '../hooks/useIframeHandler';
import { extractSrcFromEmbedCode } from '../utils/googleMaps';

// Styled Components
const EmptyStateContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  text-align: center;
  overflow: hidden;
  box-sizing: border-box;
`;

const EmptyStateCard = styled.div`
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
  max-height: 100%;
  overflow: hidden;
`;

const EmptyStateTitle = styled.div`
  margin-bottom: 0.75rem;
`;

const EmptyStateDescription = styled.div`
  margin-bottom: 1rem;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 100%;
  overflow: hidden;
  position: relative;
  z-index: 10;
`;

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 1;
  min-width: 0;
  position: relative;
  z-index: 11;
`;

const SelectWrapper = styled.div`
  min-width: 150px;
  flex-shrink: 1;
  position: relative;
  z-index: 12;
`;

const IframeContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 0;
`;


const Iframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(248, 249, 250, 0.9);
  gap: 1rem;
  z-index: 5;
`;

const LoadingText = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;

const ErrorContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(248, 249, 250, 0.9);
  gap: 1rem;
  z-index: 5;
`;

const ErrorText = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  text-align: center;
  max-width: 300px;
`;

const MAX_LOADING_TIME = 5000; // 5 seconds

// Error types
interface IframeError {
  id: string;
  type: 'invalid_url' | 'nesting_prevention' | 'load_failed';
  message: string;
  timestamp: number;
}

// URL validation function
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    // Check if it's a valid protocol (http, https, or data)
    return ['http:', 'https:', 'data:'].includes(urlObj.protocol);
  } catch {
    // If URL constructor fails, it's not a valid URL
    return false;
  }
};

// Check if URL would cause nesting (same origin)
const wouldCauseNesting = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

interface MainViewProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onGoToSettings: () => void;
}

export function MainView({settings, onSettingsChange, onGoToSettings}: MainViewProps) {
  const [activeConfig, setActiveConfig] = useState<IframeConfig | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<IframeError[]>([]);

  // Helper functions for error management
  const addError = (type: IframeError['type'], message: string) => {
    const error: IframeError = {
      id: `${type}_${Date.now()}`,
      type,
      message,
      timestamp: Date.now(),
    };
    setErrors(prev => [...prev, error]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const clearErrorsByType = (type: IframeError['type']) => {
    setErrors(prev => prev.filter(error => error.type !== type));
  };

  useEffect(() => {
    if (settings.iframeConfigs.length > 0) {
      const config = settings.iframeConfigs.find(c => c.id === settings.activeIframeId) || settings.iframeConfigs[0];
      setActiveConfig(config);
      // Initialize iframe source from the embed code
      const src = extractSrcFromEmbedCode(config.embedCode);
      
      // Clear previous errors when changing iframe
      clearErrors();
      
      // Validate the URL
      if (!isValidUrl(src)) {
        addError('invalid_url', 'Invalid iframe URL detected. Please provide a valid URL (http/https) or fix the embed code.');
        setCurrentSrc('');
        setIsLoading(false);
      } else if (wouldCauseNesting(src)) {
        addError('nesting_prevention', 'This URL would cause the app to nest itself. Please use a different URL.');
        setCurrentSrc('');
        setIsLoading(false);
      } else {
        setCurrentSrc(src);
        setIsLoading(true); // Set loading state when iframe source changes
        // Stop loading after 3 seconds as fallback
        setTimeout(() => setIsLoading(false), MAX_LOADING_TIME);
      }
    } else {
      setActiveConfig(null);
      setCurrentSrc('');
      setIsLoading(false);
      clearErrors();
    }
  }, [settings]);

  const handleIframeChange = (configId: string) => {
    // Don't allow selecting the same iframe that's currently selected
    if (configId === activeConfig?.id) {
      return;
    }
    
    const config = settings.iframeConfigs.find(c => c.id === configId);
    if (config) {
      setActiveConfig(config);
      const src = extractSrcFromEmbedCode(config.embedCode);
      
      // Clear previous errors when switching iframe configs
      clearErrors();
      
      // Validate the URL
      if (!isValidUrl(src)) {
        addError('invalid_url', 'Invalid iframe URL detected. Please provide a valid URL (http/https) or fix the embed code.');
        setCurrentSrc('');
        setIsLoading(false);
      } else if (wouldCauseNesting(src)) {
        addError('nesting_prevention', 'This URL would cause the app to nest itself. Please use a different URL.');
        setCurrentSrc('');
        setIsLoading(false);
      } else {
        setCurrentSrc(src);
        setIsLoading(true); // Set loading state when switching iframe configs
        // Stop loading after 3 seconds as fallback
        setTimeout(() => setIsLoading(false), MAX_LOADING_TIME);
      }
      
      const updatedSettings = {
        ...settings,
        activeIframeId: configId,
      };
      onSettingsChange(updatedSettings);
    }
  };

  // Use the iframe handler hook
  const { handler, customUIProps } = useIframeHandler(currentSrc, setCurrentSrc);

  // Set loading state when iframe source changes (e.g., from handler updates)
  useEffect(() => {
    if (currentSrc && activeConfig) {
      // Clear previous load errors when iframe source changes
      clearErrorsByType('load_failed');
      
      // Validate the URL when it changes
      if (!isValidUrl(currentSrc)) {
        addError('invalid_url', 'Invalid iframe URL detected. Please provide a valid URL (http/https) or fix the embed code.');
        setIsLoading(false);
      } else if (wouldCauseNesting(currentSrc)) {
        addError('nesting_prevention', 'This URL would cause the app to nest itself. Please use a different URL.');
        setIsLoading(false);
      } else {
        setIsLoading(true);
        // Stop loading after 3 seconds as fallback
        setTimeout(() => setIsLoading(false), MAX_LOADING_TIME);
      }
    }
  }, [currentSrc, activeConfig]);

  const handleIframeLoad = () => {
    // Clear loading state when iframe finishes loading
    setIsLoading(false);
    // Clear any previous load errors on successful load
    clearErrorsByType('load_failed');
  };

  const handleIframeError = () => {
    // Handle iframe loading errors
    setIsLoading(false);
    addError('load_failed', 'Failed to load iframe. Please check the URL or try refreshing.');
    console.error('Iframe failed to load:', currentSrc);
  };

  if (settings.iframeConfigs.length === 0) {
    return (
      <PluginLayout>
        <PluginHeader actions={<Button type="icon" onClick={onGoToSettings}><Icon name="Gear" /></Button>}>
            {' '}
        </PluginHeader>
        <EmptyStateContainer>
          <EmptyStateCard>
            <EmptyStateTitle>
              <Heading size={VisualSizesEnum.LARGE}>
                No Iframe Configs Found
              </Heading>
            </EmptyStateTitle>
            <EmptyStateDescription>
              <Paragraph color="#6c757d">
                You need to configure your iframe settings first. Click the button below to go to settings and add your iframe configurations.
              </Paragraph>
            </EmptyStateDescription>
            <Button type="primary" onClick={onGoToSettings}>
              Go to Settings
            </Button>
          </EmptyStateCard>
        </EmptyStateContainer>
      </PluginLayout>
    );
  }

  return (
    <PluginLayout>
      <PluginHeader 
        actions={
          <HeaderContent>
            <SelectContainer>
              <SelectWrapper>
                <Select
                  selectedValues={activeConfig?.name || ''}
                  placeholder="Select iframe config"
                  maxWidth={200}
                >
                  {settings.iframeConfigs.map((config) => (
                    <SelectItem
                      key={config.id}
                      onClick={() => handleIframeChange(config.id)}
                      isSelected={config.id === activeConfig?.id}
                    >
                      {config.name}
                    </SelectItem>
                  ))}
                </Select>
              </SelectWrapper>
            </SelectContainer>
            <Button type="icon" onClick={onGoToSettings}><Icon name="Gear" /></Button>
          </HeaderContent>
        }
      >
        {' '}
      </PluginHeader>

      {/* Iframe content */}
      <IframeContainer>
        {activeConfig && (
          <>
            {/* Custom UI from handler */}
            {handler?.renderCustomUI && handler.renderCustomUI(customUIProps)}
            <Iframe
              src={currentSrc}
              title={activeConfig.name}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
            {/* Loading overlay */}
            {isLoading && (
              <LoadingContainer>
                <Loader />
                <LoadingText>Loading iframe...</LoadingText>
              </LoadingContainer>
            )}
            {/* Error overlay */}
            {errors.length > 0 && (
              <ErrorContainer>
                <Icon name="WarningFilled" size={24} color="#dc3545" />
                <ErrorText>
                  {errors.map((error, index) => (
                    <div key={error.id}>
                      {error.message}
                      {index < errors.length - 1 && <br />}
                    </div>
                  ))}
                </ErrorText>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {errors.some(error => error.type === 'load_failed') && (
                    <Button 
                      type="secondary" 
                      onClick={() => {
                        clearErrorsByType('load_failed');
                        setIsLoading(true);
                        // Force reload by updating the src
                        const currentSrcCopy = currentSrc;
                        setCurrentSrc('');
                        setTimeout(() => setCurrentSrc(currentSrcCopy), 100);
                      }}
                    >
                      Retry
                    </Button>
                  )}
                  {errors.some(error => error.type === 'invalid_url' || error.type === 'nesting_prevention') && (
                    <Button 
                      type="primary" 
                      onClick={onGoToSettings}
                    >
                      Go to Settings
                    </Button>
                  )}
                </div>
              </ErrorContainer>
            )}
          </>
        )}
      </IframeContainer>
    </PluginLayout>
  );
}
