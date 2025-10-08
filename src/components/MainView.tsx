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
`;

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 1;
  min-width: 0;
`;

const SelectWrapper = styled.div`
  min-width: 150px;
  flex-shrink: 1;
`;

const IframeContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
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
  z-index: 10;
`;

const LoadingText = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;

const MAX_LOADING_TIME = 5000; // 5 seconds

interface MainViewProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onGoToSettings: () => void;
}

export function MainView({settings, onSettingsChange, onGoToSettings}: MainViewProps) {
  const [activeConfig, setActiveConfig] = useState<IframeConfig | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (settings.iframeConfigs.length > 0) {
      const config = settings.iframeConfigs.find(c => c.id === settings.activeIframeId) || settings.iframeConfigs[0];
      setActiveConfig(config);
      // Initialize iframe source from the embed code
      const src = extractSrcFromEmbedCode(config.embedCode);
      setCurrentSrc(src);
      setIsLoading(true); // Set loading state when iframe source changes
      // Stop loading after 3 seconds as fallback
      setTimeout(() => setIsLoading(false), MAX_LOADING_TIME);
    } else {
      setActiveConfig(null);
      setCurrentSrc('');
      setIsLoading(false);
    }
  }, [settings]);

  const handleIframeChange = (configId: string) => {
    const config = settings.iframeConfigs.find(c => c.id === configId);
    if (config) {
      setActiveConfig(config);
      const src = extractSrcFromEmbedCode(config.embedCode);
      setCurrentSrc(src);
      setIsLoading(true); // Set loading state when switching iframe configs
      // Stop loading after 3 seconds as fallback
      setTimeout(() => setIsLoading(false), MAX_LOADING_TIME);
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
      setIsLoading(true);
      // Stop loading after 3 seconds as fallback
      setTimeout(() => setIsLoading(false), MAX_LOADING_TIME);
    }
  }, [currentSrc, activeConfig]);

  const handleIframeLoad = () => {
    // Clear loading state when iframe finishes loading
    setIsLoading(false);
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
            />
            {/* Loading overlay */}
            {isLoading && (
              <LoadingContainer>
                <Loader />
                <LoadingText>Loading iframe...</LoadingText>
              </LoadingContainer>
            )}
          </>
        )}
      </IframeContainer>
    </PluginLayout>
  );
}
