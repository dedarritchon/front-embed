import {useState} from 'react';
import styled from 'styled-components';
import {
  Button,
  Heading,
  Input,
  Paragraph,
  PluginLayout,
  PluginHeader,
  Textarea,
  VisualSizesEnum,
  Icon,
  ButtonGroup,
  Tooltip,
  TooltipCoordinator,
  FormField,
} from '@frontapp/ui-kit';
import type {IframeConfig, AppSettings} from '../types';
import {generateId, exportSettings, importSettings} from '../utils/storage';

// Styled Components

const ConfigContainer = styled.div`
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
  box-sizing: border-box;
  max-width: 100%;
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
`;



const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const ConfigsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
`;

const ConfigCard = styled.div`
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  background-color: white;
  transition: all 0.2s ease;

  &:hover {
    border-color:rgb(194, 194, 194);
    scale: 1.01;
  }

  overflow: hidden;
`;

const ConfigHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ConfigName = styled.strong`
  font-size: 1.1rem;
  color: #495057;
`;

const ConfigActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ConfigCode = styled.div`
  background-color:rgb(233, 233, 233);
  font-size: 0.9em;
  color: #6c757d;
  word-break: break-all;
  font-family: monospace;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  overflow-wrap: break-word;
  max-width: 100%;
  box-sizing: border-box;
  max-height: 100px;
  word-wrap: break-word;
  overflow-y: hidden;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
`;

const EmptyStateText = styled.div`
  font-size: 1.1rem;
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(3px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalBody = styled.div`
  margin-bottom: 2rem;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ConfigsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface SettingsViewProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onBackToMain: () => void;
}

export function SettingsView({settings, onSettingsChange, onBackToMain}: SettingsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<IframeConfig | null>(null);
  const [newConfig, setNewConfig] = useState({name: '', embedCode: ''});
  const [importText, setImportText] = useState('');

  const openAddModal = () => {
    setEditingConfig(null);
    setNewConfig({name: '', embedCode: ''});
    setShowModal(true);
  };

  const openEditModal = (config: IframeConfig) => {
    setEditingConfig(config);
    setNewConfig({name: config.name, embedCode: config.embedCode});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingConfig(null);
    setNewConfig({name: '', embedCode: ''});
  };

  const openImportModal = () => {
    setImportText('');
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportText('');
  };

  const handleSaveConfig = () => {
    if (newConfig.name.trim() && newConfig.embedCode.trim()) {
      if (editingConfig) {
        // Update existing config
        const updatedConfigs = settings.iframeConfigs.map(config =>
          config.id === editingConfig.id
            ? {...config, name: newConfig.name.trim(), embedCode: newConfig.embedCode.trim()}
            : config
        );
        
        const updatedSettings = {
          ...settings,
          iframeConfigs: updatedConfigs,
        };
        
        onSettingsChange(updatedSettings);
      } else {
        // Add new config
        const config: IframeConfig = {
          id: generateId(),
          name: newConfig.name.trim(),
          embedCode: newConfig.embedCode.trim(),
        };
        
        const updatedSettings = {
          ...settings,
          iframeConfigs: [...settings.iframeConfigs, config],
          activeIframeId: settings.iframeConfigs.length === 0 ? config.id : settings.activeIframeId,
        };
        
        onSettingsChange(updatedSettings);
      }
      
      closeModal();
    }
  };


  const handleDeleteConfig = (id: string) => {
    const updatedConfigs = settings.iframeConfigs.filter(config => config.id !== id);
    const updatedSettings = {
      ...settings,
      iframeConfigs: updatedConfigs,
      activeIframeId: settings.activeIframeId === id ? updatedConfigs[0]?.id : settings.activeIframeId,
    };
    
    onSettingsChange(updatedSettings);
  };

  const handleExport = () => {
    const exportData = exportSettings(settings);
    navigator.clipboard.writeText(exportData).then(() => {
      alert('Settings copied to clipboard!');
    });
  };

  const handleImport = () => {
    try {
      const importedSettings = importSettings(importText);
      onSettingsChange(importedSettings);
      closeImportModal();
      alert('Settings imported successfully!');
    } catch (error) {
      alert('Invalid JSON format. Please check your import data.');
    }
  };


  return (
    <PluginLayout>
      <PluginHeader 
        onBackClick={onBackToMain}
      >
        Settings
      </PluginHeader>
      <ConfigsContainer>
          <ConfigContainer>
            <SectionTitle>
              <ButtonGroup>
                <TooltipCoordinator
                  renderTooltip={() => <Tooltip placement="bottom">Add new configuration</Tooltip>}
                >
                  <Button type="icon" onClick={openAddModal}><Icon name="Plus" /></Button>
                </TooltipCoordinator>
                <TooltipCoordinator
                  renderTooltip={() => <Tooltip placement="bottom">Export settings to clipboard</Tooltip>}
                >
                  <Button type="icon" onClick={handleExport}><Icon name="Export" /></Button>
                </TooltipCoordinator>
                <TooltipCoordinator
                  renderTooltip={() => <Tooltip placement="bottom">Import settings from JSON</Tooltip>}
                >
                  <Button type="icon" onClick={openImportModal}><Icon name="Import" /></Button>
                </TooltipCoordinator>
              </ButtonGroup>
            </SectionTitle>
            {settings.iframeConfigs.length === 0 ? (
              <EmptyState>
                <EmptyStateText>
                  <Paragraph color="#666">
                    No iframe configurations yet. Click the + button to add your first one!
                  </Paragraph>
                </EmptyStateText>
              </EmptyState>
            ) : (
              <ConfigsList>
                {settings.iframeConfigs.map((config) => (
                  <ConfigCard key={config.id}>
                    <ConfigHeader>
                      <ConfigName>{config.name}</ConfigName>
                      <ConfigActions>
                        <Button type="icon" onClick={() => openEditModal(config)}>
                          <Icon name="Edit" />
                        </Button>
                        <Button type="icon" onClick={() => handleDeleteConfig(config.id)}>
                          <Icon name="Trash" />
                        </Button>
                      </ConfigActions>
                    </ConfigHeader>
                    <ConfigCode>
                      {config.embedCode.substring(0, 120)}
                      {config.embedCode.length > 120 && '...'}
                    </ConfigCode>
                  </ConfigCard>
                ))}
              </ConfigsList>
            )}
          </ConfigContainer>

      </ConfigsContainer>

      {/* Modal */}
        {showModal && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <Heading size={VisualSizesEnum.MEDIUM}>
                  {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
                </Heading>
              </ModalHeader>
              
              <ModalBody>
                <InputGroup>
                  <FormField
                    label="Configuration Name"
                    hint="Enter a descriptive name for this configuration (e.g., 'Dashboard', 'Analytics')"
                    isRequired
                  >
                    <Input
                      placeholder="Configuration name (e.g., 'Dashboard', 'Analytics')"
                      value={newConfig.name}
                      onChange={(value) => setNewConfig({...newConfig, name: value})}
                    />
                  </FormField>
                </InputGroup>
                <FormField
                  label="Iframe Embed Code"
                  hint="Paste your complete iframe embed code here"
                  isRequired
                >
                  <Textarea
                    placeholder="Paste your iframe embed code here..."
                    value={newConfig.embedCode}
                    onChange={(value) => setNewConfig({...newConfig, embedCode: value})}
                    rows={8}
                  />
                </FormField>
              </ModalBody>
              
              <ModalFooter>
                <Button type="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleSaveConfig}
                  isDisabled={!newConfig.name.trim() || !newConfig.embedCode.trim()}
                >
                  {editingConfig ? 'Update' : 'Add'} Configuration
                </Button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ModalOverlay onClick={closeImportModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <Heading size={VisualSizesEnum.MEDIUM}>
                  Import Settings
                </Heading>
              </ModalHeader>
              
              <ModalBody>
                <FormField
                  label="JSON Settings"
                  hint="Paste your exported JSON settings here to import configurations"
                  isRequired
                >
                  <Textarea
                    placeholder="Paste your exported JSON settings here..."
                    value={importText}
                    onChange={setImportText}
                    rows={8}
                  />
                </FormField>
              </ModalBody>
              
              <ModalFooter>
                <Button type="secondary" onClick={closeImportModal}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleImport}
                  isDisabled={!importText.trim()}
                >
                  Import Settings
                </Button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
    </PluginLayout>
  );
}
